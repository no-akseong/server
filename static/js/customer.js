/*
고객이 상담사와 대화하는 페이지
*/

import { logMessage, sendMessage, socket, sender, NOTIFY_DELAY } from './common.js';


let msg_input;
// 부트 스트랩 로딩 딜레이: DOMContentLoaded 후 등록
document.addEventListener('DOMContentLoaded', function () {
    // 민원인의 메세지 수신
    socket.on('message', (msg) => {
        // from이 service일 때만 로깅
        if (msg.from !== "service") {
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
});


function sendMsg(msg) {
    logMessage(msg, sender, "right");
    sendMessage(msg, sender, "service");

    // 입력창 초기화
    msg_input.value = '';
}