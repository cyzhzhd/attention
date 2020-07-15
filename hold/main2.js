"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const socket = io("http://13.125.214.253:3000", { autoConnect: false });
const localVideo = document.getElementById("local");
const remoteVideo = document.getElementById("remote");
const startButton = document.getElementById("startButton");
const callButton = document.getElementById("callButton");
const hangupButton = document.getElementById("hangupButton");
const joinButton = document.getElementById("joinButton");
const sessionID = document.getElementById("sessionID");
const sessionInput = document.getElementById("sessionInput");
let localStream;
let pc;
callButton.disabled = true;
hangupButton.disabled = true;
joinButton.disabled = true;
(function sessionTextSockets() {
    socket.on("sessionID", (id) => {
        sessionID.textContent = id;
    });
    socket.on("disconnect", () => {
        sessionID.textContent = "call first";
    });
})();
const configuration = {
    iceServers: [
        {
            urls: ["stun:stun.l.google.com:19302"],
        },
    ],
    iceCandidatePoolSize: 10,
};
const offerOptions = {
    iceRestart: true,
};
function onStart() {
    return __awaiter(this, void 0, void 0, function* () {
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
            const stream = yield navigator.mediaDevices.getUserMedia(constraints);
            localVideo.srcObject = stream;
            localStream = stream;
            callButton.disabled = false;
            joinButton.disabled = false;
        }
        catch (e) {
            alert(`getUserMedia() error: ${e.name}`);
        }
    });
}
function onCall() {
    return __awaiter(this, void 0, void 0, function* () {
        callButton.disabled = true;
        joinButton.disabled = true;
        hangupButton.disabled = false;
        socket.connect();
        pc = new RTCPeerConnection(configuration);
        pc.addEventListener("iceconnectionstatechange", () => {
            if (pc.iceConnectionState == "disconnected")
                resendOffer();
        });
        setPcListner(pc);
        localStream
            .getTracks()
            .forEach((track) => __awaiter(this, void 0, void 0, function* () { return pc.addTrack(track, localStream); }));
        try {
            const offer = yield pc.createOffer(offerOptions);
            yield pc.setLocalDescription(offer);
            console.log("SDP offer created");
            socketOnCall(offer);
        }
        catch (e) {
            console.error("Failed to create pc session description", e);
        }
    });
}
function resendOffer() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("resending SDP offer");
        const offer = yield pc.createOffer(offerOptions);
        yield pc.setLocalDescription(offer);
        socket.emit("sendOffer", offer);
    });
}
function socketOnCall(offer) {
    socket.on("gotCandidate", (candidate) => __awaiter(this, void 0, void 0, function* () {
        console.log("got ice candidate from peer");
        try {
            yield pc.addIceCandidate(candidate);
        }
        catch (e) {
            console.error("error while adding icecandidate");
        }
    }));
    socket.on("newParticipant", () => {
        console.log("new participant detected. sending SDP offer");
        socket.emit("sendOffer", offer);
    });
    socket.on("gotAnswer", (answer) => {
        if (answer) {
            console.log("got an SDP answer");
            pc.setRemoteDescription(answer);
            console.log("can trickle: ", pc.canTrickleIceCandidates);
        }
    });
}
function onJoin() {
    return __awaiter(this, void 0, void 0, function* () {
        callButton.disabled = true;
        joinButton.disabled = true;
        hangupButton.disabled = false;
        socket.connect();
        pc = new RTCPeerConnection(configuration);
        setPcListner(pc);
        localStream
            .getTracks()
            .forEach((track) => __awaiter(this, void 0, void 0, function* () { return pc.addTrack(track, localStream); }));
        socketOnJoin();
        socket.emit("joinSession", sessionInput.value);
    });
}
function socketOnJoin() {
    socket.on("gotCandidate", (candidate) => __awaiter(this, void 0, void 0, function* () {
        console.log("got ice candidate from peer");
        try {
            yield pc.addIceCandidate(candidate);
        }
        catch (e) {
            console.error("error while adding icecandidate");
        }
    }));
    socket.on("gotOffer", (offer) => __awaiter(this, void 0, void 0, function* () {
        console.log("got an SDP offer");
        if (offer) {
            pc.setRemoteDescription(offer);
        }
        try {
            const answer = yield pc.createAnswer(offerOptions);
            yield pc.setLocalDescription(answer);
            console.log("sending SDP answer");
            socket.emit("sendAnswer", answer);
            console.log("can trickle: ", pc.canTrickleIceCandidates);
        }
        catch (e) {
            console.error("Failed SDP answer", e);
        }
    }));
}
function setPcListner(pc) {
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
    ["newParticipant", "gotOffer", "gotAnswer", "gotCandidate"].forEach((str) => {
        socket.removeEventListener(str);
    });
    hangupButton.disabled = true;
    callButton.disabled = false;
    joinButton.disabled = false;
};
function gotRemoteStream(e) {
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
