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
                <div id="name" class="font-weight-bold mb-1"><b>${toKor(sender)}</b></div>
                ${message}
            </div>
        </div>
    </div>
    `;

    // messages id인 div에 추가
    document.getElementById("messages").innerHTML += html;
}

function toKor(str) {
    switch (str) {
        case "customer":
            return "고객";
        case "service":
            return "상담사";
        case "chatbot":
            return "챗봇";
    }
}



function sendMessage() {
    const msg = msg_input.value;
    if (msg == '') {
        return;
    }
    
    // 메시지 전송
    if (receiver == "chatbot") {
        _sendMessage(msg, sender, "bot");
    } else {
        _sendMessage(msg, sender);
    }
    msg_input.value = ''; // 입력창 초기화
}

async function _sendMessage(msg, sender, to = 'all') {
    let data = { "text": msg, "sender": sender }

    // 메세지 로깅
    logMessage(msg, sender, "right");

    if (to == 'all') {
        socket.emit('message', data);
    } else if (to == 'bot') {
        const response = await sendMsgToAI(msg)
        logMessage(response.text, "chatbot", "left");
    }

    // 메세지 전송 후 input 초기화
    sendBtn.value = "";
}

async function sendMsgToAI(msg) {
    const data = { text: msg };

    const response = await fetch('/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        throw new Error(`메세지 전송 실패 (/chat) ${response.status}`);
    }
    return await response.json();
}



let receiver, sender, msg_input, socket;
document.addEventListener('DOMContentLoaded', function () {
    // sender 누구인지 확인
    let currentURL = window.location.href;
    var pathSegments = currentURL.split('/');
    var lastSegment = pathSegments[pathSegments.length - 1];
    receiver = lastSegment;
    sender = "";

    switch (receiver) {
        case "customer":
            sender = "service";
            break;
        case "service":
        case "chatbot":
            sender = "customer";
    }
    console.log("sender: " + sender)


    socket = io.connect('http://' + document.domain + ':' + location.port);
    socket.on('message', (msg) => {
        // receiver가 chatbot일 때는 로깅하기 않음
        if (receiver == "chatbot") {
            return;
        }

        if (msg.sender != sender) {
            logMessage(msg.text, msg.sender, "left");
        }
        console.log('Message: ' + msg.text);
    });

    // 메시지 전송 버튼
    msg_input = document.getElementById('sendingMessage'); // 메시지 입력창
    msg_input.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter') {
            return
        }
        event.preventDefault(); // 기본 동작 방지
        sendMessage();
    });
});