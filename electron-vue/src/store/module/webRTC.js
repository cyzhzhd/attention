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
const socket = io(
  'backendLB-d5c9491c188b429e.elb.ap-northeast-2.amazonaws.com:3000',
  {
    autoConnect: true,
  },
).connect();

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

let connectedUsers = [];
const sendingTracks = [];
let screenTrack = null;

// let isTrackAdded = {};
let ScreenSharing = false;

let localStream;
let sessionId;
let userInfo;
let interval;

let isVideoMuted = true;
let isAudioMuted = true;

const state = {
  classroomId: '',
  classId: '',
  jwt: '',
  localVideo: '',
  tempButton1: '',
  tempButton2: '',
  videos: '',
  myId: '',
};

const getters = {
  storedRoom(state) {
    return state.classroomId;
  },
  storedLocalVideo(state) {
    return state.localVideo;
  },
};

const mutations = {
  setUser(state, id) {
    state.myId = id;
  },
  enterRoom(state, payload) {
    // 여기가 방 만들었을 때 시점
    // 여기서 비디오 소스 하이재킹해서 분석 시작하면 됨
    // 개발버젼에서 버튼 생기면, 여기 말고 버튼 눌렀을 때 분석 시작
    // 배포버젼에서는 선생님이 수업시작 버튼 누르면 분석 시작
    // console.log(state.localVideo);
    analyzeLib.getVideoSrc(state.localVideo);

    state.classroomId = payload.classroomId;
    state.classId = payload.classId;
    state.jwt = payload.jwt;

    const options = {
      token: state.jwt,
      class: state.classroomId,
      session: state.classId,
    };
    socket.emit('joinSession', options);
    console.log('enter room payload', payload);

    // signal to server every 2 sec for keeping connection
    interval = setInterval(() => socket.emit('pingSession', options), 2000);
  },
  leaveRoom(state) {
    const options = {
      token: state.jwt,
      class: state.classroomId,
      session: state.classId,
    };
    socket.emit('leaveSession', options);
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
  videoSetter(state, payload) {
    state.videos = payload.videos;
    state.localVideo = payload.localVideo;
  },
  buttonSetter1(state, button) {
    state.tempButton1 = button;
    state.tempButton1.addEventListener('click', () => {
      console.log('button clicked!');
    });
  },
  buttonSetter2(state, button) {
    state.tempButton2 = button;
    state.tempButton2.addEventListener('click', () => {
      console.log('button clicked2!');
    });
  },
};

const actions = {
  SetUser({ commit }, id) {
    commit('setUser', id);
  },
  async EnterRoom({ commit }, payload) {
    try {
      console.log(mediaStreamConstraints(resolutions.qvgaConstraints));
      localStream = await navigator.mediaDevices.getUserMedia(
        mediaStreamConstraints(resolutions.startConstraints),
      );

      state.localVideo.srcObject = localStream;
      localStream.getTracks()[0].enabled = false;
      localStream.getTracks()[1].enabled = false;
    } catch (error) {
      console.log('navigator.getUserMedia error: ', error);
    }
    commit('enterRoom', payload);
  },
  LeaveRoom({ commit }) {
    commit('leaveRoom');
  },

  async ShareScreen() {
    // on chrome
    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      cursor: true,
    });
    screenTrack = screenStream.getTracks();
    substitueTrack(screenTrack[0]);

    socket.emit('screenSharing', state.classroomId, sessionId);
  },

  ConnectWithTheUser({ commit }, targetUser) {
    console.log('ConnectWithTheUser - userInfo = ', targetUser);
    commit('connectWithTheUser', targetUser);
  },

  DisconnectWithTheUser({ commit }, targetUser) {
    console.log('ConnectWithTheUser - userInfo = ', targetUser);
    commit('disconnectWithTheUser', targetUser);
  },
  ButtonSetter1({ commit }, button) {
    commit('buttonSetter1', button);
  },
  ButtonSetter2({ commit }, button) {
    commit('buttonSetter2', button);
  },

  VideoSetter({ commit }, payload) {
    commit('videoSetter', payload);
  },

  MuteVideo() {
    if (!isVideoMuted) {
      localStream.getTracks()[1].enabled = false;
    } else {
      localStream.getTracks()[1].enabled = true;
    }
    isVideoMuted = !isVideoMuted;
    bus.$emit('test');
  },
  MuteAudio() {
    if (!isAudioMuted) {
      localStream.getTracks()[0].enabled = false;
    } else {
      localStream.getTracks()[0].enabled = true;
    }
    isAudioMuted = !isAudioMuted;
  },
};

