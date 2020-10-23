/* eslint-disable no-use-before-define */
/* eslint no-param-reassign: "error" */
/* eslint-disable no-restricted-syntax */
import resolutions from './resolution';
import CCT from './CCT';
import bus from '../../../../utils/bus';

// eslint-disable-next-line no-undef
const socket = io('https://be.swm183.com:3000', {
  autoConnect: true,
  transports: ['websocket'],
}).connect();

let isScreenSharing;
// let screenSharingUser;
let screenSharingTrack;

let localStream;
let isVideoMuted = true;
let isAudioMuted = true;
const rtcIceServerConfiguration = {
  iceServers: [
    {
      urls: 'turn:13.125.214.253:3478',
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
    const option = mediaStreamConstraints(
      state.isTeacher ? resolutions.hdConstraints : resolutions.vgaConstraints,
    );
    localStream = await navigator.mediaDevices.getUserMedia(option);
    localStream.getTracks().forEach(track => {
      track.enabled = false;
    });
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

function findJoiningUsers(userlist) {
  return userlist.filter(newOne => !findUser(newOne.user));
}

function removeUser(userlist) {
  state.connectedUsers
    .filter(user => !findUser(user.user, userlist))
    .forEach((existingUser, idx) => {
      existingUser.rtc.close();
      removeVideo(existingUser.user);
      state.connectedUsers.splice(idx, 1);
    });
}

function findUser(user, userlist = state.connectedUsers) {
  for (const u of userlist) {
    if (u.user === user) {
      return u;
    }
  }
  return false;
}

function addUser(userlist) {
  findJoiningUsers(userlist).forEach(joiningUser => {
    joiningUser.rtc = new RTCPeerConnection(rtcIceServerConfiguration);
    state.connectedUsers.push(joiningUser);
    console.log('joiningUser', joiningUser);
    addingListenerOnPC(joiningUser);
  });
}

function updateUserlist(userlist) {
  addUser(userlist);
  removeUser(userlist);
}
// 함수 이름 재고
function makeOffer(user) {
  // function sendOfferSignal(user) {
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
    } catch (e) {
      console.error('Failed to create pc session description', e);
    }
  });
}

function setVideoMaxHeight(divs, maxHeight, objectFit = 'cover') {
  divs.forEach(div => {
    const video = div.childNodes[0];
    video.style.height = maxHeight;
    video.style.objectFit = objectFit;
  });
}

function reLayoutVideoIfNeeded() {
  if (!state.isTeacher) return;
  console.log('---------------------------------------');
  state.localVideo.style.width = '100%';
  const divs = state.videos.childNodes;
  console.log(divs);
  const { length } = divs;
  if (isScreenSharing) {
    state.videos.style.gridTemplateColumns = '1fr';
    setVideoMaxHeight(divs, '', 'contain');
    return;
  }
  if (length === 1) {
    state.videos.style.gridTemplateColumns = '1fr';
    setVideoMaxHeight(divs, '750px');
    state.localVideo.style.width = '70vw';
  } else if (length <= 2) {
    console.log('2이하');
    state.videos.style.gridTemplateColumns = '1fr 1fr';
    setVideoMaxHeight(divs, '65vh');
  } else if (length <= 4) {
    console.log('4이하');
    state.videos.style.gridTemplateColumns = '1fr 1fr';
    setVideoMaxHeight(divs, '43vh');
  } else if (length <= 6) {
    console.log('6이하');
    state.videos.style.gridTemplateColumns = '1fr 1fr 1fr';
    setVideoMaxHeight(divs, '43vh');
  } else if (length <= 9) {
    state.videos.style.gridTemplateColumns = '1fr 1fr 1fr';
    setVideoMaxHeight(divs, '27vh');
  }
  console.log(length);
  console.log(state.videos);
}

function setOnTrackEvent(user) {
  // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/track_event
  user.rtc.addEventListener('track', event => {
    if (!event) return;
    console.log('비디오가 추가될 때, evnet = ', event);
    const childVideos = state.videos.childNodes;
    let hasAdded = false;
    childVideos.forEach(node => {
      if (node.id === user.user) {
        hasAdded = true;
      }
    });

    if (hasAdded) {
      return;
    }

    console.log('비디오 추가할때', user);
    const stream = event.streams[0];
    console.log('event.streams --- 확인!', event.streams);
    user.yourStreams = stream;
    let video;
    if (user.isTeacher) {
      video = state.teacherVideo;
      video.controls = true;
    } else {
      video = appendStudentVideoElement(user);
    }

    video.style.objectFit = 'cover';
    video.srcObject = stream;
    video.autoplay = true;
    video.playsinline = true;
    video.userId = user.user;
  });
}

