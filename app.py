from flask import Flask, render_template, send_file
from flask_socketio import SocketIO
from utils import i, d
import utils
import val

app = Flask(__name__)
socketio = SocketIO(app)

@app.route('/')
def index():
    return send_file('templates/index.html')

@socketio.on('message')
def handle_message(message):
    socketio.emit('message', message)  # 받은 메시지를 모든 클라이언트에게 전송

def setup():
    # logs 폴더 생성
    utils.mkdirs(val.LOG_DIR)

if __name__ == '__main__':
    setup()
    port = 9999
    i(f"서버가 {port}포트에서 시작됩니다.")
    app.run(debug=True, host='0.0.0.0', port=port)
