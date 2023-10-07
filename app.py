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
        message["refined"] = False  # 순화 여부 초기화
        data = json.dumps({"text": text})
        headers = {"Content-Type": "application/json; charset=utf-8"}

        # 문장 감정 점수 요청
        url = val.FILTERING_SERVER + "/sentiment"
        response = requests.post(url, data=data, headers=headers)

        sentiment_score = 1.0  # 만약 감정 점수를 받아오지 못하면 1.0으로 설정후 순화를 하지 않음
        if response.status_code == 200:
            sentiment_score = json.loads(response.content)["score"]
        else:
            d("감정 점수를 받아오지 못했습니다.")

        d(f"감정 점수: {sentiment_score}")

        # 감정 점수가 임계값보다 낮으면 문장 순화 요청
        if sentiment_score < val.NEGATIVE_THRESHOLD:
            url = val.FILTERING_SERVER + "/refine_text"
            data = json.dumps({"text": text})
            response = requests.post(url, data=data, headers=headers)
            if response.status_code == 200:
                refined_text = json.loads(response.content)["refined_text"]
                d(f"순화된 문장: {refined_text}")
                message["text"] = refined_text
                message["refined"] = True

    socketio.emit("message", message)  # 받은 메시지를 모든 클라이언트에게 전송


@socketio.on("passToChatbot")
def onPassToChatbot(msg):
    d(f"메시지 받음: {msg}")
    socketio.emit("passToChatbot", msg)


@app.route("/chat", methods=["POST"])
def chat_response():
    """
    요청이 들어오면 챗봇이 적절한 답변을 보냅니다.
    """
    data = request.get_json()
    d(f"/chat: {data}")

    # 사용자가 보낸 메시지
    user_msg = data["text"]
    chatbot_response = "챗봇이 응답하지 못했습니다."

    # 서버로 챗봇의 응답 요청
    url = val.FILTERING_SERVER + "/chat"
    data = json.dumps({"text": user_msg})
    headers = {"Content-Type": "application/json; charset=utf-8"}
    response = requests.post(url, data=data, headers=headers)
    if response.status_code == 200:
        chatbot_response = json.loads(response.content.decode("unicode_escape"))["text"]

    d(f"챗봇 응답: {chatbot_response}")
    response = {"text": chatbot_response}
    return jsonify(response), 200


def setup():
    # API 키 설정
    os.environ["OPENAI_API_KEY"] = val.OPENAI_API_KEY

    # 생성해야 할 폴더 리스트
    dirs = [
        val.LOG_DIR,
        val.RES_DIR,
        val.RES_DOCS_DIR,
        val.DATA_DIR,
        val.CONVERSATIONS_DIR,
        val.DOCS_VECTOR_DB_DIR,
    ]

    # 폴더 생성
    for directory in dirs:
        utils.mkdirs(directory)


if __name__ == "__main__":
    setup()

    i(f"서버가 {val.PORT}포트에서 시작됩니다.")
    app.run(debug=True, host="0.0.0.0", port=val.PORT)
    i(f"서버 종료됨")
