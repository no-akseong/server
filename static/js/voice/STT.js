export let recognition

export function setupSTT() {
    recognition = new webkitSpeechRecognition();
    // 원래는 사용자가 말을 안하면 자동으로 종료되는데, true면 끊기지 않고 인식을 계속 시도한다.
    recognition.continuous = true;
    // 원래는 한문장 단위로(말이 끊났을 때: isFinal===false) 도출하지만, true로 하면 말이 끊나지 않아도 중간 중간 결과를 계속 도출한다.
    // recognition.interimResults = true;
    recognition.lang = 'ko-KR';
}

export function startSTT() {
    recognition.start();
}

export function stopSTT() {
    recognition.stop();
}
