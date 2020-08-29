/* eslint-disable no-use-before-define */
// eslint-disable-next-line no-undef
// const socket = io('localhost:3000', {
//   autoConnect: true,
// }).connect();
// eslint-disable-next-line no-undef
const socket = io('13.125.214.253:3000', {
  autoConnect: true,
}).connect();

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
