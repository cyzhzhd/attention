import * as rtc from './webRTC';

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
    console.log('got offer from: ', message.sendFrom);
    if (connectedUsers[message.sendFrom] !== true) {
      console.log('got offer from =', message.sendFrom);
      console.log(
        'got offer connectedUsers[message.sendFrom] =',
        connectedUsers[message.sendFrom],
      );
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
