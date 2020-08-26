/* eslint no-shadow: ["error", { "allow": ["state"] }] */
/* eslint-disable no-use-before-define */
// eslint-disable-next-line no-undef
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
  audio: {
    echoCancellation: true,
  },
};

const rtcIceServerConfiguration = {
  iceServers: [
    {
      urls: ['stun:stun.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
};

let isStarted = false;
let isChannelReady = false;

let connectedUsers = {};
let remoteStreams = {};

let isTrackAdded = {};

let localStream;
let sessionId;
let userInfo;
let roomName;
let interval;

let isVideoMuted = true;
let isAudioMuted = true;

const state = {
  room: '',
  localVideo: '',
  videos: '',
  user: {},
  userOnline: [],
};

const getters = {
  storedRoom(state) {
    return state.room;
  },
};

const mutations = {
  setUser(state, user) {
    state.user = user;
    state.userOnline.push(user);
    userInfo = { user, sessionId };
  },
  enterRoom(state, payload) {
    state.room = payload.roomName;
    roomName = payload.roomName;
    socket.emit('create or join', payload.roomName, state.user, payload.roomId);
    console.log(`${payload.roomName}을 생성 또는 ${payload.roomName}에 참가`);

    // signal to server every 2 sec for keeping connection
    interval = setInterval(() => socket.emit('ImOnline', state.room), 2000);
  },
  leaveRoom(state, payload) {
    console.log('js에서 roomId', payload.roomId);
    socket.emit('leave room', payload.roomName, payload.roomId);
    console.log(`${payload.roomName}을 떠남`);

    disconnectWebRTC();
  },

  connectWithTheUser(state, targetUser) {
    if (connectedUsers[targetUser.sessionId].connectionState === 'connected') {
      alert(`you are already connected with ${targetUser.displayName}`);
    } else {
      addPC(targetUser.sessionId, true);
    }
  },

  disconnectWithTheUser(state, targetUser) {
    if (connectedUsers[targetUser.sessionId].connectionState === 'connected') {
      connectedUsers[targetUser.sessionId].close();
      removeVideo(targetUser.sessionId);
      socket.emit(
        'disconnectRequest',
        userInfo.sessionId,
        targetUser.sessionId,
      );

      addPC(targetUser.sessionId);
    }
  },

  localVideoSetter(state, localVideo) {
    state.localVideo = localVideo;
  },

  videoSetter(state, video) {
    state.videos = video;
  },
};

const actions = {
  SetUser({ commit }, user) {
    commit('setUser', user);
  },
  async EnterRoom({ commit }, payload) {
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
    commit('enterRoom', payload);
  },
  LeaveRoom({ commit }, payload) {
    commit('leaveRoom', payload);
  },

  ConnectWithTheUser({ commit }, targetUser) {
    console.log('ConnectWithTheUser - userInfo = ', targetUser);
    commit('connectWithTheUser', targetUser);
  },

  DisconnectWithTheUser({ commit }, targetUser) {
    console.log('ConnectWithTheUser - userInfo = ', targetUser);
    commit('disconnectWithTheUser', targetUser);
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
  // console.log('Client sending message: ', message);
  socket.emit('message', message);
}

socket.on('created', (room, clientsInRoom) => {
  console.log('방 생성 시, state.userList의 상태', clientsInRoom);
  console.log('방 생성 시, userInfo의 상태', userInfo);

  console.log(`created ${room}`);
  isChannelReady = true;
  isStarted = true;
});

socket.on('joined', (room, socketId, clientsInRoom) => {
  console.log(`${socketId} joined ${room}`);
  console.log('userList', clientsInRoom.sockets);
  console.log('socketId === sessionId', socketId === userInfo.sessionId);

  if (!isChannelReady) {
    // new users
    connectedUsers = { ...clientsInRoom.sockets };
    console.log(
      '방에 들어온 유저의 connectedUsers before delete = ',
      connectedUsers,
    );
    delete connectedUsers[userInfo.sessionId];
    console.log(
      '방에 들어온 유저의 connectedUsers after delete = ',
      connectedUsers,
    );
    remoteStreams = { ...clientsInRoom.sockets };
    delete remoteStreams[userInfo.sessionId];
    isTrackAdded = { ...clientsInRoom.sockets };
    isStarted = true;

    console.log('creating peer connection');
    createPeerConnection();
  } else {
    // existing users
    addPC(socketId);
  }
});

socket.on('sessionID', id => {
  sessionId = id;
});

socket.on('disconnectRequest', fromUser => {
  removeVideo(fromUser);
  addPC(fromUser);
});

socket.on('userLeft', (clientsInRoom, userId) => {
  removeVideo(userId);
});

// socket.on('log', array => {
//   console.log(array);
// });

socket.on('message', message => {
  console.log('message =', message);
  if (message.type === 'offer') {
    console.log('got offer from =', message.userInfo.sessionId);
    console.log(
      'connectedUsers의 상태는? ',
      connectedUsers[message.userInfo.sessionId],
    );
    console.log('connectedUsers는? ', connectedUsers);
    console.log(
      'got offer connectedUsers[message.userInfo.sessionId] =',
      connectedUsers[message.userInfo.sessionId],
    );
    if (!state.userOnline.includes(message.userInfo)) {
      state.userOnline.push(message.userInfo);
    }

    connectedUsers[message.userInfo.sessionId].setRemoteDescription(
      new RTCSessionDescription(message.sdp),
    );
    console.log('answer 만드는 중');
    makeAnswer(message.userInfo.sessionId);
  } else if (message.type === 'answer' && isStarted) {
    console.log('got answer from: ', message.userInfo.sessionId);
    if (!state.userOnline.includes(message.userInfo)) {
      state.userOnline.push(message.userInfo);
    }

    connectedUsers[message.userInfo.sessionId].setRemoteDescription(
      new RTCSessionDescription(message.sdp),
    );
  } else if (message.type === 'candidate' && isStarted) {
    console.log('got candidate from: ', message.userInfo.sessionId);
    const candidate = new RTCIceCandidate({
      sdpMLineIndex: message.label,
      candidate: message.candidate,
    });
    connectedUsers[message.userInfo.sessionId].addIceCandidate(candidate);
  }
});

// RTC part
function createPeerConnection() {
  console.log('roomName=', roomName);
  console.log('connected Users =', connectedUsers);
  const keys = Object.keys(connectedUsers);
  keys.map(user => {
    addPC(user, true);
    return user;
  });
}

function addPC(userId, isOfferer = false) {
  connectedUsers[userId] = new RTCPeerConnection(rtcIceServerConfiguration);
  remoteStreams[userId] = new MediaStream();
  isTrackAdded[userId] = false;

  addingListenerOnPC(userId, isOfferer);
}

function addingListenerOnPC(userId, isOfferer) {
  // setLocalDescription()에 의해 호출 됌.
  // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/icecandidate_event
  connectedUsers[userId].addEventListener('icecandidate', event => {
    // console.log('icecandidate event: ', event);
    if (event.candidate) {
      sendMessage({
        type: 'candidate',
        label: event.candidate.sdpMLineIndex,
        id: event.candidate.sdpMid,
        candidate: event.candidate.candidate,
        sendTo: userId,
        userInfo,
        room: roomName,
      });
    } else {
      console.log('End of candidates.');
    }
  });

  connectedUsers[userId].addEventListener('iceconnectionstatechange', () => {
    if (connectedUsers[userId].iceConnectionState === 'failed') {
      connectedUsers[userId].restartIce();
    }
  });

  // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/track_event
  connectedUsers[userId].ontrack = event => {
    // 정 안되면 여기에 videos에서 video.userid === user와 같은 거 있는지 확인해야지 뭐 ....
    console.log('비디오가 추가될 때, evnet = ', event);
    console.log('비디오가 추가될 때, evnet.streams = ', event.streams);
    if (event) {
      const childVideos = state.videos.childNodes;
      let hasAdded = false;
      childVideos.forEach(node => {
        if (node.id === userId) {
          hasAdded = true;
        }
      });
      if (!hasAdded) {
        console.log('childVideos = ', childVideos);
        console.log('Remote stream added.', event.streams[0]);
        // eslint-disable-next-line prefer-destructuring
        remoteStreams[userId] = event.streams[0];
        const div = document.createElement('div');
        div.id = userId;

        const video = document.createElement('video');
        video.srcObject = remoteStreams[userId];
        video.autoplay = true;
        video.playsinline = true;
        video.userId = userId;
        div.appendChild(video);

        let userName;
        console.log('state.userOnline = ', state.userOnline);
        state.userOnline.some(userinfo => {
          if (userinfo.sessionId === userId) {
            console.log(userinfo.user.displayName);
            userName = userinfo.user.displayName;
            return true;
          }
          return false;
        });
        const p = document.createElement('p');
        p.innerHTML = userName;
        div.appendChild(p);

        state.videos.appendChild(div);
      }
    }
  };

  // if (isOfferer) {
  //   // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/negotiationneeded_event
  //   connectedUsers[userId].addEventListener(
  //     'negotiationneeded',
  //     createSDPOffer,
  //   );
  // }

  if (isOfferer) {
    // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/negotiationneeded_event
    connectedUsers[userId].addEventListener('negotiationneeded', async () => {
      try {
        console.log('offering sdp');
        const offer = await connectedUsers[userId].createOffer();
        connectedUsers[userId].setLocalDescription(offer);
        sendMessage({
          type: 'offer',
          sendTo: userId,
          userInfo,
          sdp: offer,
          room: roomName,
        });

        console.log('offer created for a user: ', connectedUsers[userId]);
        isChannelReady = true;
      } catch (e) {
        console.error('Failed to create pc session description', e);
      }
    });
  }

  if (!(localStream === undefined || isTrackAdded[userId])) {
    console.log(userId, '에 track을 추가하는 중.');
    localStream.getTracks().forEach(track => {
      connectedUsers[userId].addTrack(track, localStream);
    });

    isTrackAdded[userId] = true;
  }
}

async function makeAnswer(sendFrom) {
  try {
    console.log('make answer to: ', sendFrom);
    const sessionDescription = await connectedUsers[sendFrom].createAnswer();

    connectedUsers[sendFrom].setLocalDescription(sessionDescription);

    // if (!isTrackAdded[sendFrom]) {
    //   localStream
    //     .getTracks()
    //     .forEach(async track =>
    //       connectedUsers[sendFrom].addTrack(track, localStream),
    //     );
    //   console.log('localStream added on the RTCPeerConnection');
    //   isTrackAdded[sendFrom] = true;
    // }

    console.log('makeAnswer ', sessionDescription);
    sendMessage({
      type: 'answer',
      sendTo: sendFrom,
      userInfo,
      sdp: sessionDescription,
      room: roomName,
    });
  } catch (error) {
    console.trace(`Failed to create session description: ${error.toString()}`);
  }
}

function removeVideo(targetSessionId) {
  const childVideosNodeList = state.videos.childNodes;
  // eslint-disable-next-line no-restricted-syntax
  for (const node of childVideosNodeList) {
    if (node.id === targetSessionId) {
      state.videos.removeChild(node);
      break;
    }
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

  clearInterval(interval);
  resetVariables();
}

function resetVariables() {
  isStarted = false;
  isChannelReady = false;

  connectedUsers = {};
  remoteStreams = {};
  isTrackAdded = {};

  localStream = null;
  roomName = null;
  isVideoMuted = true;
  isAudioMuted = true;

  state.room = null;
  state.localVideo = null;
  state.videos = null;
  state.userList = ['none', 'of'];
  state.userOnline = [];
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
