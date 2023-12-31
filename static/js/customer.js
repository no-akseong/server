/*
고객이 상담사와 대화하는 페이지
*/

import { logMessage, logImage, sendMessage, socket, sender, NOTIFY_DELAY, sendImage } from './common.js';


let msg_input;
let point_cnt = 0;
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

    // 민원인의 메세지 수신
    socket.on('negative-score', (msg) => {
        console.log("vendor: ", msg.vendor, "score: ", msg.score)
        let newPoint = 0;
        // newPoint 소수점 2자리까지 표시
        newPoint = msg.score.toFixed(2);

        if (msg.vendor === 'g') {
            newPoint = mapValue(newPoint, -1, 1, 0, 1); // -1.0 ~ 1.0을 0.0 ~ 1.0 사이로 정규화
        } else if (msg.vendor === 's') {
            newPoint = 1 - newPoint; // simsimi는 긍정점수가 아닌 부정점수이므로 1에서 빼줌
        }

        console.log("new point: ", newPoint);
        newPoint = newPoint * 100; // 백분율로 변환
        newPoint = Math.round(newPoint); // 소수점 제거

        // TODO: 만약 점수가 더 부정적일 수록 지수적으로 더 큰 패널티 부여
        
        
        // id가 point인 요소에 점수를 표시
        let pointElem = document.getElementById('point');
        let pointStr = pointElem.innerHTML.trim();
        // 이미 표시되어있는 점수 정수로 가져오기
        let prePoint = parseInt(pointStr.split(' ')[1]);
        let totalPoint = prePoint * point_cnt;
        totalPoint += newPoint;
        point_cnt += 1;
        let finalPoint = Math.round(totalPoint / point_cnt);
        pointElem.innerHTML = `포인트: ${finalPoint}점`;
        console.log( `포인트: ${finalPoint}`)
    });

    function mapValue(value, inMin, inMax, outMin, outMax) {
        // 현재 범위(inMin에서 inMax)에서의 value를 새로운 범위(outMin에서 outMax)로 매핑
        return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    }

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


    // 버튼 요소와 파일 입력 요소를 가져옵니다.
    const sendImgBtn = document.getElementById("sendImageBtn");
    const fileInput = document.getElementById('fileInput');

    // 버튼을 클릭할 때 파일 입력(input) 요소를 클릭합니다.
    sendImgBtn.addEventListener('click', () => fileInput.click());

    // 파일이 선택되면 해당 파일을 업로드합니다.
    fileInput.addEventListener('change', handleFileSelect, false);

    function handleFileSelect(event) {
        const file = event.target.files[0]; // 선택한 파일  
        // 파일 포맷 추출
        const fileName = file.name;
        const fileFormat = fileName.split('.')[1].toLowerCase();

        const formData = new FormData();
        formData.append('file', file);

        // 서버로 파일을 업로드합니다.
        if (file) {
            // FileReader를 사용하여 이미지 파일을 읽어들임
            const reader = new FileReader();
            reader.onloadend = () => {
                // 이미지 채팅방에 출력
                logImage(reader.result, sender, "right");
                // 이미지 전송
                sendImage(reader.result, sender, "service");
            };
            reader.readAsDataURL(file); // 이미지를 데이터 URL로 읽어옴
        } else {
            alert('이미지를 선택하세요.');
        }
    }


    const callBtn = document.getElementById('callBtn');

    callBtn.addEventListener('click', async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Peer connection 생성
            const peerConnection = new RTCPeerConnection();

            // 로컬 스트림 추가
            stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

            // Offer 생성 및 로컬 설명 설정
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);

            // Offer를 상대방에게 전송 (여기서는 콘솔에 출력)
            console.log('Offer 생성: ', offer);

            // 여기서 offer를 상대방에게 전송하고, 상대방의 answer를 기다린 후 setRemoteDescription을 호출하면 연결이 완료됩니다.
        } catch (err) {
            console.error('미디어 디바이스 오류:', err);
        }
    });
});


function sendMsg(msg) {
    logMessage(msg, sender, "right");
    sendMessage(msg, sender, "service");

    // 입력창 초기화
    msg_input.value = '';
}