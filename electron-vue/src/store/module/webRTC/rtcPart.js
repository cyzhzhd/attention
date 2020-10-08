/* eslint-disable no-use-before-define */
import resolutions from './resolution';
import bus from '../../../../utils/bus';

// eslint-disable-next-line no-undef
const socket = io('https://be.swm183.com:3000', {
  autoConnect: true,
  transports: ['websocket'],
}).connect();

let isStarted = false;
let isChannelReady = false;
let currentResolution = 'START';
let isScreenSharing;
let screenSharingUser;
let screenSharingTrack;

let connectedUsers = [];
let sendingTracks = [];

let localStream;
let isVideoMuted = true;
let isAudioMuted = true;
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

let state = {};

function initRTCPART(payload) {
  state = payload;
}

function emitEvent(eventName, payload) {
  socket.emit(eventName, payload);
}

function mediaStreamConstraints(resolution) {
  return {
    video: resolution,
    audio: {
      echoCancellation: true,
    },
  };
}

async function getUserMedia() {
  try {
    localStream = await navigator.mediaDevices.getUserMedia(
      mediaStreamConstraints(resolutions.startConstraints),
    );
    localStream.getTracks()[0].enabled = false;
    localStream.getTracks()[1].enabled = false;
  } catch (error) {
    console.log('navigator.getUserMedia error: ', error);
  }

  return localStream;
}

function sendMessage(type, message) {
  message.token = state.jwt;
  message.class = state.classroomId;
  message.session = state.classId;
  socket.emit(type, message);
}

function startClass(userlist) {
  isChannelReady = true;
  isStarted = true;
  connectedUsers.push(...userlist);
}

