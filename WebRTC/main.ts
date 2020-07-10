const localVideo = document.getElementById("local") as HTMLVideoElement;
const remoteVideo = document.getElementById("remote") as HTMLVideoElement;

const startButton = document.getElementById("startButton") as HTMLInputElement;
const callButton = document.getElementById("callButton") as HTMLInputElement;
const hangupButton = document.getElementById(
  "hangupButton"
) as HTMLInputElement;

let localStream: MediaStream;
let pc1: RTCPeerConnection;
let pc2: RTCPeerConnection;

callButton.disabled = true;
hangupButton.disabled = true;

const configuration: RTCConfiguration = {
  iceServers: [
    {
      urls: [
        "stun:stun1.l.google.com:19302",
        "stun:stun2.l.google.com:19302",
        "stun:stun3.l.google.com:19302",
        "stun:stun4.l.google.com:19302",
        "stun:stun.stunprotocol.org:3478",
      ],
    },
  ],
  iceCandidatePoolSize: 10,
};

const offerOptions: RTCOfferOptions = {
  offerToReceiveAudio: true,
  offerToReceiveVideo: true,
};

async function onStart() {
  startButton.disabled = true;
  const constraints = {
    audio: {
      sampleRate: 48000,
      volume: 2.0,
      autoGainControl: true,
      echoCancellation: true,
    },
    video: { width: 480, height: 360 },
  };
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    localVideo.srcObject = stream;
    localStream = stream;
    callButton.disabled = false;
  } catch (e) {
    alert(`getUserMedia() error: ${e.name}`);
  }
}

async function onCall() {
  callButton.disabled = true;
  hangupButton.disabled = false;
  pc1 = new RTCPeerConnection(configuration);
  pc2 = new RTCPeerConnection(configuration);
  pc1.addEventListener("icecandidate", (e) => onIceCandidate(pc1, e));
  pc2.addEventListener("icecandidate", (e) => onIceCandidate(pc2, e));
  pc1.addEventListener("iceconnectionstatechange", (e) => {
    console.log("ICE state change event: ", e);
  });
  pc2.addEventListener("iceconnectionstatechange", (e) => {
    console.log("ICE state change event: ", e);
  });
  pc2.addEventListener("track", gotRemoteStream);
  localStream.getTracks().forEach((track) => pc1.addTrack(track, localStream));

  try {
    const offer = await pc1.createOffer(offerOptions);
    await onCreateOfferSuccess(offer);
    console.log("SDP offer success");
  } catch (e) {
    console.error("Failed to create pc1 session description", e);
  }
}

const onHangup = function onHangup() {
  pc1.close();
  pc2.close();
  pc1 = null;
  pc2 = null;
  hangupButton.disabled = true;
  callButton.disabled = false;
};

async function onIceCandidate(pc, event) {
  if (event.candidate === null) {
    console.log(`Icecandidate null`);
    return;
  }
  try {
    console.log(`adding icecandidate`, event.candidate);
    await getOtherPc(pc).addIceCandidate(event.candidate);
  } catch (e) {
    console.error("Error while adding icecandidate", e);
  }
}

function getOtherPc(pc) {
  return pc === pc1 ? pc2 : pc1;
}

function gotRemoteStream(e) {
  if (remoteVideo.srcObject !== e.streams[0]) {
    remoteVideo.srcObject = e.streams[0];
  }
}

async function onCreateOfferSuccess(desc) {
  try {
    await pc1.setLocalDescription(desc);
  } catch (e) {
    console.error(`Failed to set pc1 local description.`, e);
  }

  try {
    await pc2.setRemoteDescription(desc);
  } catch (e) {
    console.error(`Failed to set pc2 remote description.`, e);
  }

  try {
    const answer = await pc2.createAnswer();
    await onCreateAnswerSuccess(answer);
  } catch (e) {
    console.error(`Failed to create pc2 session description.`, e);
  }
}

async function onCreateAnswerSuccess(desc) {
  try {
    await pc2.setLocalDescription(desc);
  } catch (e) {
    console.error(`Failed to set pc2 local description.`, e);
  }
  try {
    await pc1.setRemoteDescription(desc);
  } catch (e) {
    console.error(`Failed to set pc1 remote description.`, e);
  }
}

startButton.addEventListener("click", onStart);
callButton.addEventListener("click", onCall);
hangupButton.addEventListener("click", onHangup);
