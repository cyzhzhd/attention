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

const sessionID = document.getElementById("sessionID") as HTMLTextAreaElement;

const mediaStreamConstraints: MediaStreamConstraints = {
  video: true,
  audio: false,
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

////////

socket.on("created", function (room: string, socketId: string) {
  console.log(`created ${room}`);
  isInitiator = true;
});

socket.on("joined", function (room: string, socketId: string) {
  console.log(`${socketId} joined ${room}`);
  isChannelReady = true;
  startConnecting();
});

// socket.on("log", function (array) {
//   console.log.apply(console, array);
// });

// const room = prompt("room name");
const room = "my Room";

if (room) {
  socket.emit("create or join", room);
  console.log(`${room}을 생성 또는 ${room}에 참가`);
}

(function sessionTextSockets() {
  socket.on("sessionID", (id: string) => {
    sessionID.textContent = id;
  });

  socket.on("disconnect", () => {
    sessionID.textContent = "call first";
  });
})();

///////////////////////

function sendMessage(message: any) {
  console.log("Client sending message: ", message);
  socket.emit("message", message);
}

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
/////////////////

(async function onStart() {
  try {
    const mediaStream = await navigator.mediaDevices.getUserMedia(
      mediaStreamConstraints
    );
    localStream = mediaStream;
    localVideo.srcObject = mediaStream;
  } catch (error) {
    console.log("navigator.getUserMedia error: ", error);
  }

  if (isInitiator) {
    startConnecting();
  }
})();

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
  console.log("offerStarted");
  // if (localStream !== undefined) {
  //   localStream
  //     .getTracks()
  //     .forEach(async (track) => pc.addTrack(track, localStream));
  //   console.log("localStream added on the RTCPeerConnection in createSDPOffer");
  // }

  try {
    console.log("offering sdp");
    const offer = await pc.createOffer();
    pc.setLocalDescription(offer);
    sendMessage({
      type: "offer",
      sdp: pc.localDescription,
      room: room,
    });
    console.log("created offer");
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

console.log("EOF");
