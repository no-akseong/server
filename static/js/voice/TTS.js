let voices = [];
export let speechSynthesis = window.speechSynthesis

function setVoiceList() {
    voices = window.speechSynthesis.getVoices();
};

export function setupTTS(text) {
    //디바이스에 내장된 voice를 가져온다.
    // 음성 변환 목소리 preload (시간이 걸리므로)
    setVoiceList();

    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        //voice list에 변경됐을때, voice를 다시 가져온다.
        window.speechSynthesis.onvoiceschanged = setVoiceList;
    }
};

export function startTTS(text) {
    const utterThis = new SpeechSynthesisUtterance(text);
    //rate : speech 속도 조절 (기본값 1 / 조절 0.1 ~ 10 -> 숫자가 클수록 속도가 빠름 )

    const lang = "ko-KR";
    // const lang = "EN-US";
    const rate = 1; // 속도
    utterThis.lang = lang;
    utterThis.rate = rate;

    /* 한국어 vocie 찾기
        디바이스 별로 한국어는 ko-KR 또는 ko_KR로 voice가 정의되어 있다.
    */
    /*
    - Microsoft Heami - Korean (Korean)
    - Google 한국의
 
    브라우저에 위 2개의 voice가 있는데, "Google 한국의"가 더 자연스러움.
    */
    const voiceName = "Google 한국의"
    const kor_voice = voices.find(
        elem => (elem.lang === lang || elem.lang === lang.replace("-", "_")) && elem.name === voiceName
    );


    //힌국어 voice가 있다면 ? utterance에 목소리를 설정한다 : 리턴하여 목소리가 나오지 않도록 한다.
    if (kor_voice) {
        utterThis.voice = kor_voice;
    } else {
        return
        // utterThis.voice = kor_voice;
    }

    //utterance를 재생(speak)한다.
    window.speechSynthesis.speak(utterThis);
}

export function stopTTS() {
    window.speechSynthesis.cancel();
}