// communication with signaling server
function sendMessage(message) {
  message.token = state.jwt;
  message.class = state.classroomId;
  message.session = state.classId;
  socket.emit('sendSignal', message);
}

function startClass(userlist) {
  isChannelReady = true;
  isStarted = true;
  connectedUsers.push(...userlist);
}

function findJoiningUser(userlist) {
  let joiningUser;
  userlist.forEach(newUser => {
    if (findUserById(newUser.user) === null) joiningUser = newUser;
  });

  return joiningUser;
}

function findLeavingUser(userlist) {
  let leavingUser;
  let index;
  connectedUsers.forEach((existingUser, idx) => {
    let hasFound = false;
    userlist.forEach(newUser => {
      if (existingUser.user === newUser.user) hasFound = true;
    });
    if (!hasFound) {
      leavingUser = existingUser;
      index = idx;
    }
  });

  return { leavingUser, index };
}

function findUserById(userId) {
  let sentFrom = null;
  connectedUsers.some(user => {
    if (user.user === userId) {
      sentFrom = user;
      return true;
    }
    return false;
  });
  return sentFrom;
}

function addUser(userlist) {
  const joiningUser = findJoiningUser(userlist);
  connectedUsers.push(joiningUser);
  joiningUser.rtc = new RTCPeerConnection(rtcIceServerConfiguration);
  addingListenerOnPC(joiningUser);
}

function removeUser(userlist) {
  const { leavingUser, index } = findLeavingUser(userlist);
  leavingUser.rtc.close();
  removeVideo(leavingUser.user);
  connectedUsers.splice(index, 1);
}

function joiningClass(userlist) {
  userlist.forEach(ul => {
    connectedUsers.push(ul);
  });
  isStarted = true;

  console.log('creating peer connection');
  createPeerConnection();
}

