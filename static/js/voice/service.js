import { logMessage, logImage, sendMessage, socket, sender, NOTIFY_DELAY } from '../common.js';

// 부트 스트랩 로딩 딜레이: DOMContentLoaded 후 등록
document.addEventListener('DOMContentLoaded', onLoad);

let startButton
let stopButton
let transcriptionDiv
let sttInUse = false;

async function onLoad() {
    createCustomerLogBlock();
}

socket.on('voice-text', (msg) => {
    let messagesContainer = document.getElementById('messages');
    let lastChild = messagesContainer.lastElementChild;
    let contentElement = lastChild.querySelector('#content');

    // 수시로 customer에서 들어오는 STT 중간결과들이 들어와서 실시간으로 업데이트
    contentElement.innerHTML = msg.text

    // 만약 텍스트가 \n으로 끝나면 다음 새로운 메세지 블럭 추가
    if (msg.text.endsWith('\n')) {
        createCustomerLogBlock();
    }
})

function createCustomerLogBlock() {
    logMessage("", "customer", "left");
}
