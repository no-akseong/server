from flask import Flask, render_template
from utils import i, d
import utils
import val

app = Flask(__name__)

@app.route('/')
def index():
    d("debug")
    i("info")
    return render_template('index.html')

def setup():
    # logs 폴더 생성
    utils.mkdirs(val.LOG_DIR)

if __name__ == '__main__':
    setup()
    port = 9999
    i(f"서버가 {port}포트에서 시작됩니다.")
    app.run(debug=True, host='0.0.0.0', port=port)
