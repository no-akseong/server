/*
민원인이 질문분석을 해서 특정 페이지로 이동하는 페이지
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

    const response = await contactGuide(msg)
    const contact = response.contact;
    console.log("contact: ", contact)
    // let bot_response = `${contact}로 3초 후 연결됩니다...`
    // logMessage(bot_response, "chatbot", "left");

    // // 입력창 초기화
    // console.log("gg")
    
}


async function contactGuide(msg) {
    const data = { text: msg };

    const response = await fetch('/contact-guide', {
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
