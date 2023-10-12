import time
import server.api as api
import server.blacklist as blacklist
import requests
import os
from utils import i, d
import utils as utils
import json
from flask import Flask, send_file, request, jsonify
from flask_socketio import SocketIO

import val

app = Flask(__name__)
socketio = SocketIO(app)


@app.route("/")
def index():
    return send_file("index.html")


@app.route("/customer")
def chat_page():
    return send_file("customer.html")


@app.route("/service")
def service_page():
    return send_file("service.html")


@app.route("/chatbot")
def chatbot_page():
    return send_file("chatbot.html")


@socketio.on("message")
def handle_message(message):
    d(f"메시지 받음: {message}")
    text = message["text"]

    # from이 customer일 때
    if message["from"] == "customer":
        # blacklist.json에 고객의 아이디가 있는지 확인
        id = val.TEST_CUSTOMER_ID
        if check_blacklist(id):
            return

        message["refined"] = False  # 순화 여부 초기화
        if is_negative(text):
            message["text"] = refine_text(text)
            message["refined"] = True
            if not check_patience():
                return

    socketio.emit("message", message)


def check_blacklist(id):
    # 아이디가 blacklist.json에 있으면 notify를 보내고 True를 반환
    if id in blacklist.get():
        socketio.emit(
            "notify",
            {
                "text": f"고객님의 과거의 부적절한 언행이 계속되어 챗봇에게 넘겨집니다.",
                "to": "customer",
                "action": "chatbot",
            },
        )
        return True
    return False


def is_negative(text):
    # 문장 감정 점수 요청
    sentiment_score = api.sentiment_score(text)
    d(f"감정 점수: {sentiment_score}")

    # 감정 점수가 임계값 이하일때 문장 순화 요청
    return sentiment_score <= val.NEGATIVE_THRESHOLD


def refine_text(text):
    refined_text = api.refine_text(text)
    d(f"순화된 문장: {refined_text}")
    return refined_text


def check_patience():
    """
    참았으면 True, 참지 못했으면 False를 반환합니다.
    """
    global patient_cnt
    patient_cnt += 1
    if is_service_angry():
        # 참을 수 있는 횟수를 초과했을 때 고객을 챗봇으로 넘겨줌
        socketio.emit(
            "notify",
            {
                "text": f"고객의 부적절한 언행이 {val.SERVICE_PATIENT_LIMIT}회 초과되어 챗봇에게 넘겨졌습니다.",
                "to": "customer",
                "action": "chatbot",
            },
        )

        # blacklist.json에 고객의 아이디("customer1")를 추가
        blacklist.add(val.TEST_CUSTOMER_ID)
        return False
    return True


def is_service_angry():
    # 상담사 (service)의 참을성을 초과했는지 여부를 반환합니다.
    return patient_cnt > val.SERVICE_PATIENT_LIMIT


@socketio.on("notify")
def onNotify(data):
    d(f"socket(notify): {data}")
    socketio.emit("notify", data)


@app.route("/chat", methods=["POST"])
def chat_response():
    """
    요청이 들어오면 챗봇이 적절한 답변을 보냅니다.
    """
    data = request.get_json()
    d(f"/chat: {data}")

    # 사용자가 보낸 메시지
    user_msg = data["text"]
    chatbot_response = api.chatbot_response(user_msg)

    d(f"챗봇 응답: {chatbot_response}")
    response = {"text": chatbot_response}
    return jsonify(response), 200


def setup():
    # 생성해야 할 폴더 리스트
    dirs = [
        val.LOG_DIR,
        val.DATA_DIR,
        val.CONVERSATIONS_DIR,
    ]

    # 폴더 생성
    for directory in dirs:
        utils.mkdirs(directory)

    # blacklist.json 파일 생성
    if not os.path.exists("data/blacklist.json"):
        with open("data/blacklist.json", "w", encoding="utf-8") as f:
            json.dump({"id": []}, f, ensure_ascii=False, indent="\t")

    # 참은 횟수 초기화
    global patient_cnt
    patient_cnt = 0


if __name__ == "__main__":
    # 설정
    setup()

    i(f"{val.PROJECT_NAME} 서버가 {val.PORT}포트에서 시작됩니다.")
    app.run(debug=True, host="0.0.0.0", port=val.PORT)
    i(f"{val.PROJECT_NAME} 서버 종료됨")


"""
data/blacklist.json에다가 참을성이 초과된 민원인의 아이디를 기록하고, 
상담요청이 올 시 채팅이 불가능하도록 설정.

형식
{
"id": ["id1", "id2", "id3"]
}
"""
