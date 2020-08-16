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
  video: {
    height: 240,
    width: 420,
  },
  audio: true,
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
let remoteStreams = {};
let isTrackAdded = {};

let localStream;
let sessionId;
let roomContainer;

let isVideoMuted = true;
let isAudioMuted = true;

const state = {
  room: '',
  localVideo: '',
  videos: '',
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
    socket.emit('leave room', roomName);
    console.log(`${roomName}을 떠남`);

    disconnectWebRTC();
  },
  setUserList(state, userList) {
    console.log('setUserList가 호출됌', userList);
    console.log('setUserList가 호출됌 state', state);
    // state.userList = Object.keys(state);
    // console.log('state.userList = ', state.userList);
  },
  //   onStart(state) {
  //     state.localVideo.srcObject = localStream;
  //     startButton.disabled = true;
  //     callButton.disabled = false;
  //   },

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

    // isStarted = true;
    // isChannelReady = true;
  },

  localVideoSetter(state, localVideo) {
    state.localVideo = localVideo;
  },

  videoSetter(state, video) {
    state.videos = video;
  },
};

const actions = {
  async EnterRoom({ commit }, roomName) {
    try {
      localStream = await navigator.mediaDevices.getUserMedia(
        mediaStreamConstraints,
      );

      state.localVideo.srcObject = localStream;
      localStream.getTracks()[0].enabled = false;
      localStream.getTracks()[1].enabled = false;
    } catch (error) {
      console.log('navigator.getUserMedia error: ', error);
    }
    commit('enterRoom', roomName);
  },
  LeaveRoom({ commit }, roomName) {
    commit('leaveRoom', roomName);
  },
  OnStart({ commit }) {
    commit('onStart');
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

  MuteVideo() {
    muteVideo();
  },
  MuteAudio() {
    muteAudio();
  },
};

// communication with signaling server

function sendMessage(message) {
  console.log('Client sending message: ', message);
  socket.emit('message', message);
}

socket.on('created', (room, clientsInRoom) => {
  console.log(
    '방 생성 시, state.userList의 상태',
    clientsInRoom,
    state.userList,
  );

  console.log(`created ${room}`);
  isInitiator = true;
  isChannelReady = true;
});

socket.on('joined', (room, socketId, clientsInRoom) => {
  console.log(`${socketId} joined ${room}`);
  // mutations.setUserList(clientsInRoom.sockets);
  console.log('userList', clientsInRoom.sockets);
  console.log('socketId === sessionId', socketId === sessionId);

  if (!isChannelReady) {
    // new users
    connectedUsers = { ...clientsInRoom.sockets };
    console.log(
      '방에 들어온 유저의 connectedUsers before delete = ',
      connectedUsers,
    );
    delete connectedUsers[sessionId];
    console.log(
      '방에 들어온 유저의 connectedUsers after delete = ',
      connectedUsers,
    );
    remoteStreams = { ...clientsInRoom.sockets };
    delete remoteStreams[sessionId];
    isTrackAdded = { ...clientsInRoom.sockets };
    const key = Object.keys(isTrackAdded);
    key.map(user => {
      isTrackAdded[user] = false;
      return isTrackAdded;
    });

    console.log('creating peer connection');
    createPeerConnection();

    isStarted = true;
  } else {
    // existing users
    connectedUsers[socketId] = new RTCPeerConnection(rtcIceServerConfiguration);
    console.log('기존 유저의 conenctedUserlist = ', connectedUsers);
    remoteStreams[socketId] = new MediaStream();
    isTrackAdded[socketId] = false;
    console.log('remote streams = ', remoteStreams);

    console.log('방에 있던 유저의 connectedUsers = ', connectedUsers);
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

socket.on('userLeft', (clientsInRoom, userId) => {
  console.log(
    '서버로 부터 left 받음. 방에 남아 있는 유저 목록 = ',
    clientsInRoom.sockets,
  );

  const childVideosNodeList = state.videos.childNodes;
  console.log(childVideosNodeList);
  // eslint-disable-next-line no-restricted-syntax
  for (const node in childVideosNodeList) {
    if (childVideosNodeList[node].userId === userId) {
      console.log('지워질 node의 이름은 = ', childVideosNodeList[node]);
      state.videos.removeChild(childVideosNodeList[node]);
      break;
    }
  }
  console.log('지워지고 난 후 videos = ', childVideosNodeList);
});

socket.on('log', array => {
  console.log(array);
});

socket.on('message', message => {
  if (message.type === 'offer') {
    console.log('connectedUsers의 상태는? ', connectedUsers[message.sendFrom]);
    console.log('connectedUsers는? ', connectedUsers);
    // if (connectedUsers[message.sendFrom] === true) {
    console.log('got offer from =', message.sendFrom);
    console.log(
      'got offer connectedUsers[message.sendFrom] =',
      connectedUsers[message.sendFrom],
    );
    connectedUsers[message.sendFrom].setRemoteDescription(
      new RTCSessionDescription(message.sdp),
    );
    console.log('answer 만드는 중');
    makeAnswer(message.sendFrom);
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
function createPeerConnection() {
  console.log('roomContainer=', roomContainer);
  console.log('connected Users =', connectedUsers);
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
    // 정 안되면 여기에 videos에서 video.userid === user와 같은 거 있는지 확인해야지 뭐 ....
    console.log('Remote stream added.', event.streams[0]);
    // eslint-disable-next-line prefer-destructuring
    remoteStreams[user] = event.streams[0];
    const video = document.createElement('video');
    video.srcObject = remoteStreams[user];
    video.autoplay = true;
    video.playsinline = true;
    video.userId = user;
    state.videos.appendChild(video);
  };

  // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/negotiationneeded_event
  connectedUsers[user].addEventListener('negotiationneeded', createSDPOffer);

  if (!(localStream === undefined || isTrackAdded[user])) {
    localStream.getTracks().forEach(track => {
      console.log('트랙이 두 번 = ', track);
      connectedUsers[user].addTrack(track, localStream);
    });

    // connectedUsers[user].addTrack(localStream.getTracks()[0], localStream);
    // connectedUsers[user].addTrack(localStream.getTracks()[1], localStream);

    isTrackAdded[user] = true;
  }
}

async function createSDPOffer() {
  if (!isChannelReady || isInitiator) {
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
        isChannelReady = true;
      }
    } catch (e) {
      console.error('Failed to create pc session description', e);
    }
  }
}

async function makeAnswer(sendFrom) {
  try {
    console.log('make answer to: ', sendFrom);
    const sessionDescription = await connectedUsers[sendFrom].createAnswer();

    connectedUsers[sendFrom].setLocalDescription(sessionDescription);

    // if (!(localStream === undefined || isTrackAdded[sendFrom])) {
    if (!isTrackAdded[sendFrom]) {
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

function muteVideo() {
  if (!isVideoMuted) {
    localStream.getTracks()[1].enabled = false;
  } else {
    localStream.getTracks()[1].enabled = true;
  }
  isVideoMuted = !isVideoMuted;
}
function muteAudio() {
  if (!isAudioMuted) {
    localStream.getTracks()[0].enabled = false;
  } else {
    localStream.getTracks()[0].enabled = true;
  }
  isAudioMuted = !isAudioMuted;
}

function disconnectWebRTC() {
  localStream.getTracks().forEach(track => {
    if (track.readyState === 'live') {
      track.stop();
    }
  });
  resetVariables();
}

function resetVariables() {
  isInitiator = false;
  isStarted = false;
  isChannelReady = false;

  connectedUsers = {};
  remoteStreams = {};
  isTrackAdded = {};

  localStream = null;
  roomContainer = null;
  isVideoMuted = true;
  isAudioMuted = true;

  state.room = null;
  state.localVideo = null;
  state.videos = null;
  state.userList = ['none', 'of'];
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
