/*
상담사가 고객을 대응하는 페이지
*/

import { logMessage, sendMessage, socket, sender, NOTIFY_DELAY } from './common.js';

let msg_input;
// 부트 스트랩 로딩 딜레이: DOMContentLoaded 후 등록
document.addEventListener('DOMContentLoaded', function () {
    // 민원인의 메세지 수신
    socket.on('message', (msg) => {
        // from이 customer일 때만 로깅
        if (msg.from !== "customer") {
            return
        }
        logMessage(msg.text, msg.from, "left");
        console.log('Message: ' + msg.text);
    });

    // 메시지 전송 버튼
    msg_input = document.getElementById('sendingMessage'); // 메시지 입력창
    msg_input.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' || msg_input.value == "") {
            return
        }
        event.preventDefault(); // 기본 동작 방지
        const msg = msg_input.value;
        sendMsg(msg);
    });

    let sendBtn = document.getElementById("sendBtn");
    sendBtn.addEventListener("click", () => {
        const msg = msg_input.value;
        sendMsg(msg);
    });

    // passToChatbot id의 버튼을 누르면 
    document.getElementById("passToChatbot").addEventListener("click", sendCustomerToChatbot);

    // service가 대화하고 있는 상대방customer의 페이지가 /chatbot 이동
    function sendCustomerToChatbot() {
        socket.emit('notify', {
            "text": "부적절한 언어가 감지되었습니다. 챗봇으로 이동되었습니다.",
            "to": "customer",
            "action": "chatbot"
        });

        // 상대방이 나갔다는 메세지 전송
        logMessage("고객이 나갔습니다.<br>챗봇이 고객을 대응합니다.", "system");
    }
});



function sendMsg(msg) {
    logMessage(msg, sender, "right");
    sendMessage(msg, sender, "service");

    // 입력창 초기화
    msg_input.value = '';
}