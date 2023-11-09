/*
고객이 음성통화로 챗봇과 통화하는 곳
*/

import { socket } from './common.js';
import { setupSTT, startSTT, stopSTT, recognition } from './STT.js';
import { setupTTS, startTTS, stopTTS, speechSynthesis } from './TTS.js';


// 부트 스트랩 로딩 딜레이: DOMContentLoaded 후 등록
document.addEventListener('DOMContentLoaded', onLoad);

let startButton
let stopButton
let sttInUse = false;



async function onLoad() {
    startButton = document.getElementById('start-button');
    stopButton = document.getElementById('stop-button');

    // 준비
    setupSTT();
    setupTTS();


    recognition.onresult = onSTT;
    // 시간이 지나면 STT를 자동으로 종료하므로 사용중에는 종료 거부
    recognition.onend = () => {
        console.log("STT 종료 시도")
        if (sttInUse) {
            startSTT();
            console.log("STT 종료 거부")
        }
        console.log("STT 종료")
    };

    startButton.addEventListener('click', () => {
        startSTT();
        sttInUse = true;
    });

    stopButton.addEventListener('click', () => {
        stopSTT();
        sttInUse = false;
    });
}

async function onSTT(event) {
    let len = event.results.length;
    console.log(event.results)
    let result = event.results[len - 1]
    if (!result.isFinal) {
        return;
    }

    const transcript = result[0].transcript;
    console.log("유저 : " + transcript)
    // transcriptionDiv.textContent += transcript;

    // STT 결과를 챗봇에게 전송
    const response = await sendMsgToAI(transcript)
    // 받은 응답을 TTS로 음성 출력
    console.log("챗봇: " + response.text)
    startTTS(response.text);
}


async function sendMsgToAI(msg) {
    const data = { text: msg, streaming: true };

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
