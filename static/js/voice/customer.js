import { socket } from './common.js';
import { setupSTT, startSTT, stopSTT, recognition } from './STT.js';

// 부트 스트랩 로딩 딜레이: DOMContentLoaded 후 등록
document.addEventListener('DOMContentLoaded', onLoad);

let startButton
let stopButton
let transcriptionDiv
let sttInUse = false;
let divA, divB, final_transcript = '';

async function onLoad() {
    startButton = document.getElementById('start-button');
    stopButton = document.getElementById('stop-button');
    transcriptionDiv = document.getElementById('transcription');

    divA = document.getElementById('divA');
    divB = document.getElementById('divB');

    // 준비
    setupSTT();
    // 추가로 인식 결과를 중간에도 받아오도록 설정
    recognition.interimResults = true
    recognition.continuos = true

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
        final_transcript = ''
    });

    stopButton.addEventListener('click', () => {
        stopSTT();
        sttInUse = false;
    });
}


function onSTT(event) {
    let interim_transcript = '';
    if (typeof (event.results) == 'undefined') {
        recognition.onend = null;
        recognition.stop();
        upgrade();
        return;
    }
    for (let i = event.resultIndex; i < event.results.length; ++i) {
        // 한문장이 끝났을 때 출력되는 STT 결과
        if (event.results[i].isFinal) {
            final_transcript += event.results[i][0].transcript;
            // text의 맨뒤에 \n이 붙어있으면 마지막 문장이라는 뜻
            socket.emit('voice_customer', { 'text': `${final_transcript}\n` })
            final_transcript=''
        }
        // 끝나기 전에 실시간으로 출력되는 STT 결과
        else {
            interim_transcript += event.results[i][0].transcript;
            // text의 맨뒤에 \n이 없으면 완성이 진행중인 문장이라는 뜻
            socket.emit('voice_customer', { 'text': interim_transcript })
        }
    }
}

// async function onSTT(event) {
//     let len = event.results.length;
//     console.log(event.resultIndex)

//     // 다음 문장이 시작될 때 소캣에 신호 전송
//     if (sttCount < len) {
//         sttCount = len;
//         socket.emit('voice_customer', { 'text': `\n` })
//     }

//     console.log(event.results)
//     let result = event.results[len - 1]
//     const transcript = result[0].transcript;
//     console.log("유저 : " + transcript)
//     socket.emit('voice_customer', { 'text': `${transcript}` })
// }

