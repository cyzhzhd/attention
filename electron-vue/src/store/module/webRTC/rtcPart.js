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

// emit signal might be better
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

async function getLocalStream() {
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

function sendSignalToServer(type, message) {
  message.token = state.jwt;
  message.class = state.classroomId;
  message.session = state.classId;
  socket.emit(type, message);
}

function findUser(user, userlist = state.connectedUsers) {
  for (const u of userlist) {
    if (u.user === user) {
      return u;
    }
  }
  return false;
}

function removeLeavingUser(userlist) {
  for (let i = 0; i < state.connectedUsers.length; i += 1) {
    if (!findUser(state.connectedUsers[i].user, userlist)) {
      console.log('leaving user', state.connectedUsers[i].name);
      disconnectWithTheUser(state.connectedUsers[i]);
      state.connectedUsers.splice(i, 1);
      i -= 1;
    }
  }
}

function findJoiningUsers(userlist) {
  return userlist.filter(newOne => !findUser(newOne.user));
}
function addJoiningUser(userlist) {
  findJoiningUsers(userlist).forEach(joiningUser => {
    console.log('joiningUser', joiningUser.name);
    state.connectedUsers.push(joiningUser);
  });
}

function updateUserlist(userlist) {
  addJoiningUser(userlist);
  removeLeavingUser(userlist);
}
function sendOffer(user) {
  // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/negotiationneeded_event
  user.rtc.addEventListener('negotiationneeded', async () => {
    try {
      console.log('offering sdp');
      const offer = await user.rtc.createOffer();
      user.rtc.setLocalDescription(offer);
      sendSignalToServer('sendSignal', {
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

function setVideoHeight(divs, height, objectFit = 'cover') {
  divs.forEach(div => {
    const video = div.childNodes[0];
    video.style.height = height;
    video.style.objectFit = objectFit;
  });
}

function reLayoutVideoIfNeeded() {
  if (!state.isTeacher) return;
  state.localVideo.style.width = '100%';
  // displayingSTudentList 이용하게 변경
  const divs = state.videos.childNodes;
  if (isScreenSharing) {
    state.videos.style.gridTemplateColumns = '1fr';
    setVideoHeight(divs, '', 'contain');
    return;
  }

  let height;
  let columnLayout;
  const { length } = divs;
  if (length > 6) {
    columnLayout = '1fr 1fr 1fr';
    height = '27vh';
  } else if (length > 4) {
    columnLayout = '1fr 1fr 1fr';
    height = '43vh';
  } else if (length > 2) {
    columnLayout = '1fr 1fr';
    height = '43vh';
  } else if (length > 1) {
    columnLayout = '1fr 1fr';
    height = '65vh';
  } else {
    columnLayout = '1fr';
    height = '750px';
    state.localVideo.style.width = '70vw';
  }
  setVideoHeight(divs, height);
  state.videos.style.gridTemplateColumns = columnLayout;
}

function setOnTrackEvent(user) {
  // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/track_event
  user.rtc.addEventListener('track', event => {
    if (!event) return;
    if (event.track.kind === 'audio') return;
    console.log('비디오가 추가될 때, evnet = ', event);
    // const childVideos = state.videos.childNodes;
    // let hasAdded = false;
    // childVideos.forEach(node => {
    //   if (node.id === user.user) {
    //     hasAdded = true;
    //   }
    // });
    // if (hasAdded) {
    //   return;
    // }

    const stream = event.streams[0];
    // user.yourStreams = stream;
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
    // console.log('icecandidate event: ', event);
    if (event.candidate) {
      sendSignalToServer('sendSignal', {
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
  if (!localStream) return;
  // console.log('addTrackOnPC', localStream);
  console.log('addTrack event on ', user);
  user.myTrack = [];
  localStream.getTracks().forEach(track => {
    user.myTrack.push(user.rtc.addTrack(track, localStream));
  });
  if (isScreenSharing) {
    replaceTrack(user, screenSharingTrack);
  }
}

function setRTCPeerConnection(user) {
  user.rtc = new RTCPeerConnection(rtcIceServerConfiguration);
  setOnIceCandidate(user);
  setOnIceConnectionStateChange(user);
  setOnTrackEvent(user);
}

async function makeAnswer(sentFrom) {
  try {
    console.log('make answer to: ', sentFrom);
    const sessionDescription = await sentFrom.rtc.createAnswer();
    sentFrom.rtc.setLocalDescription(sessionDescription);
    console.log('makeAnswer ', sessionDescription);
    sendSignalToServer('sendSignal', {
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

function replaceTrack(user, track) {
  user.myTrack
    .filter(tracks => tracks.track.kind === 'video')
    .forEach(tracks => tracks.replaceTrack(track));
}

function shareScreen(track) {
  isScreenSharing = true;
  screenSharingTrack = track;
  sendSignalToServer('shareScreen', {});
  state.displayingStudentList.forEach(user => {
    replaceTrack(user, track);
  });

  reLayoutVideoIfNeeded();
  bus.$emit('rtcPart:start-sharing-screen');
}

function connectWithTheUser(targetUser) {
  if (targetUser.rtc && targetUser.rtc.connectionState === 'connected') {
    alert(`you are already connected with ${targetUser.name}`);
  } else if (targetUser.user === state.myId) {
    alert('this is you');
  } else {
    setRTCPeerConnection(targetUser);
    sendOffer(targetUser);
    addTrackOnPC(targetUser);
    state.displayingStudentList.push(targetUser);
  }
}

function disconnectWithTheUser(targetUser, received = false) {
  if (targetUser.user === state.myId) {
    alert('this is you');
  } else if (targetUser.rtc.connectionState === 'connected') {
    removeVideo(targetUser.user);
    const idx = state.displayingStudentList.findIndex(
      student => student.user === targetUser.user,
    );
    if (idx < 0) {
      return;
    }
    targetUser.rtc.close();
    state.displayingStudentList.splice(idx, 1);
    reLayoutVideoIfNeeded();
    if (!received) {
      sendSignalToServer('sendSignal', {
        sendTo: targetUser.socket,
        content: { type: 'disconnectWithThisUser' },
      });
    }
  }
}

function removeVideo(targetSessionId) {
  const childVideosNodeList = state.videos.childNodes;
  for (const node of childVideosNodeList) {
    if (node.id === targetSessionId) {
      state.videos.removeChild(node);
      return;
    }
  }
}

function leaveClass() {
  if (localStream) {
    localStream
      .getTracks()
      .filter(track => track.readyState === 'live')
      .forEach(track => {
        track.stop();
      });
  }

  resetVariables();
}

function muteVideo() {
  if (!isVideoMuted) {
    localStream
      .getTracks()
      .filter(track => track.kind === 'video')
      .forEach(track => {
        track.enabled = false;
      });
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

let currentTime = new Date();
let nextRotateTime = new Date();
function rotateStudent(isImmediate = false) {
  if (CCT.timeCompare(currentTime, nextRotateTime) >= 0 || isImmediate) {
    console.log(state.rotateStudentInterval);
    console.log('새로운 학생과 연결!');
    if (state.displayingStudentList.length >= 0) {
      state.displayingStudentList.forEach(student => {
        console.log('연결했었던 유저', student);
        disconnectWithTheUser(student);
      });
    }
    state.displayingStudentList = [];
    let len = Math.min(state.numConnectedStudent, state.connectedUsers.length);
    for (let i = 0; i < len; i += 1) {
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
    setRTCPeerConnection(sentFrom);
    sentFrom.rtc.setRemoteDescription(new RTCSessionDescription(content.sdp));
    addTrackOnPC(sentFrom);
    state.displayingStudentList.push(sentFrom);
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
  disconnectWithThisUser(sentFrom) {
    disconnectWithTheUser(sentFrom, true);
    // removeVideo(sentFrom.user);
    // sentFrom.rtc = new RTCPeerConnection(rtcIceServerConfiguration);
    // setRTCPeerConnection(sentFrom);
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
  isScreenSharing = false;
  screenSharingTrack = null;
  const videoTrack = localStream.getTracks()[1];
  state.displayingStudentList.forEach(user => {
    replaceTrack(user, videoTrack);
  });

  reLayoutVideoIfNeeded();
});
export default {
  initRTCPART,
  emitEvent,
  leaveClass,
  getLocalStream,
  sendSignalToServer,
  connectWithTheUser,
  disconnectWithTheUser,
  shareScreen,
  muteVideo,
  muteAudio,
  rotateStudent,
};
