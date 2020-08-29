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

let localStream;
let isVideoMuted = true;
let isAudioMuted = true;

let sock;
let variables;

webRTC.initialize = function(sock, variables) {
  this.sock = sock;
  this.variables = variables;
};

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

  while (state.videos.lastElementChild) {
    state.videos.removeChild(state.videos.lastElementChild);
  }
  state.room = null;
  state.localVideo = null;
  state.videos = null;
  state.userOnline = [];
}
