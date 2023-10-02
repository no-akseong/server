function logMessage(message, sender, location) {
    // 현재 시간을 가져오기
    let currentTime = new Date().toLocaleTimeString();

    let msgLocationClass = "chat-message-left pb-4";
    if (location == "right") {
        msgLocationClass = "chat-message-right mb-4"
    }

    // HTML 코드의 {time}과 {msg}를 현재 시간과 메시지로 치환하고 messages div에 추가
    let html = `
    <!-- 메세지 -->
    <div id="message">
        <div class="${msgLocationClass}">
            <div id="profile">
                <img src="https://bootdey.com/img/Content/avatar/avatar1.png"
                    class="rounded-circle mr-1"
                    alt="Chris Wood"
                    width="40"
                    height="40"
                    id="avatar"
                />
                <div class="text-muted small text-nowrap mt-2"
                    id="time"
                >
                    ${currentTime}
                </div>
            </div>
            <div id="content"
                class="flex-shrink-1 bg-light rounded py-2 px-3 mr-3"
            >
                <div id="name" class="font-weight-bold mb-1"><b>${sender}</b></div>
                ${message}
            </div>
        </div>
    </div>
    `;

    // messages id인 div에 추가
    document.getElementById("messages").innerHTML += html;
}

// sender 누구인지 확인
let currentURL = window.location.href;
var pathSegments = currentURL.split('/');
var lastSegment = pathSegments[pathSegments.length - 1];
const sender = lastSegment;
console.log("sender: " + sender)


let socket = io.connect('http://' + document.domain + ':' + location.port);
socket.on('message', (msg) => {
    if (msg.sender != sender) {
        logMessage(msg.text, msg.sender, "left");
    }
    console.log('Message: ' + msg.text);
});

function sendMessage() {
    let sendBtn = document.getElementById('sendingMessage');
    let msg = { "text": sendBtn.value, "sender": sender }

    // const loc = "right"
    // if (id == "customer") {
    //     loc = "left"
    // }

    logMessage(msg.text, sender, "right");
    socket.emit('message', msg);

    // 메세지 전송 후 input 초기화
    sendBtn.value = "";
}

// // id가 sendBtn인 버튼을 클릭하면 sendMessage 함수를 실행
// document.getElementById('sendBtn').onclick = sendMessage;

