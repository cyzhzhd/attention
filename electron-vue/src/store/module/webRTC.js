/* eslint no-shadow: ["error", { "allow": ["state"] }] */
/* eslint-disable no-use-before-define */
import bus from '../../../utils/bus';
import analyzeLib from './analyze/analyzeLib';
import webRTC from './webRTC/rtcPart';
import CCT from './webRTC/CCT';

let interval;

let analyzeStopFlag = true;

// 초기값도 값형식에 맞추어 설정.
const state = {
  classroomId: '',
  classId: '',
  jwt: '',
  isTeacher: '',
  connectedUsers: [],
  displayingStudentList: [],
  localVideo: '',
  videos: '',
  teacherVideo: '',
  tempButton1: '',
  tempButton2: '',
  myId: '',
  CCTData: {
    avr: { num: 0, ttl: 0 },
    CCT: { absence: [], focusPoint: [], sleep: [], turnHead: [], time: [] },
  },
  sortStudentListInterval: 10,
  rotateStudentInterval: 30,
  numConnectedStudent: 3,
  CCTDataInterval: 30,
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
  storedDisplayingStudentList(state) {
    return state.displayingStudentList;
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
    state.isTeacher = payload.isTeacher;

    // signal to server every 2 sec for keeping connection
    interval = setInterval(() => webRTC.sendMessage('pingSession', {}), 2000);
    bus.$on('onDeliverDisconnection', () => {
      clearInterval(interval);
      webRTC.disconnectWebRTC();
    });
  },
  leaveRoom() {
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

  disconnectWithTheUser(state, targetUser) {
    webRTC.disconnectWithTheUser(targetUser);
  },

  sendChat(state, content) {
    webRTC.sendMessage('sendChat', { content });
  },

  settingSetter(state, options) {
    const {
      sortStudentListInterval,
      rotateStudentInterval,
      numConnectedStudent,
      CCTDataInterval,
    } = options;

    if (state.sortStudentListInterval !== sortStudentListInterval) {
      state.sortStudentListInterval = sortStudentListInterval;
      CCT.sortUserListByCCT(
        state.connectedUsers,
        state.sortStudentListInterval,
      );
    }
    if (state.CCTDataInterval !== CCTDataInterval) {
      state.CCTDataInterval = CCTDataInterval;
      CCT.addCCTDataOnTotalCCT(state.CCTData, state.CCTDataInterval);
    }
    // 동시에 바꿀 때 수정
    if (state.rotateStudentInterval !== rotateStudentInterval) {
      state.rotateStudentInterval = rotateStudentInterval;
      webRTC.rotateStudent(true);
    } else if (state.numConnectedStudent !== numConnectedStudent) {
      state.numConnectedStudent = numConnectedStudent;
      webRTC.rotateStudent(true);
    }
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
    commit('enterRoom', payload);
    const localStream = await webRTC.getUserMedia();
    state.localVideo.srcObject = localStream;

    if (payload.isTeacher) {
      state.localVideo.style.width = '70vw';
    } else {
      state.localVideo.style.width = '100%';
    }
    console.log('EnterRoom', state.localVideo.srcObject);
    analyzeLib.getVideoSrc(state.localVideo);

    webRTC.sendMessage('joinSession', {});
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

  SettingSetter({ commit }, options) {
    commit('settingSetter', options);
  },

  // setOnClickTempButton
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
