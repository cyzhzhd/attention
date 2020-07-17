"use strict";

let isInitiator = false;
let isStarted = false;
let isChannelReady = false;

// const socket = io("15.164.225.104:3000", {
//   autoConnect: false,
// }).connect();

const socket = io("localhost:3000", {
  autoConnect: false,
}).connect();

const localVideo = document.getElementById("localVideo") as HTMLVideoElement;
const remoteVideos = document.getElementById("videos") as HTMLVideoElement;

let connectedUsers: Record<string, RTCPeerConnection> = {};
let remoteStreams: Record<string, MediaStream>;
let isTrackAdded: Record<string, boolean>;

const startButton = document.getElementById("startButton") as HTMLInputElement;
const callButton = document.getElementById("callButton") as HTMLInputElement;
const hangupButton = document.getElementById(
  "hangupButton"
) as HTMLInputElement;
const muteVideoButton = document.getElementById(
  "muteVideoButton"
) as HTMLInputElement;
const HTMLSessionID = document.getElementById(
  "sessionID"
) as HTMLTextAreaElement;
let sessionId: string;

callButton.disabled = true;
hangupButton.disabled = true;

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
// let remoteStream: MediaStream;

/////////////////////////////////////////////////////////////////////

function sendMessage(message: any) {
  console.log("Client sending message: ", message);
  socket.emit("message", message);
}

socket.on("created", function (room: string) {
  console.log(`created ${room}`);
  isInitiator = true;
});

let test;
socket.on("joined", function (
  room: string,
  socketId: string,
  clientsInRoom: any
) {
  console.log(`${socketId} joined ${room}`);
  if (!isChannelReady) {
    console.log(typeof connectedUsers);
    connectedUsers = Object.assign({}, clientsInRoom.sockets);
    delete connectedUsers[sessionId];
    remoteStreams = Object.assign({}, clientsInRoom.sockets);
    delete remoteStreams[sessionId];
    isTrackAdded = Object.assign({}, clientsInRoom.sockets);
    for (const bool in isTrackAdded) {
      isTrackAdded[bool] = false;
    }
  } else {
    connectedUsers[socketId] = new RTCPeerConnection(rtcIceServerConfiguration);
    if (remoteStreams === undefined) {
      remoteStreams = {};
      isTrackAdded = {};
    } else {
      remoteStreams[socketId] = new MediaStream();
      isTrackAdded[socketId] = false;
    }
    addingListenerOnPC(socketId);
  }
});

socket.on("sessionID", (id: string) => {
  sessionId = id;
  HTMLSessionID.textContent = sessionId;
});

socket.on("disconnect", () => {
  HTMLSessionID.textContent = "call first";
});

socket.on("log", function (array: any) {
  console.log(array);
});

