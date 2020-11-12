/* eslint no-shadow: ["error", { "allow": ["state"] }] */
/* eslint-disable no-use-before-define */
/* eslint-disable no-unused-vars */
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
    CCT: { attend: [], focusPoint: [], sleep: [], time: [] },
  },
  sortStudentListInterval: 10,
  rotateStudentInterval: 30,
  numConnectedStudent: 3,
  CCTDataInterval: 30,
  groupInfo: {},
  independentGroup: {},
  myGroup: 'independent',
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
  groupInfo(state) {
    return state.groupInfo;
  },
  independentGroup(state) {
    return state.independentGroup;
  },
};

const mutations = {
  setUser(state, id) {
    state.myId = id;
  },
  setVariables(state, payload) {
    state.classroomId = payload.classroomId;
    state.classId = payload.classId;
    state.jwt = payload.jwt;
    state.isTeacher = payload.isTeacher;
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
        true,
      );
    }
    if (state.CCTDataInterval !== CCTDataInterval) {
      state.CCTDataInterval = CCTDataInterval;
      CCT.addCCTDataOnTotalCCT(state.CCTData, state.CCTDataInterval, true);
    }

    if (
      state.rotateStudentInterval !== rotateStudentInterval ||
      state.numConnectedStudent !== numConnectedStudent
    ) {
      state.rotateStudentInterval = rotateStudentInterval;
      state.numConnectedStudent = numConnectedStudent;
      webRTC.rotateStudent(true);
    }
  },

  videoSetter(state, payload) {
    state.videos = payload.videos;
    state.localVideo = payload.localVideo;
    state.teacherVideo = payload.teacherVideo;
  },
  // buttonSetter1(state, button) {
  //   state.tempButton1 = button;
  // },
  // buttonSetter2(state, button) {
  //   state.tempButton2 = button;
  // },
};

const actions = {
  SetUser({ commit }, id) {
    commit('setUser', id);
  },

  async EnterRoom({ state, commit }, payload) {
    commit('setVariables', payload);
    interval = setInterval(
      () => webRTC.sendSignalToServer('pingSession', {}),
      2000,
    );
    bus.$on('onDeliverDisconnection', () => {
      clearInterval(interval);
      webRTC.leaveClass();
      alert('방과 연결이 끊겼습니다');
    });

    const localStream = await webRTC.getLocalStream();
    state.localVideo.srcObject = localStream;

    if (payload.isTeacher) {
      state.localVideo.style.width = '70vw';
    } else {
      state.localVideo.style.width = '100%';
    }
    analyzeLib.getVideoSrc(state.localVideo);

    webRTC.sendSignalToServer('joinSession', {});
    if (!state.isTeacher) {
      controlAnalyze();
    }
  },

  LeaveRoom({ state }) {
    if (!state.isTeacher) {
      controlAnalyze();
    }

    webRTC.sendSignalToServer('leaveSession', {});
    clearInterval(interval);
    webRTC.leaveClass();
  },

  FinishClass({ state }) {
    console.log('finishClass');
    console.log(state.classId);
    webRTC.sendSignalToServer('requestDisconnection', {
      sendTo: state.classId,
    });
  },

  SendSignal({ commit }, { type, content }) {
    webRTC.sendSignalToServer(type, { content });
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
    if (state.isTeacher) {
      webRTC.connectWithTheStudent(targetUser);
    } else {
      webRTC.connectWithTheUser(targetUser);
    }
  },

  DisconnectWithTheUser({ commit }, targetUser) {
    if (state.isTeacher) {
      webRTC.disconnectWithTheStudent(targetUser);
    } else {
      webRTC.disconnectWithTheUser(targetUser);
    }
    console.log(commit);
  },

  SettingSetter({ commit }, options) {
    commit('settingSetter', options);
  },

  // setOnClickTempButton
  // ButtonSetter1({ commit }, button) {
  //   commit('buttonSetter1', button);
  //   state.tempButton1.addEventListener('click', () => {
  //     analyzeStopFlag = !analyzeStopFlag;
  //     analyzeLib.startAnalyze(analyzeStopFlag);
  //     if (!analyzeStopFlag) console.log('잠시 후 집중력 분석 시작');
  //     else if (analyzeStopFlag) console.log('집중력 분석 중단');
  //   });
  // },
  // ButtonSetter2({ commit }, button) {
  //   commit('buttonSetter2', button);
  //   state.tempButton2.addEventListener('click', () => {
  //     console.log('button clicked2!');
  //   });
  // },
};

function controlAnalyze() {
  analyzeStopFlag = !analyzeStopFlag;
  analyzeLib.startAnalyze(analyzeStopFlag);
  if (!analyzeStopFlag) console.log('잠시 후 집중력 분석 시작');
  else if (analyzeStopFlag) console.log('집중력 분석 중단');
}
webRTC.initRTCPART(state);

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
