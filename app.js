// app.js for call_service.html
const startButtonService = document.getElementById('startButton');
const hangupButtonService = document.getElementById('hangupButton');
const localVideoService = document.getElementById('localVideo');
const remoteVideoService = document.getElementById('remoteVideo');

let localStreamService;
let remoteStreamService;
let pcService;

startButtonService.addEventListener('click', startCallService);
hangupButtonService.addEventListener('click', hangupCallService);

async function startCallService() {
    try {
        localStreamService = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        localVideoService.srcObject = localStreamService;

        pcService = new RTCPeerConnection();

        localStreamService.getTracks().forEach(track => pcService.addTrack(track, localStreamService));

        pcService.onicecandidate = (event) => {
            if (event.candidate) {
                // Send the local ICE candidate to the remote peer
                sendMessageService({ 'ice': event.candidate });
            }
        };

        pcService.ontrack = (event) => {
            remoteStreamService = event.streams[0];
            remoteVideoService.srcObject = remoteStreamService;
        };

        const offer = await pcService.createOffer();
        await pcService.setLocalDescription(offer);

        // Send the local offer to the remote peer
        sendMessageService({ 'offer': offer });
    } catch (error) {
        console.error('Error starting call:', error);
    }
}

function hangupCallService() {
    // Close the peer connection and stop all tracks
    pcService.close();
    localStreamService.getTracks().forEach(track => track.stop());
    localVideoService.srcObject = null;
    remoteVideoService.srcObject = null;
    sendMessageService({ 'hangup': true });
}

function sendMessageService(message) {
    // Implement WebSocket communication to send messages to the remote peer
}

// app.js for call_customer.html
// Similar to the code above with modifications for the customer's role
