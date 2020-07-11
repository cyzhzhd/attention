const socket = io("http://172.30.1.13:3000", { autoConnect: false });

const localVideo = document.getElementById("local") as HTMLVideoElement;
const remoteVideo = document.getElementById("remote") as HTMLVideoElement;

const startButton = document.getElementById("startButton") as HTMLInputElement;
const callButton = document.getElementById("callButton") as HTMLInputElement;
const hangupButton = document.getElementById(
  "hangupButton"
) as HTMLInputElement;
const joinButton = document.getElementById("joinButton") as HTMLInputElement;
const sessionID = document.getElementById("sessionID") as HTMLTextAreaElement;
const sessionInput = document.getElementById(
  "sessionInput"
) as HTMLInputElement;

let localStream: MediaStream;
let pc: RTCPeerConnection;

callButton.disabled = true;
hangupButton.disabled = true;
joinButton.disabled = true;

(function sessionTextSockets() {
  socket.on("sessionID", (id: string) => {
    sessionID.textContent = id;
  });

  socket.on("disconnect", () => {
    sessionID.textContent = "call first";
  });
})();

const configuration: RTCConfiguration = {
  iceServers: [
    {
      urls: ["stun:stun.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};

const offerOptions: RTCOfferOptions = {
  iceRestart: true,
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
    joinButton.disabled = false;
  } catch (e) {
    alert(`getUserMedia() error: ${e.name}`);
  }
}

async function onCall() {
  callButton.disabled = true;
  joinButton.disabled = true;
  hangupButton.disabled = false;
  socket.connect();

  pc = new RTCPeerConnection(configuration);
  pc.addEventListener("iceconnectionstatechange", () => {
    if (pc.iceConnectionState == "disconnected") resendOffer();
  });
  setPcListner(pc);

  localStream
    .getTracks()
    .forEach(async (track) => pc.addTrack(track, localStream));

  try {
    const offer = await pc.createOffer(offerOptions);
    await pc.setLocalDescription(offer);
    console.log("SDP offer created");
    socketOnCall(offer);
  } catch (e) {
    console.error("Failed to create pc session description", e);
  }
}

async function resendOffer() {
  console.log("resending SDP offer");
  const offer = await pc.createOffer(offerOptions);
  await pc.setLocalDescription(offer);
  socket.emit("sendOffer", offer);
}

function socketOnCall(offer: RTCSessionDescriptionInit) {
  socket.on("gotCandidate", async (candidate: RTCIceCandidate) => {
    console.log("got ice candidate from peer");
    try {
      await pc.addIceCandidate(candidate);
    } catch (e) {
      console.error("error while adding icecandidate");
    }
  });
  socket.on("newParticipant", () => {
    console.log("new participant detected. sending SDP offer");
    socket.emit("sendOffer", offer);
  });
  socket.on("gotAnswer", (answer: RTCSessionDescriptionInit) => {
    if (answer) {
      console.log("got an SDP answer");
      pc.setRemoteDescription(answer);
      console.log("can trickle: ", pc.canTrickleIceCandidates);
    }
  });
}

async function onJoin() {
  callButton.disabled = true;
  joinButton.disabled = true;
  hangupButton.disabled = false;
  socket.connect();

  pc = new RTCPeerConnection(configuration);
  setPcListner(pc);
  localStream
    .getTracks()
    .forEach(async (track) => pc.addTrack(track, localStream));

  socketOnJoin();
  socket.emit("joinSession", sessionInput.value);
}

function socketOnJoin() {
  socket.on("gotCandidate", async (candidate: RTCIceCandidate) => {
    console.log("got ice candidate from peer");
    try {
      await pc.addIceCandidate(candidate);
    } catch (e) {
      console.error("error while adding icecandidate");
    }
  });
  socket.on("gotOffer", async (offer: RTCSessionDescriptionInit) => {
    console.log("got an SDP offer");
    if (offer) {
      pc.setRemoteDescription(offer);
    }
    try {
      const answer = await pc.createAnswer(offerOptions);
      await pc.setLocalDescription(answer);
      console.log("sending SDP answer");
      socket.emit("sendAnswer", answer);
      console.log("can trickle: ", pc.canTrickleIceCandidates);
    } catch (e) {
      console.error("Failed SDP answer", e);
    }
  });
}

function setPcListner(pc: RTCPeerConnection) {
  pc.addEventListener("icecandidate", (e) => {
    console.log("new icecandidate", e.candidate);
    if (e.candidate) {
      socket.emit("sendCandidate", e.candidate);
    }
  });
  pc.addEventListener("iceconnectionstatechange", () => {
    printState();
  });
  pc.addEventListener("track", gotRemoteStream);
}

const onHangup = function onHangup() {
  pc.close();
  socket.disconnect();
  // pc = null;

  ["newParticipant", "gotOffer", "gotAnswer", "gotCandidate"].forEach((str) => {
    socket.removeEventListener(str);
  });

  hangupButton.disabled = true;
  callButton.disabled = false;
  joinButton.disabled = false;
};

function gotRemoteStream(e: RTCTrackEvent) {
  console.log("got remote stream");
  if (remoteVideo.srcObject !== e.streams[0]) {
    remoteVideo.srcObject = e.streams[0];
  }
}

function printState() {
  console.log("ice gathering state:", pc.iceGatheringState);
  console.log("ice connection state", pc.iceConnectionState);
  console.log("connection state", pc.connectionState);
  console.log("signalingState", pc.signalingState);
}

startButton.addEventListener("click", onStart);
callButton.addEventListener("click", onCall);
hangupButton.addEventListener("click", onHangup);
joinButton.addEventListener("click", onJoin);
