function logMessage(message, location) {
    // 현재 시간을 가져오기
    let currentTime = new Date().toLocaleTimeString();

    let msgLocationClass = "chat-message-left pb-4";
    if (location == "right") {
        msgLocationClass = "chat-message-right mb-4"
    }

    let name = "민원인"
    if (location == "right") {
        name = "상담사"
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
                <div id="name" class="font-weight-bold mb-1"><b>${name}</b></div>
                ${message}
            </div>
        </div>
    </div>
    `;

    // messages id인 div에 추가
    document.getElementById("messages").innerHTML += html;
}



let socket = io.connect('http://' + document.domain + ':' + location.port);

socket.on('message', (msg) => {
    console.log('Message: ' + msg);
    logMessage(msg, "left");
});

function sendMessage() {
    let sendBtn = document.getElementById('sendBtn');
    let msg = sendBtn.value;
    
    logMessage(msg, "right");
    socket.emit('message', msg);
}