function manageUserlist(userlist) {
  console.log('userList', userlist);

  if (userlist.length > connectedUsers.length) {
    // user joined
    if (!isChannelReady) {
      // new users
      joiningClass(userlist);
    } else {
      // existing users
      addUser(userlist);
    }
  } else if (userlist.length < connectedUsers.length) {
    // user left
    console.log('user left');
    removeUser(userlist);
  }
}
socket.on('sendUserList', userlist => {
  console.log('sendUserList');
  if (userlist.length === 1 && !isStarted) {
    startClass(userlist);
    return;
  }
  manageUserlist(userlist);
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

socket.on('deliverDisconnection ', () => {
  mutations.leaveRoom();
  alert('연결이 끊겼습니다. 방을 나갔다 다시 들어와주세요.');
});

socket.on('deliverSignal', message => {
  console.log('message =', message);
  const { content } = message;
  if (content.type === 'offer') {
    const sentFrom = findUserById(message.user);
    console.log('got offer from =', sentFrom);
    sentFrom.rtc.setRemoteDescription(new RTCSessionDescription(content.sdp));
    addTrackOnPC(sentFrom);
    console.log('answer 만드는 중');
    makeAnswer(sentFrom);
  } else if (content.type === 'answer' && isStarted) {
    const sentFrom = findUserById(message.user);
    console.log('got answer from: ', sentFrom);
    sentFrom.rtc.setRemoteDescription(new RTCSessionDescription(content.sdp));
  } else if (content.type === 'candidate' && isStarted) {
    const sentFrom = findUserById(message.user);
    console.log('got candidate from: ', sentFrom);
    const candidate = new RTCIceCandidate({
      sdpMLineIndex: content.label,
      candidate: content.candidate,
    });
    sentFrom.rtc.addIceCandidate(candidate);
  }
});

// RTC part
function createPeerConnection() {
  console.log('connected Users =', connectedUsers);
  connectedUsers.forEach(user => {
    if (user.user !== state.myId) {
      /* eslint no-param-reassign: "error" */
      user.rtc = new RTCPeerConnection(rtcIceServerConfiguration);
      addingListenerOnPC(user, true);
    }
  });
}

function addPC(user, isOfferer = false) {
  console.log(isOfferer);
}

function makeOffer(user) {
  // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/negotiationneeded_event
  user.rtc.addEventListener('negotiationneeded', async () => {
    try {
      console.log('offering sdp');
      const offer = await user.rtc.createOffer();
      user.rtc.setLocalDescription(offer);
      sendMessage({
        sendTo: user.socket,
        content: {
          type: 'offer',
          sdp: offer,
        },
      });

      console.log('offer created for a user: ', user);
      isChannelReady = true;
    } catch (e) {
      console.error('Failed to create pc session description', e);
    }
  });
}

function setOnTrackEvent(user) {
  // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/track_event
  user.rtc.addEventListener('track', event => {
    console.log('비디오가 추가될 때, evnet = ', event);
    if (event) {
      const childVideos = state.videos.childNodes;
      let hasAdded = false;
      childVideos.forEach(node => {
        if (node.id === user.user) {
          hasAdded = true;
        }
      });
      if (!hasAdded) {
        const div = document.createElement('div');
        div.id = user.user;

        const video = document.createElement('video');
        const src = event.streams[0];
        video.srcObject = src;
        video.autoplay = true;
        video.playsinline = true;
        video.userId = user.user;
        div.appendChild(video);

        const p = document.createElement('p');
        const foundUser = findUserById(user.user);
        const textNode = document.createTextNode(foundUser.name);
        p.appendChild(textNode);
        div.appendChild(p);

        state.videos.appendChild(div);
      }
    }
  });
}

function setOnIceConnectionStateChange(user) {
  user.rtc.addEventListener('iceconnectionstatechange', () => {
    if (user.rtc.iceConnectionState === 'failed') {
      console.log('restartICE');
      user.rtc.restartIce();
    }
  });
}

function setOnIceCandidate(user) {
  // setLocalDescription()에 의해 호출 됌.
  // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/icecandidate_event
  user.rtc.addEventListener('icecandidate', event => {
    // console.log('icecandidate event: ', event);
    if (event.candidate) {
      sendMessage({
        sendTo: user.socket,
        content: {
          type: 'candidate',
          label: event.candidate.sdpMLineIndex,
          id: event.candidate.sdpMid,
          candidate: event.candidate.candidate,
        },
      });
    } else {
      console.log('End of candidates.');
    }
  });
}

function addTrackOnPC(user) {
  if (localStream !== undefined) {
    console.log(user.user, '에 track을 추가하는 중.', localStream.getTracks());
    // await adjustResolution();
    localStream.getTracks().forEach(track => {
      sendingTracks.push(user.rtc.addTrack(track, localStream));
      console.log('track added sendingTracks', sendingTracks);
      if (ScreenSharing) {
        // substitueTrack(screenTrack[0]);
      }
    });
  }
}

async function addingListenerOnPC(user, isOfferer = false) {
  setOnIceCandidate(user);
  setOnIceConnectionStateChange(user);
  setOnTrackEvent(user);
  if (isOfferer) {
    makeOffer(user);
    addTrackOnPC(user);
  }
}

async function adjustResolution(screenMode) {
  console.log(screenMode);
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

async function makeAnswer(sentFrom) {
  try {
    console.log('make answer to: ', sentFrom);
    const sessionDescription = await sentFrom.rtc.createAnswer();

    sentFrom.rtc.setLocalDescription(sessionDescription);

    console.log('makeAnswer ', sessionDescription);
    sendMessage({
      sendTo: sentFrom.socket,
      content: {
        type: 'answer',
        sdp: sessionDescription,
      },
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
    socket.emit('endScreenSharing', state.classroomId, sessionId);
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

  // adjustResolution();

  // sendingTracks
  //   .filter(tracks => tracks.track.kind === 'video')
  //   .forEach(tracks => tracks.replaceTrack(localStream.getTracks()[1]));
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
  while (state.videos.lastElementChild) {
    state.videos.removeChild(state.videos.lastElementChild);
  }

  isStarted = false;
  isChannelReady = false;
  connectedUsers = [];
  localStream = null;
  isVideoMuted = true;
  isAudioMuted = true;
  state.classroomId = null;
  state.localVideo = null;
  state.videos = null;
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
