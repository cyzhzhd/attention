/* eslint no-shadow: ["error", { "allow": ["state"] }] */
/* eslint-disable no-use-before-define */
import bus from '../../../utils/bus';
import analyzeLib from './analyze/analyzeLib';
import webRTC from './webRTC/rtcPart';

let interval;

let analyzeStopFlag = true;

const state = {
  classroomId: '',
  classId: '',
  jwt: '',
  connectedUsers: [],
  localVideo: '',
  videos: '',
  teacherVideo: '',
  tempButton1: '',
  tempButton2: '',
  myId: '',
  CCTData: {
    all: {
      avr: { num: 0, ttl: 0 },
      CCT: { absence: [], focusPoint: [], sleep: [], turnHead: [], time: [] },
    },
  },
};

const getters = {
  storedRoom(state) {
    return state.classroomId;
  },
  storedLocalVideo(state) {
    return state.localVideo;
  },
  storedCCTData(state) {
    return state.CCTData;
  },
  storedConnectedUsers(state) {
    return state.connectedUsers;
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

    // const options = {
    //   token: state.jwt,
    //   class: state.classroomId,
    //   session: state.classId,
    // };
    // console.log('joinSession', options);
    // webRTC.emitEvent('joinSession', options);
    webRTC.sendMessage('joinSession', {});

    // signal to server every 2 sec for keeping connection
    interval = setInterval(() => webRTC.sendMessage('pingSession', {}), 2000);
    bus.$on('onDeliverDisconnection', () => {
      clearInterval(interval);
      webRTC.disconnectWebRTC();
    });
  },
  leaveRoom() {
    // const options = {
    //   token: state.jwt,
    //   class: state.classroomId,
    //   session: state.classId,
    // };
    webRTC.sendMessage('leaveSession', {});

    clearInterval(interval);
    webRTC.disconnectWebRTC();
  },

  finishClass(state) {
    console.log('finishClass');
    console.log(state.classId);
    webRTC.sendMessage('requestDisconnection', { sendTo: state.classId });
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

  FinishClass({ commit }) {
    commit('finishClass');
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