function findJoiningUser(userlist) {
  let joiningUser;
  userlist.forEach(newUser => {
    if (findUser(user => user.user === newUser.user) === null)
      joiningUser = newUser;
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

function findUser(pred) {
  let theUser = null;
  connectedUsers.some(user => {
    if (pred(user)) {
      theUser = user;
      return true;
    }
    return false;
  });
  return theUser;
}

function addUser(userlist) {
  const joiningUser = findJoiningUser(userlist);
  joiningUser.rtc = new RTCPeerConnection(rtcIceServerConfiguration);
  connectedUsers.push(joiningUser);
  console.log('joiningUser', joiningUser);
  console.log('addUser', connectedUsers);
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

  console.log('숫자 비교', userlist.length, connectedUsers.length);
  console.log(isChannelReady);
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
  } else {
    // screen sharing
    const isSomeoneSharingScreen = userlist.some(user => {
      if (user.isSharingScreen === true) {
        screenSharingUser = user;
        return true;
      }
      return false;
    });

    if (!isSomeoneSharingScreen) {
      console.log(screenSharingUser);
      screenSharingUser = null;
      // change layout
    } else {
      console.log(screenSharingUser);
      // change layout
    }
  }
}

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

function makeOffer(user) {
  // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/negotiationneeded_event
  user.rtc.addEventListener('negotiationneeded', async () => {
    try {
      console.log('offering sdp');
      const offer = await user.rtc.createOffer();
      user.rtc.setLocalDescription(offer);
      sendMessage('sendSignal', {
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

// function mangeVideoHeight(divs, height) {
//   divs.forEach(div => {
//     const video = div.childNodes[0];
//     video.style.maxHeight = height;
//   });
//   console.log(height);
//   // console.log(state.videos.getElements('video'));
//   // state.videos.getElements('video').style.maxHeight = height;
// }

function manageVideoLayout() {
  // if (screenSharingUser) {
  //   console.log('need layout for screenSharing ');
  // } else {
  //   console.log('---------------------------------------');
  //   const divs = state.videos.childNodes;
  //   console.log(divs);
  //   const { length } = divs;
  //   if (length === 1) {
  //     state.videos.style.gridTemplateColumns = '1fr';
  //     mangeVideoHeight(divs, '750px');
  //   } else if (length <= 2) {
  //     console.log('2이하');
  //     state.videos.style.gridTemplateColumns = '1fr 1fr';
  //     mangeVideoHeight(divs, '65vh');
  //   } else if (length <= 4) {
  //     console.log('4이하');
  //     state.videos.style.gridTemplateColumns = '1fr 1fr';
  //     mangeVideoHeight(divs, '43vh');
  //   } else if (length <= 6) {
  //     console.log('6이하');
  //     state.videos.style.gridTemplateColumns = '1fr 1fr 1fr';
  //     mangeVideoHeight(divs, '43vh');
  //   } else if (length <= 9) {
  //     state.videos.style.gridTemplateColumns = '1fr 1fr 1fr';
  //     mangeVideoHeight(divs, '27vh');
  //   }
  //   console.log(length);
  //   console.log(state.videos);
  // }
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
        console.log('비디오 추가할때', user);
        const src = event.streams[0];
        let video;
        if (user.isTeacher) {
          video = state.teacherVideo;
          video.controls = true;
        } else {
          const div = document.createElement('div');
          div.id = user.user;
          video = document.createElement('video');
          div.appendChild(video);
          const p = document.createElement('p');
          const foundUser = findUser(val => val.user === user.user);
          const textNode = document.createTextNode(foundUser.name);
          p.appendChild(textNode);
          div.appendChild(p);

          state.videos.appendChild(div);
          manageVideoLayout();
        }
        video.srcObject = src;
        video.autoplay = true;
        video.playsinline = true;
        video.userId = user.user;
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
      sendMessage('sendSignal', {
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
      if (isScreenSharing) {
        substitueTrack(screenSharingTrack, true);
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
    sendMessage('sendSignal', {
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

function substitueTrack(track, bool) {
  sendingTracks
    .filter(tracks => tracks.track.kind === 'video')
    .forEach(tracks => tracks.replaceTrack(track));
  isScreenSharing = bool;
}

function ShareScreen(track) {
  screenSharingTrack = track;
  sendMessage('shareScreen', {});
  substitueTrack(track, true);
}

function connectWithTheUser(targetUser) {
  if (targetUser.rtc.connectionState === 'connected') {
    alert(`you are already connected with ${targetUser.name}`);
  } else {
    targetUser.rtc = new RTCPeerConnection(rtcIceServerConfiguration);
    addingListenerOnPC(targetUser, true);
  }
}

function disconnectWithTheUser(targetUser) {
  if (targetUser.user === state.myId) {
    alert('this is you');
    return;
  }
  if (targetUser.rtc.connectionState === 'connected') {
    targetUser.rtc.close();
    removeVideo(targetUser.user);
    sendMessage('sendSignal', {
      sendTo: targetUser.socket,
      content: 'disconnectWithTheUser',
    });

    targetUser.rtc = new RTCPeerConnection(rtcIceServerConfiguration);
    addingListenerOnPC(targetUser);
  }
}

function sendChat(message) {
  sendMessage('sendChat', {
    content: message,
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
  manageVideoLayout();

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

  resetVariables();
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

function resetVariables() {
  while (state.videos.lastElementChild) {
    state.videos.removeChild(state.videos.lastElementChild);
  }

  isStarted = false;
  isChannelReady = false;
  currentResolution = 'START';
  isScreenSharing = null;
  screenSharingUser = null;
  screenSharingTrack = null;

  connectedUsers = [];
  sendingTracks = [];
  localStream = null;
  isVideoMuted = true;
  isAudioMuted = true;

  state.classroomId = null;
  state.localVideo = null;
  state.videos = null;
  bus.$off('onDeliverDisconnection');
  bus.$off('change-screen-to-localstream');
  console.log('reset connectedUsers', connectedUsers);
}

// communication with signaling server
socket.on('deliverUserList', userlist => {
  console.log('sendUserList');
  bus.$emit('userlist-update', userlist);
  if (userlist.length === 1 && !isStarted) {
    startClass(userlist);
    return;
  }
  manageUserlist(userlist);
});

socket.on('deliverSignal', message => {
  console.log('message =', message);
  const { content } = message;
  const sentFrom = findUser(user => user.user === message.user);
  if (content.type === 'offer') {
    console.log('got offer from =', sentFrom);
    sentFrom.rtc.setRemoteDescription(new RTCSessionDescription(content.sdp));
    addTrackOnPC(sentFrom);
    console.log('answer 만드는 중');
    makeAnswer(sentFrom);
  } else if (content.type === 'answer' && isStarted) {
    console.log('got answer from: ', sentFrom);
    sentFrom.rtc.setRemoteDescription(new RTCSessionDescription(content.sdp));
  } else if (content.type === 'candidate' && isStarted) {
    console.log('got candidate from: ', sentFrom);
    const candidate = new RTCIceCandidate({
      sdpMLineIndex: content.label,
      candidate: content.candidate,
    });
    sentFrom.rtc.addIceCandidate(candidate);
  } else if (content === 'disconnectWithTheUser') {
    removeVideo(sentFrom.user);
    sentFrom.rtc = new RTCPeerConnection(rtcIceServerConfiguration);
    addingListenerOnPC(sentFrom);
  }
});

socket.on('deliverChat', message => {
  bus.$emit('onMessage', message.name, message.content);
});

socket.on('deliverDisconnection', () => {
  console.log('got deliverDisconnection');
  bus.$emit('onDeliverDisconnection');
  alert('연결이 끊겼습니다. 방을 나갔다 다시 들어와주세요.');
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

bus.$on('change-screen-to-localstream', () => {
  substitueTrack(localStream.getTracks()[1], false);
  screenSharingTrack = null;
});

export default {
  initRTCPART,
  emitEvent,
  disconnectWebRTC,
  getUserMedia,
  sendChat,
  sendMessage,
  connectWithTheUser,
  disconnectWithTheUser,
  ShareScreen,
  muteVideo,
  muteAudio,
};
