export function logMessage(message, sender, location = "center") {
    // 현재 시간을 가져오기
    let currentTime = new Date().toLocaleTimeString();

    let msgLocationClass = "chat-message pb-4"; // 중앙
    if (location == "right") {
        msgLocationClass = "chat-message-right mb-4"
    } else if (location == "left") {
        msgLocationClass = "chat-message-left pb-4"
    }

    let profile_div = `
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
    `
    let style1 = ''
    let style2 = ''
    if (sender === "system") {
        profile_div = ''
        style1 = `text-center`
        style2 = `text-danger`
    }

    // HTML 코드의 {time}과 {msg}를 현재 시간과 메시지로 치환하고 messages div에 추가
    let html = `
    <!-- 메세지 -->
    <div id="message">
        <div class="${msgLocationClass}">
            ${profile_div}
            <div id="content"
                class="flex-shrink-1 bg-light rounded py-2 px-3 mr-3 ${style1}"
            >
                <div id="name" class="font-weight-bold mb-1 ${style2}"><b>${toKor(sender)}</b></div>
                ${message}
            </div>
        </div>
    </div>
    `;

    // messages id인 div에 추가
    document.getElementById("messages").innerHTML += html;
}

export function toKor(str) {
    switch (str) {
        case "customer":
            return "고객";
        case "service":
            return "상담사";
        case "chatbot":
            return "챗봇";
        case "system":
            return "알림";
        default:
            return str;
    }
}

// 메세지 로깅 따로 필요함
export function sendMessage(msg, from, to) {
    let data = { "text": msg, "from": from, "to": to }
    // 메세지 전송
    socket.emit('message', data);
}



export const socket = io.connect('http://' + document.domain + ':' + location.port);

// sender 누구인지 확인
let currentURL = window.location.href;
var pathSegments = currentURL.split('/');
export var sender = pathSegments[pathSegments.length - 1];

// 부트 스트랩 로딩 딜레이: DOMContentLoaded 후 등록
document.addEventListener('DOMContentLoaded', function () {
    socket.on('notify', (msg) => {
        if (msg.to === sender) {
            logMessage(msg.text, "system");
        }
    });

    // 메시지 전송 버튼
    // msg_input = document.getElementById('sendingMessage'); // 메시지 입력창
    // msg_input.addEventListener('keydown', (event) => {
    //     if (event.key !== 'Enter') {
    //         return
    //     }
    //     event.preventDefault(); // 기본 동작 방지
    //     sendMessage();
    // });
});