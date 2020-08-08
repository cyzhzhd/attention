/* eslint no-shadow: ["error", { "allow": ["state"] }] */
/* eslint-disable no-use-before-define */

// const socket = io('localhost:3000', {
//   autoConnect: false,
// }).connect();
// eslint-disable-next-line no-undef
const socket = io('13.125.214.253:3000', {
  autoConnect: false,
}).connect();

const mediaStreamConstraints = {
  video: true,
  audio: false,
};

const rtcIceServerConfiguration = {
  iceServers: [
    {
      urls: ['stun:stun.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
};

// eslint-disable-next-line no-unused-vars
let isInitiator = false;
let isStarted = false;
let isChannelReady = false;

let connectedUsers = {};
let remoteStreams;
let isTrackAdded;

let localStream;
let sessionId;
let roomContainer;

const state = {
  room: '',
  localVideo: '',
  videos: [],
  userList: ['none', 'of'],
};

const getters = {
  storedRoom(state) {
    return state.room;
  },
  storedUserList(state) {
    console.log('in the getters, state.userList = ', state.userList);
    return state.userList;
  },
};

const mutations = {
  enterRoom(state, roomName) {
    state.room = roomName;
    roomContainer = roomName;
    socket.emit('create or join', roomName);
    console.log(`${roomName}을 생성 또는 ${roomName}에 참가`);
  },
  leaveRoom(state, roomName) {
    state.room = '';
    roomContainer = '';
    // socket.emit('leave room', roomName);
    console.log(`${roomName}을 떠남`);
  },
  setUserList(state, userList) {
    console.log('setUserList가 호출됌', userList);
    console.log('setUserList가 호출됌 state', state);
    // state.userList = Object.keys(state);
    // console.log('state.userList = ', state.userList);
  },
  onStart(state, mediaStream) {
    localStream = mediaStream;
    state.localVideo.srcObject = mediaStream;
    // startButton.disabled = true;
    // callButton.disabled = false;
  },

  startConnecting() {
    console.log(
      'start status: ',
      isStarted,
      ' localStream :',
      localStream,
      ' Channel Ready: ',
      isChannelReady,
    );
    //   callButton.disabled = true;
    //   hangupButton.disabled = false;

    console.log('creating peer connection');
    createPeerConnection();

    isStarted = true;
    isChannelReady = true;
  },

  localVideoSetter(state, localVideo) {
    state.localVideo = localVideo;
  },

  videoSetter(state, video) {
    state.videos = video;
  },
};

const actions = {
  EnterRoom({ commit }, roomName) {
    commit('enterRoom', roomName);
  },
  LeaveRoom({ commit }, roomName) {
    commit('leaveRoom', roomName);
  },
  async OnStart({ commit }) {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia(
        mediaStreamConstraints,
      );
      commit('onStart', mediaStream);
    } catch (error) {
      console.log('navigator.getUserMedia error: ', error);
    }
  },

  StartConnecting({ commit }) {
    commit('startConnecting');
  },

  LocalVideoSetter({ commit }, localVideo) {
    commit('localVideoSetter', localVideo);
  },

  VideoSetter({ commit }, video) {
    commit('videoSetter', video);
  },
};

// communication with signaling server

function sendMessage(message) {
  console.log('Client sending message: ', message);
  socket.emit('message', message);
}

socket.on('created', (room, clientsInRoom) => {
  console.log('방 생성 시, state.userList의 상태', clientsInRoom);

  console.log(`created ${room}`);
  isInitiator = true;
});

socket.on('joined', (room, socketId, clientsInRoom) => {
  console.log(`${socketId} joined ${room}`);
  mutations.setUserList(clientsInRoom.sockets);

  if (!isChannelReady) {
    // new users
    console.log(typeof connectedUsers);
    connectedUsers = Object.assign({}, ...clientsInRoom.sockets);
    delete connectedUsers[sessionId];
    remoteStreams = Object.assign({}, ...clientsInRoom.sockets);
    delete remoteStreams[sessionId];
    isTrackAdded = Object.assign({}, ...clientsInRoom.sockets);
    const key = Object.keys(isTrackAdded);
    key.map(user => {
      isTrackAdded[user] = false;
      return isTrackAdded;
    });
  } else {
    // existing users
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

socket.on('sessionID', id => {
  sessionId = id;
  //   HTMLSessionID.textContent = sessionId;
});

socket.on('disconnect', () => {
  //   HTMLSessionID.textContent = 'call first';
  sessionId = 'call first';
});

socket.on('left', clientsInRoom => {
  mutations.setUserList(clientsInRoom.sockets);
});

socket.on('log', array => {
  console.log(array);
});

socket.on('message', message => {
  if (message.type === 'offer') {
    console.log('got offer from: ', message.sendFrom);
    if (connectedUsers[message.sendFrom] !== true) {
      connectedUsers[message.sendFrom].setRemoteDescription(
        new RTCSessionDescription(message.sdp),
      );
      makeAnswer(message.sendFrom);
    }
  } else if (message.type === 'answer' && isStarted) {
    // 방에 들어와만 있고 시작을 안했을 때 오퍼를 받는다?
    console.log('got answer from: ', message.sendFrom);
    connectedUsers[message.sendFrom].setRemoteDescription(
      new RTCSessionDescription(message.sdp),
    );
  } else if (message.type === 'candidate' && isStarted) {
    console.log('got candidate from: ', message.sendFrom);
    const candidate = new RTCIceCandidate({
      sdpMLineIndex: message.label,
      candidate: message.candidate,
    });
    connectedUsers[message.sendFrom].addIceCandidate(candidate);
  } else if (message.type === 'bye' && isStarted) {
    // handleRemoteHangup();
  } else if (message.type === 'muted') {
    // muteRemoteVideo();
  }
});

// RTC part

// if (this.room !== '') {
//   socket.emit('create or join', this.room);
//   console.log(`${this.room}을 생성 또는 ${this.room}에 참가`);
// }

function createPeerConnection() {
  console.log('roomContainer=', roomContainer);
  console.log(connectedUsers);
  const keys = Object.keys(connectedUsers);
  keys.map(user => {
    connectedUsers[user] = new RTCPeerConnection(rtcIceServerConfiguration);

    addingListenerOnPC(user);
    console.log('Created RTCPeerConnection');
    return connectedUsers[user];
  });
}

function addingListenerOnPC(user) {
  // setLocalDescription()에 의해 호출 됌.
  // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/icecandidate_event
  connectedUsers[user].addEventListener('icecandidate', event => {
    console.log('icecandidate event: ', event);
    if (event.candidate) {
      sendMessage({
        type: 'candidate',
        label: event.candidate.sdpMLineIndex,
        id: event.candidate.sdpMid,
        candidate: event.candidate.candidate,
        sendTo: user,
        sendFrom: sessionId,
        room: roomContainer,
      });
    } else {
      console.log('End of candidates.');
    }
  });

  // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/track_event
  connectedUsers[user].ontrack = event => {
    console.log('Remote stream added.');
    // eslint-disable-next-line prefer-destructuring
    remoteStreams[user] = event.streams[0];
    const video = document.createElement('video');
    video.srcObject = remoteStreams[user];
    video.autoplay = true;
    video.playsinline = true;
    this.videos.appendChild(video);
  };

  // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/negotiationneeded_event
  connectedUsers[user].addEventListener('negotiationneeded', createSDPOffer);

  console.log('문제 부분', connectedUsers[user]);
  if (!(localStream === undefined || isTrackAdded[user])) {
    localStream.getTracks().forEach(track => {
      console.log('뭐가 문제일까?', connectedUsers[user]);
      console.log('뭐가 문제일까?', connectedUsers);
      console.log('뭐가 문제일까?', user);
      console.log('뭐가 문제일까? addtrack', connectedUsers[user].addTrack);
      connectedUsers[user].addTrack(track, localStream);
    });
    // connectedUsers[user].addStream(localStream);
    console.log('localStream added on the RTCPeerConnection');
    isTrackAdded[user] = true;
  }
}

async function createSDPOffer() {
  try {
    // eslint-disable-next-line no-restricted-syntax
    for (const user in connectedUsers) {
      if (connectedUsers[user].localDescription !== null) {
        // eslint-disable-next-line no-continue
        continue;
      }
      console.log('offering sdp');
      // eslint-disable-next-line no-await-in-loop
      const offer = await connectedUsers[user].createOffer();
      connectedUsers[user].setLocalDescription(offer);
      sendMessage({
        type: 'offer',
        sendTo: user,
        sendFrom: sessionId,
        sdp: connectedUsers[user].localDescription,
        room: roomContainer,
      });

      console.log('offer created for a user: ', connectedUsers[user]);
    }
  } catch (e) {
    console.error('Failed to create pc session description', e);
  }
}

async function makeAnswer(sendFrom) {
  try {
    console.log('make answer to: ', sendFrom);
    const sessionDescription = await connectedUsers[sendFrom].createAnswer();

    connectedUsers[sendFrom].setLocalDescription(sessionDescription);

    // if (!(localStream === undefined || isTrackAdded[sendFrom])) {
    if (!isTrackAdded[sendFrom]) {
      console.log(localStream.getTracks());
      localStream
        .getTracks()
        .forEach(async track =>
          connectedUsers[sendFrom].addTrack(track, localStream),
        );
      console.log('localStream added on the RTCPeerConnection');
      isTrackAdded[sendFrom] = true;
    }

    console.log('makeAnswer ', sessionDescription);
    sendMessage({
      type: 'answer',
      sendTo: sendFrom,
      sendFrom: sessionId,
      sdp: connectedUsers[sendFrom].localDescription,
      room: roomContainer,
    });
  } catch (error) {
    console.trace(`Failed to create session description: ${error.toString()}`);
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
