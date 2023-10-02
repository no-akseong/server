import json
from flask import Flask, send_file
from flask_socketio import SocketIO
from utils import i, d
import utils
import val

app = Flask(__name__)
socketio = SocketIO(app)

@app.route('/')
def index():
    return send_file('index.html')

@app.route('/customer')
def chat():
    return send_file('customer.html')

@app.route('/service')
def service():
    return send_file('service.html')

@socketio.on('message')
def handle_message(message):
    i(f"메시지 받음: {message}")
    i(f"{type(message)}")
    # 받은 메세지 json으로 변환

    socketio.emit('message', message)  # 받은 메시지를 모든 클라이언트에게 전송

def setup():
    # logs 폴더 생성
    utils.mkdirs(val.LOG_DIR)

if __name__ == '__main__':
    setup()
    port = 11111
    i(f"서버가 {port}포트에서 시작됩니다.")
    app.run(debug=True, host='0.0.0.0', port=port)
