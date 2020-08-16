const vars = {
  isInitiator: false,
  isStarted: false,
  isChannelReady: false,
  connectedUsers: {},
  remoteStreams: '',
  isTrackAdded: '',
  sessionId: '',
};

let isStreaming = false;
let localStream;
let roomContainer;

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
  onStart(state, mediaStream) {
    localStream = mediaStream;
    state.localVideo.srcObject = mediaStream;
    isStreaming = true;
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
    if (!isStreaming) {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia(
          sock.mediaStreamConstraints,
        );
        commit('onStart', mediaStream);
      } catch (error) {
        console.log('navigator.getUserMedia error: ', error);
      }
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
    console.log('Remote stream added.');
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

  console.log('문제 부분', connectedUsers[user]);
  if (!(localStream === undefined || isTrackAdded[user])) {
    localStream.getTracks().forEach(track => {
      console.log('뭐가 문제일까?', connectedUsers[user]);
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

function disconnectWebRTC() {
  resetVariables();
}

function resetVariables() {
  isInitiator = false;
  isStarted = false;
  isChannelReady = false;
  isStreaming = false;

  connectedUsers = {};
  remoteStreams = null;
  isTrackAdded = null;

  localStream = null;
  roomContainer = null;

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
  createSDPOffer,
  createPeerConnection,
  addingListenerOnPC,
  vars,
};
