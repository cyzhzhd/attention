import bus from '../../../utils/bus';
/* eslint no-shadow: ["error", { "allow": ["state"] }] */
/* eslint-disable no-use-before-define */
import analyzeLib from './analyze/analyzeLib';
import webRTC from './webRTC/rtcPart';

let interval;

let analyzeStopFlag = true;

const state = {
  classroomId: '',
  classId: '',
  jwt: '',
  localVideo: '',
  videos: '',
  teacherVideo: '',
  tempButton1: '',
  tempButton2: '',
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

    state.classroomId = payload.classroomId;
    state.classId = payload.classId;
    state.jwt = payload.jwt;

    const options = {
      token: state.jwt,
      class: state.classroomId,
      session: state.classId,
    };
    webRTC.emitEvent('joinSession', options);

    // signal to server every 2 sec for keeping connection
    interval = setInterval(
      () => webRTC.emitEvent('pingSession', options),
      2000,
    );
    bus.$on('onDeliverDisconnection', () => {
      clearInterval(interval);
      webRTC.disconnectWebRTC();
    });
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
    state.teacherVideo = payload.teacherVideo;
  },
  buttonSetter1(state, button) {
    state.tempButton1 = button;
  },
  buttonSetter2(state, button) {
    state.tempButton2 = button;
  },
};

const actions = {
  SetUser({ commit }, id) {
    commit('setUser', id);
  },

  async EnterRoom({ commit }, payload) {
    const localStream = await webRTC.getUserMedia();
    state.localVideo.srcObject = localStream;
    analyzeLib.getVideoSrc(state.localVideo);
    commit('enterRoom', payload);
  },

  LeaveRoom({ commit }) {
    commit('leaveRoom');
  },

  SendChat({ commit }, message) {
    commit('sendChat', message);
  },

  // async ShareScreen() {
  //   // on chrome
  //   const screenStream = await navigator.mediaDevices.getDisplayMedia({
  //     cursor: true,
  //   });
  //   console.log(screenStream);
  //   // screenTrack = screenStream.getTracks();
  //   // substitueTrack(screenTrack[0]);

  //   // socket.emit('screenSharing', state.classroomId, sessionId);
  // },

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
    state.tempButton1.addEventListener('click', () => {
      analyzeStopFlag = !analyzeStopFlag;
      analyzeLib.startAnalyze(analyzeStopFlag);
      if (!analyzeStopFlag) console.log('잠시 후 집중력 분석 시작');
      else if (analyzeStopFlag) console.log('집중력 분석 중단');
    });
  },
  ButtonSetter2({ commit }, button) {
    commit('buttonSetter2', button);
    state.tempButton2.addEventListener('click', () => {
      const now = new Date();
      analyzeLib.eyeSetting(true, now);
      console.log('button clicked2!');
    });
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
