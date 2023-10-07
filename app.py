import os
from nonegative.bot.bot import Chatbot
from nonegative.utils import i, d
import nonegative.utils as utils
from nonegative.bot.agent import agent
import json
from flask import Flask, send_file, request, jsonify
from flask_socketio import SocketIO

import val

app = Flask(__name__)
socketio = SocketIO(app)

@app.route('/')
def index():
    return send_file('index.html')

@app.route('/customer')
def chat_page():
    return send_file('customer.html')

@app.route('/service')
def service_page():
    return send_file('service.html')

@app.route('/chatbot')
def chatbot_page():
    return send_file('chatbot.html')



@socketio.on('message')
def handle_message(message):
    d(f"메시지 받음: {message}")
    socketio.emit('message', message)  # 받은 메시지를 모든 클라이언트에게 전송


@socketio.on('passToChatbot')
def onPassToChatbot(msg):
    d(f"메시지 받음: {msg}")
    socketio.emit('passToChatbot', msg)

@app.route('/chat', methods=['POST'])
def chat_response():
    """
    요청이 들어오면 챗봇이 적절한 답변을 보냅니다.
    """
    data = request.get_json()
    d(f"/chat: {data}")

    # 사용자가 보낸 메시지
    user_msg = data['text']
    msg = chatbot(user_msg)['output']

    response = {"text": msg}
    return jsonify(response), 200

def setup():
    # API 키 설정
    os.environ['OPENAI_API_KEY'] = val.OPENAI_API_KEY

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

if __name__ == '__main__':
    setup()

    # 챗봇 생성
    chatbot = agent()# Byte-compiled / optimized / DLL files
    i(f"서버가 {val.PORT}포트에서 시작됩니다.")
    app.run(debug=True, host='0.0.0.0', port=val.PORT)
    i(f"서버 종료됨")
