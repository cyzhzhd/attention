/* eslint no-shadow: ["error", { "allow": ["state"] }] */
/* eslint-disable no-use-before-define */
import analyzeLib from './analyze/analyzeLib';
import webRTC from './webRTC/rtcPart';

let interval;

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
    webRTC.emitEvent('joinSession', options);
    console.log('enter room payload', payload);

    // signal to server every 2 sec for keeping connection
    interval = setInterval(
      () => webRTC.emitEvent('pingSession', options),
      2000,
    );
  },
  leaveRoom(state) {
    const options = {
      token: state.jwt,
      class: state.classroomId,
      session: state.classId,
    };
    webRTC.emitEvent('leaveSession', options);

    clearInterval(interval);
    webRTC.disconnectWebRTC();
  },

  connectWithTheUser(state, targetUser) {
    webRTC.connectWithTheUser(targetUser);
    // if (connectedUsers[targetUser.sessionId].connectionState === 'connected') {
    //   alert(`you are already connected with ${targetUser.displayName}`);
    // } else {
    //   addPC(targetUser.sessionId, true);
    // }
  },

  sendChat(state, message) {
    webRTC.sendChat(message);
  },

  disconnectWithTheUser(state, targetUser) {
    webRTC.disconnectWithTheUser(targetUser);
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
    const localStream = await webRTC.getUserMedia();
    state.localVideo.srcObject = localStream;
    commit('enterRoom', payload);
  },

  LeaveRoom({ commit }) {
    commit('leaveRoom');
  },

  SendChat({ commit }, message) {
    console.log(message);
    commit('sendChat', message);
  },

  async ShareScreen() {
    // on chrome
    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      cursor: true,
    });
    console.log(screenStream);
    // screenTrack = screenStream.getTracks();
    // substitueTrack(screenTrack[0]);

    // socket.emit('screenSharing', state.classroomId, sessionId);
  },

  VideoSetter({ commit }, payload) {
    commit('videoSetter', payload);
  },

  MuteVideo() {
    webRTC.muteVideo();
  },
  MuteAudio() {
    webRTC.muteAudio();
  },

  ConnectWithTheUser({ commit }, targetUser) {
    commit('connectWithTheUser', targetUser);
  },

  DisconnectWithTheUser({ commit }, targetUser) {
    commit('disconnectWithTheUser', targetUser);
  },
  ButtonSetter1({ commit }, button) {
    commit('buttonSetter1', button);
  },
  ButtonSetter2({ commit }, button) {
    commit('buttonSetter2', button);
  },
};

webRTC.initRTCPART(state);

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
