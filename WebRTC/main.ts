"use strict";

let isInitiator = false;
let isStarted = false;
let isChannelReady = false;
let pc: RTCPeerConnection;

const socket = io("http://localhost:3000", {
  autoConnect: false,
}).connect();

const localVideo = document.getElementById("localVideo") as HTMLVideoElement;
const remoteVideo = document.getElementById("remoteVideo") as HTMLVideoElement;

const startButton = document.getElementById("startButton") as HTMLInputElement;
const callButton = document.getElementById("callButton") as HTMLInputElement;
// const hangupButton = document.getElementById(
//   "hangupButton"
// ) as HTMLInputElement;
const sessionID = document.getElementById("sessionID") as HTMLTextAreaElement;

const mediaStreamConstraints: MediaStreamConstraints = {
  video: true,
  audio: true,
};

const rtcIceServerConfiguration: RTCConfiguration = {
  iceServers: [
    {
      urls: ["stun:stun.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};

let localStream: MediaStream;
let remoteStream: MediaStream;

/////////////////////////////////////////////////////////////////////

function sendMessage(message: any) {
  console.log("Client sending message: ", message);
  socket.emit("message", message);
}

socket.on("created", function (room: string) {
  console.log(`created ${room}`);
  isInitiator = true;
});

socket.on("joined", function (room: string, socketId: string) {
  console.log(`${socketId} joined ${room}`);
  isChannelReady = true;
});

socket.on("sessionID", (id: string) => {
  sessionID.textContent = id;
});

socket.on("disconnect", () => {
  sessionID.textContent = "call first";
});

socket.on("log", function (array: any) {
  console.log(array);
});

socket.on("message", function (message: any) {
  if (message.type === "offer") {
    if (!isInitiator && !isStarted) {
      startConnecting();
    }
    console.log("got offer ", message.sdp);
    pc.setRemoteDescription(new RTCSessionDescription(message.sdp));
    makeAnswer();
  } else if (message.type === "answer" && isStarted) {
    console.log("got answer ", message.sdp);
    pc.setRemoteDescription(new RTCSessionDescription(message.sdp));
  } else if (message.type === "candidate" && isStarted) {
    const candidate = new RTCIceCandidate({
      sdpMLineIndex: message.label,
      candidate: message.candidate,
    });
    pc.addIceCandidate(candidate);
  }
});
/////////////////////////////////////////////////////////////////////

const room = prompt("room name");

if (room !== "") {
  socket.emit("create or join", room);
  console.log(`${room}을 생성 또는 ${room}에 참가`);
}

const onStart = async function onStart() {
  try {
    const mediaStream = await navigator.mediaDevices.getUserMedia(
      mediaStreamConstraints
    );
    localStream = mediaStream;
    localVideo.srcObject = mediaStream;
  } catch (error) {
    console.log("navigator.getUserMedia error: ", error);
  }
};

function startConnecting() {
  console.log(
    "start status: ",
    isStarted,
    " localStream :",
    localStream,
    " Channel Ready: ",
    isChannelReady
  );

  if (!isChannelReady && !isStarted) {
    return;
  }
  console.log("creating peer connection");

  createPeerConnection();

  isStarted = true;
}

function createPeerConnection() {
  pc = new RTCPeerConnection(rtcIceServerConfiguration);

  // setLocalDescription()에 의해 호출 됌.
  // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/icecandidate_event
  pc.onicecandidate = handleIceCandidate;
  // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/track_event
  pc.addEventListener("track", gotRemoteStream);

  if (isInitiator) {
    // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/negotiationneeded_event
    pc.addEventListener("negotiationneeded", createSDPOffer);
  }
  console.log("Created RTCPeerConnection");

  if (localStream !== undefined) {
    localStream
      .getTracks()
      .forEach(async (track) => pc.addTrack(track, localStream));
    console.log("localStream added on the RTCPeerConnection");
  }
}

function handleIceCandidate(event: RTCPeerConnectionIceEvent) {
  console.log("icecandidate event: ", event);
  if (event.candidate) {
    sendMessage({
      type: "candidate",
      label: event.candidate.sdpMLineIndex,
      id: event.candidate.sdpMid,
      candidate: event.candidate.candidate,
      room: room,
    });
  } else {
    console.log("End of candidates.");
  }
}

async function createSDPOffer() {
  try {
    console.log("offering sdp");
    const offer = await pc.createOffer();
    pc.setLocalDescription(offer);
    sendMessage({
      type: "offer",
      sdp: pc.localDescription,
      room: room,
    });

    console.log("offer created");
  } catch (e) {
    console.error("Failed to create pc session description", e);
  }
}

async function makeAnswer() {
  try {
    const sessionDescription = await pc.createAnswer();
    pc.setLocalDescription(sessionDescription);
    console.log("makeAnswer ", sessionDescription);
    sendMessage({
      type: "answer",
      sdp: pc.localDescription,
      room: room,
    });
  } catch (error) {
    console.trace("Failed to create session description: " + error.toString());
  }
}

function gotRemoteStream(event: RTCTrackEvent) {
  console.log("Remote stream added.");
  remoteStream = event.streams[0];
  remoteVideo.srcObject = remoteStream;
  console.log(remoteStream);
}

startButton.addEventListener("click", onStart);
callButton.addEventListener("click", startConnecting);