function appendStudentVideoElement(user) {
  const div = document.createElement('div');
  const video = document.createElement('video');
  div.id = user.user;
  video.style.width = '100%';
  div.appendChild(video);

  const p = document.createElement('p');
  const foundUser = findUser(user.user);
  const textNode = document.createTextNode(foundUser.name);
  p.appendChild(textNode);
  div.appendChild(p);
  state.videos.appendChild(div);

  reLayoutVideoIfNeeded();
  return video;
}

// Roughly, disconnected means that the connection was interrupted but may come back without further action. The failed state is a little more permanent, you need to do an ICE restart to get out of it.
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
    console.log('icecandidate event: ', event);
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
  console.log('addTrackOnPC', localStream);
  if (!localStream) {
    return;
  }
  console.log(user, '에 track을 추가하는 중.', localStream.getTracks());
  console.log('addTrack event', user.rtc);
  user.myTrack = [];
  localStream.getTracks().forEach(track => {
    user.myTrack.push(user.rtc.addTrack(track, localStream));
    console.log('track added sendingTracks', user);
    if (isScreenSharing) {
      substitueTrack(screenSharingTrack, true);
    }
  });
}

function addingListenerOnPC(user, isOfferer = false) {
  setOnIceCandidate(user);
  setOnIceConnectionStateChange(user);
  setOnTrackEvent(user);
  if (isOfferer) {
    makeOffer(user);
    addTrackOnPC(user);
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
  state.connectedUsers.forEach(user => {
    if (!user.myTrack) return;
    user.myTrack
      .filter(tracks => tracks.track.kind === 'video')
      .forEach(tracks => tracks.replaceTrack(track));
  });
  isScreenSharing = bool;
}

// 소문자로  ----**
function shareScreen(track) {
  screenSharingTrack = track;
  sendMessage('shareScreen', {});
  substitueTrack(track, true);
  // ipcRenderer.send(
  //   'sending-displayingStudentList',
  //   state.displayingStudentList,
  // );
  reLayoutVideoIfNeeded();
  bus.$emit('rtcPart:start-sharing-screen');
}

function connectWithTheUser(targetUser) {
  if (targetUser.rtc && targetUser.rtc.connectionState === 'connected') {
    alert(`you are already connected with ${targetUser.name}`);
  } else {
    targetUser.rtc = new RTCPeerConnection(rtcIceServerConfiguration);
    addingListenerOnPC(targetUser, true);
    state.displayingStudentList.push(targetUser);
  }
}

function disconnectWithTheUser(targetUser) {
  if (targetUser.user === state.myId) {
    alert('this is you');
  } else if (targetUser.rtc.connectionState === 'connected') {
    const idx = state.displayingStudentList.findIndex(
      student => student.user === targetUser.user,
    );
    state.displayingStudentList.splice(idx, 1);
    targetUser.rtc.close();
    removeVideo(targetUser.user);
    sendMessage('sendSignal', {
      sendTo: targetUser.socket,
      content: { type: 'disconnectWithTheUser' },
    });

    targetUser.rtc = new RTCPeerConnection(rtcIceServerConfiguration);
    addingListenerOnPC(targetUser);
  }
}

function removeVideo(targetSessionId) {
  const childVideosNodeList = state.videos.childNodes;
  let selectedNode;
  for (const node of childVideosNodeList) {
    if (node.id === targetSessionId) {
      selectedNode = node;
      break;
    }
  }

  if (selectedNode) {
    state.videos.removeChild(selectedNode);
    reLayoutVideoIfNeeded();
  }
}

function disconnectWebRTC() {
  if (localStream) {
    localStream
      .getTracks()
      .filter(t => t.readyState === 'live')
      .forEach(track => {
        track.stop();
      });
  }

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

// [0] 말고 다른 방법 찾기
function muteAudio() {
  if (!isAudioMuted) {
    localStream.getTracks()[0].enabled = false;
  } else {
    localStream.getTracks()[0].enabled = true;
  }
  isAudioMuted = !isAudioMuted;
}

let currentTime = new Date();
let nextRotateTime = new Date();
function rotateStudent(isImmediate = false) {
  if (CCT.timeCompare(currentTime, nextRotateTime) >= 0 || isImmediate) {
    console.log(isImmediate);
    console.log(state.rotateStudentInterval);
    console.log('새로운 학생과 연결!');
    if (state.displayingStudentList.length) {
      state.displayingStudentList.forEach(student => {
        console.log('연결했었던 유저', student);
        disconnectWithTheUser(student);
      });
      state.displayingStudentList = [];
    }
    let len = Math.min(state.numConnectedStudent, state.connectedUsers.length);
    for (let i = 0; i < len; i += 1) {
      console.log(state.connectedUsers[i]);
      if (state.connectedUsers[i].isTeacher) {
        len = Math.min(len + 1, state.connectedUsers.length);
      } else {
        connectWithTheUser(state.connectedUsers[i]);
        state.displayingStudentList.push(state.connectedUsers[i]);
      }
    }
    nextRotateTime = CCT.setTime(state.rotateStudentInterval);
  }
}

function resetVariables() {
  while (state.videos.lastElementChild) {
    state.videos.removeChild(state.videos.lastElementChild);
  }

  isScreenSharing = null;
  // screenSharingUser = null;
  screenSharingTrack = null;

  localStream = null;
  isVideoMuted = true;
  isAudioMuted = true;

  state.connectedUsers = [];
  state.displayingStudentList = [];
  state.classroomId = null;
  state.localVideo = null;
  state.videos = null;
  state.teacherVideo = null;
  state.CCTData = {
    avr: { num: 0, ttl: 0 },
    CCT: { absence: [], focusPoint: [], sleep: [], turnHead: [], time: [] },
  };
}

// communication with signaling server
socket.on('deliverUserList', userlist => {
  bus.$emit('userlist-update', userlist);
  updateUserlist(userlist);
});

const funcSignal = {
  offer(sentFrom, content) {
    console.log('got offer from =', sentFrom);
    sentFrom.rtc.setRemoteDescription(new RTCSessionDescription(content.sdp));
    addTrackOnPC(sentFrom);
    console.log('answer 만드는 중');
    makeAnswer(sentFrom);
  },
  answer(sentFrom, content) {
    console.log('got answer from: ', sentFrom);
    sentFrom.rtc.setRemoteDescription(new RTCSessionDescription(content.sdp));
  },
  candidate(sentFrom, content) {
    console.log('got candidate from: ', sentFrom);
    const candidate = new RTCIceCandidate({
      sdpMLineIndex: content.label,
      candidate: content.candidate,
    });
    sentFrom.rtc.addIceCandidate(candidate);
  },
  disconnectWithTheUser(sentFrom) {
    removeVideo(sentFrom.user);
    sentFrom.rtc = new RTCPeerConnection(rtcIceServerConfiguration);
    addingListenerOnPC(sentFrom);
  },
};

socket.on('deliverSignal', message => {
  console.log('message =', message);
  const { content } = message;
  const sentFrom = findUser(message.user);
  const fn = funcSignal[content.type];
  return fn && fn(sentFrom, content);
});

socket.on('deliverChat', message => {
  bus.$emit('onMessage', message.name, message.content);
});

socket.on('deliverDisconnection', () => {
  console.log('got deliverDisconnection');
  bus.$emit('onDeliverDisconnection');
  // alert('연결이 끊겼습니다. 방을 나갔다 다시 들어와주세요.');
});

socket.on('deliverConcenteration', cctData => {
  console.log(cctData);
  const { user, content } = cctData;
  const foundUser = findUser(user);
  CCT.allocateCCTData(foundUser, content);
  console.log(state.sortStudentListInterval, state.CCTDataInterval);
  CCT.sortUserListByCCT(state.connectedUsers, state.sortStudentListInterval);
  CCT.addCCTDataOnTotalCCT(state.CCTData, state.CCTDataInterval);
  currentTime = new Date(Date.now());
  rotateStudent();
});

bus.$on('class:stop-sharing-screen', () => {
  console.log('done screen sharing', localStream.getTracks());
  substitueTrack(localStream.getTracks()[1], false);
  screenSharingTrack = null;
  reLayoutVideoIfNeeded();
});
export default {
  initRTCPART,
  emitEvent,
  disconnectWebRTC,
  getUserMedia,
  sendMessage,
  connectWithTheUser,
  disconnectWithTheUser,
  shareScreen,
  muteVideo,
  muteAudio,
  rotateStudent,
};