socket.on("message", function (message: any) {
  // if (message.type === "connectRequest") {
  //   console.log("got connectedRequest");
  //   startConnecting();
  // } else
  if (message.type === "offer") {
    console.log("got offer from: ", message.sendFrom);
    if (connectedUsers[message.sendFrom] !== true) {
      connectedUsers[message.sendFrom].setRemoteDescription(
        new RTCSessionDescription(message.sdp)
      );
      makeAnswer(message.sendFrom);
    }
  } else if (message.type === "answer" && isStarted) {
    // 방에 들어와만 있고 시작을 안했을 때 오퍼를 받는다?
    console.log("got answer from: ", message.sendFrom);
    connectedUsers[message.sendFrom].setRemoteDescription(
      new RTCSessionDescription(message.sdp)
    );
  } else if (message.type === "candidate" && isStarted) {
    console.log("got candidate from: ", message.sendFrom);
    const candidate = new RTCIceCandidate({
      sdpMLineIndex: message.label,
      candidate: message.candidate,
    });
    connectedUsers[message.sendFrom].addIceCandidate(candidate);
  } else if (message.type === "bye" && isStarted) {
    handleRemoteHangup();
  } else if (message.type === "muted") {
    // muteRemoteVideo();
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
    startButton.disabled = true;
    callButton.disabled = false;
  } catch (error) {
    console.log("navigator.getUserMedia error: ", error);
  }

  // sendMessage({
  //   type: "connectRequest",
  //   target: sessionId,
  //   room: room,
  // });
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
  callButton.disabled = true;
  hangupButton.disabled = false;

  // if (isChannelReady) {
  //   return;
  // }

  console.log("creating peer connection");
  createPeerConnection();

  isStarted = true;
  isChannelReady = true;
}

function createPeerConnection() {
  for (const user in connectedUsers) {
    connectedUsers[user] = new RTCPeerConnection(rtcIceServerConfiguration);

    addingListenerOnPC(user);
    console.log("Created RTCPeerConnection");
  }
}

function addingListenerOnPC(user: string) {
  // setLocalDescription()에 의해 호출 됌.
  // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/icecandidate_event
  connectedUsers[user].addEventListener("icecandidate", (event) => {
    console.log("icecandidate event: ", event);
    if (event.candidate) {
      sendMessage({
        type: "candidate",
        label: event.candidate.sdpMLineIndex,
        id: event.candidate.sdpMid,
        candidate: event.candidate.candidate,
        sendTo: user,
        sendFrom: sessionId,
        room: room,
      });
    } else {
      console.log("End of candidates.");
    }
  });

  // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/track_event
  connectedUsers[user].ontrack = (event) => {
    console.log("Remote stream added.");
    remoteStreams[user] = event.streams[0];
    const video = document.createElement("video");
    video.srcObject = remoteStreams[user];
    video.autoplay = true;
    video.playsinline = true;
    remoteVideos.appendChild(video);
  };

  // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/negotiationneeded_event
  connectedUsers[user].addEventListener("negotiationneeded", createSDPOffer);

  if (!(localStream === undefined || isTrackAdded[user])) {
    localStream
      .getTracks()
      .forEach(async (track) =>
        connectedUsers[user].addTrack(track, localStream)
      );
    console.log("localStream added on the RTCPeerConnection");
    isTrackAdded[user] = true;
  }
}

async function createSDPOffer() {
  try {
    for (const user in connectedUsers) {
      if (connectedUsers[user].localDescription !== null) {
        continue;
      }
      console.log("offering sdp");
      const offer = await connectedUsers[user].createOffer();
      connectedUsers[user].setLocalDescription(offer);
      sendMessage({
        type: "offer",
        sendTo: user,
        sendFrom: sessionId,
        sdp: connectedUsers[user].localDescription,
        room: room,
      });

      console.log("offer created for a user: ", connectedUsers[user]);
    }
  } catch (e) {
    console.error("Failed to create pc session description", e);
  }
}

async function makeAnswer(sendFrom: string) {
  try {
    console.log("make answer to: ", sendFrom);
    const sessionDescription = await connectedUsers[sendFrom].createAnswer();

    connectedUsers[sendFrom].setLocalDescription(sessionDescription);

    // if (!(localStream === undefined || isTrackAdded[sendFrom])) {
    if (!isTrackAdded[sendFrom]) {
      console.log(localStream.getTracks());
      localStream
        .getTracks()
        .forEach(async (track) =>
          connectedUsers[sendFrom].addTrack(track, localStream)
        );
      console.log("localStream added on the RTCPeerConnection");
      isTrackAdded[sendFrom] = true;
    }

    console.log("makeAnswer ", sessionDescription);
    sendMessage({
      type: "answer",
      sendTo: sendFrom,
      sendFrom: sessionId,
      sdp: connectedUsers[sendFrom].localDescription,
      room: room,
    });
  } catch (error) {
    console.trace("Failed to create session description: " + error.toString());
  }
}

function hangUp() {
  console.log("hanging up.");
  sendMessage({
    type: "bye",
    sendFrom: sessionId,
    room: room,
  });
  localVideo.srcObject = null;
  stop();
}

function stop() {
  pc.close();
  socket.disconnect();
  isStarted = false;

  // ["newParticipant", "gotOffer", "gotAnswer", "gotCandidate"].forEach((str) => {
  //   socket.removeEventListener(str);
  // });

  hangupButton.disabled = true;
  callButton.disabled = false;
}

function handleRemoteHangup() {
  console.log("Session terminated.");
  stop();
  remoteVideo.srcObject = null;
}

function muteVideo() {
  if (localVideo.srcObject === null) {
    localVideo.srcObject = localStream;
  } else {
    localVideo.srcObject = null;
  }
  sendMessage({
    type: "muted",
    sendFrom: sessionId,
    room: room,
  });
}

// function muteRemoteVideo() {
//   if (remoteVideo.srcObject === null) {
//     remoteVideo.srcObject = remoteStream;
//   } else {
//     console.log("remoteVideoMuted");
//     remoteVideo.srcObject = null;
//   }
// }

startButton.addEventListener("click", onStart);
callButton.addEventListener("click", startConnecting);
hangupButton.addEventListener("click", hangUp);
muteVideoButton.addEventListener("click", muteVideo);
