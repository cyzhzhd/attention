/* eslint no-shadow: ["error", { "allow": ["state"] }] */
/* eslint-disable no-use-before-define */
import resolutions from './webRTC/resolution';
import bus from '../../../utils/bus';
import analyzeLib from './analyze/analyzeLib';

// eslint-disable-next-line no-undef
// const socket = io('localhost:3000', {
//   autoConnect: true,
// }).connect();
// eslint-disable-next-line no-undef
const socket = io('13.125.214.253:5000', {
  autoConnect: true,
}).connect();



function mediaStreamConstraints(resolution) {
  return {
    video: resolution,
    audio: {
      echoCancellation: true,
    },
  };
}

const rtcIceServerConfiguration = {
  iceServers: [
    // {
    //   // urls: 'stun:stun.l.google.com:19302',
    // urls: 'stun:swm183.com:3478',
    // },
    {
      urls: 'turn:swm183.com:3478',
      username: 'newteam183',
      credential: '12345',
    },
  ],
  iceCandidatePoolSize: 10,
};

let isStarted = false;
let isChannelReady = false;
let currentResolution = 'START';

let connectedUsers = {};
const sendingTracks = [];
let remoteStreams = {};
let screenTrack = null;

let isTrackAdded = {};
let ScreenSharing = false;

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
    // 여기가 방 만들었을 때 시점
    // 여기서 비디오 소스 하이재킹해서 분석 시작하면 됨
    // 개발버젼에서 버튼 생기면, 여기 말고 버튼 눌렀을 때 분석 시작
    // 배포버젼에서는 선생님이 수업시작 버튼 누르면 분석 시작
    // console.log(state.localVideo);
    analyzeLib.getVideoSrc(state.localVideo);

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
      console.log(mediaStreamConstraints(resolutions.qvgaConstraints));
      localStream = await navigator.mediaDevices.getUserMedia(
        mediaStreamConstraints(resolutions.startConstraints),
      );

      state.localVideo.srcObject = localStream;
      // console.log(state.localVideo);
      // console.log('state.localVideo.style', state.localVideo.style);
      // state.localVideo.style.width = '100%';
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

  async ShareScreen() {
    console.log('sending tracks = ', sendingTracks);
    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      cursor: true,
    });
    screenTrack = screenStream.getTracks();
    substitueTrack(screenTrack[0]);

    socket.emit('screenSharing', state.room, sessionId);
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

socket.on('joined', (room, socketId, clientsInRoom, isScreenSharing, id) => {
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

    if (isScreenSharing) {
      // change resolution
      adjustResolution(true);

      // 레이아웃 id 위주로 변경
      console.log(id);
    }
  } else {
    // existing users
    addPC(socketId);
  }
});


socket.on('sessionID', id => {
  sessionId = id;
});

socket.on('screenSharingMode', id => {
  // 화질 변경
  adjustResolution(true);
  // 공유한 사람 위주로 레이아웃 재편성
  console.log(id);
});
socket.on('camSharingMode', id => {
  // 화질 변경
  adjustResolution(false);
  // 레이아웃 원래대로 되돌림
  console.log(id);
});

socket.on('disconnectRequest', fromUser => {
  removeVideo(fromUser);
  addPC(fromUser);
});

socket.on('userDisconnected', (clientsInRoom, userId) => {
  removeVideo(userId);
  connectedUsers[userId].close();
});

socket.on('noSignal', payload => {
  mutations.leaveRoom({}, payload);
  alert('연결이 끊겼습니다. 방을 나갔다 다시 들어와주세요.');
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

async function addingListenerOnPC(userId, isOfferer) {
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
    if (
      connectedUsers[userId] &&
      connectedUsers[userId].iceConnectionState === 'failed'
    ) {
      console.log('restartICE');
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
    console.log(userId, '에 track을 추가하는 중.', localStream.getTracks());
    await adjustResolution();
    localStream.getTracks().forEach(track => {
      sendingTracks.push(connectedUsers[userId].addTrack(track, localStream));

      if (ScreenSharing) {
        substitueTrack(screenTrack[0]);
      }
    });

    isTrackAdded[userId] = true;
  }
}

async function adjustResolution(screenMode) {
  try {
    if (screenMode) {
      localStream = await navigator.mediaDevices.getUserMedia(
        mediaStreamConstraints(resolutions.qvgaConstraints),
      );
      currentResolution = 'QVGA';
    } else {
      localStream = await navigator.mediaDevices.getUserMedia(
        mediaStreamConstraints(resolutions.startConstraints),
      );
      currentResolution = 'START';
    }
    console.log('change resolution to ', currentResolution);
  } catch (error) {
    console.log(error);
  }

  sendingTracks
    .filter(tracks => tracks.track.kind === 'video')
    .forEach(tracks => tracks.replaceTrack(localStream.getTracks()[1]));
  state.localVideo.srcObject = localStream;
  if (isVideoMuted) {
    localStream.getTracks()[1].enabled = false;
  } else {
    localStream.getTracks()[1].enabled = true;
  }
  if (isAudioMuted) {
    localStream.getTracks()[0].enabled = false;
  } else {
    localStream.getTracks()[0].enabled = true;
  }
}

async function makeAnswer(sendFrom) {
  try {
    console.log('make answer to: ', sendFrom);
    const sessionDescription = await connectedUsers[sendFrom].createAnswer();

    connectedUsers[sendFrom].setLocalDescription(sessionDescription);

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

function substitueTrack(track) {
  sendingTracks
    .filter(tracks => tracks.track.kind === 'video')
    .forEach(tracks => tracks.replaceTrack(track));
  ScreenSharing = true;

  track.addEventListener('ended', () => {
    sendingTracks
      .filter(tracks => tracks.track.kind === 'video')
      .forEach(tracks => tracks.replaceTrack(localStream.getTracks()[1]));
    ScreenSharing = false;
    socket.emit('endScreenSharing', state.room, sessionId);
  });
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

  adjustResolution();
  state.userOnline = state.userOnline.filter(
    user => user.sessionId !== targetSessionId,
  );

  sendingTracks
    .filter(tracks => tracks.track.kind === 'video')
    .forEach(tracks => tracks.replaceTrack(localStream.getTracks()[1]));
}

function muteVideo() {
  if (!isVideoMuted) {
    localStream.getTracks()[1].enabled = false;
  } else {
    localStream.getTracks()[1].enabled = true;
  }
  isVideoMuted = !isVideoMuted;
  bus.$emit('test');
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

  while (state.videos.lastElementChild) {
    state.videos.removeChild(state.videos.lastElementChild);
  }
  state.room = null;
  state.localVideo = null;
  state.videos = null;
  state.userOnline = [];
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};

