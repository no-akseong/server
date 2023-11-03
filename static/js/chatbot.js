/*
민원인이 챗봇과 대화하는 페이지
*/

import { logMessage, sendMessage, socket, sender } from './common.js';


// 부트 스트랩 로딩 딜레이: DOMContentLoaded 후 등록
document.addEventListener('DOMContentLoaded', onLoad);

let msg_input;
async function onLoad() {
    msg_input = document.getElementById('sendingMessage'); // 메시지 입력창
    // 메시지 전송 버튼
    msg_input.addEventListener('keydown', onSend);

    let sendBtn = document.getElementById("sendBtn");
    sendBtn.addEventListener("click", () => {  
        const msg = msg_input.value;
        sendMsg(msg);
    });
}

function onSend(event) {
    if (event.key !== 'Enter' || msg_input.value == "") {
        return
    }
    event.preventDefault(); // 기본 동작 방지
    const msg = msg_input.value;
    sendMsg(msg);
}

async function sendMsg(msg) {
    logMessage(msg, "customer", "right");
    msg_input.value = '';

    const response = await sendMsgToAI(msg)
    logMessage(response.text, "chatbot", "left");

    // 입력창 초기화
    console.log("gg")
    
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
