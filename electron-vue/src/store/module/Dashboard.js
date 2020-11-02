/* eslint no-shadow: ["error", { "allow": ["state"] }] */
/* eslint-disable no-use-before-define */
/* eslint no-param-reassign: "error" */
import { fetchUserList } from '../../api';

const state = {
  classId: '',
  studentList: {},
  displayingUserList: [],
  CCTType: {
    focusPoint: true,
    absence: false,
    sleep: false,
    turnHead: false,
  },
};

const getters = {
  classId(state) {
    return state.classId;
  },
  studentList(state) {
    return state.studentList;
  },
  displayingUserList(state) {
    return state.displayingUserList;
  },
  CCTType(state) {
    return state.CCTType;
  },
};

const mutations = {
  changeClassId(state, classId) {
    state.classId = classId;
  },
  setStudentList(state, studentList) {
    state.studentList = {};
    console.log(state.studentList);
    console.log(studentList);
    studentList.forEach((student) => {
      const { _id, name, email } = student;
      const id = _id;
      state.studentList[id] = {
        user: id,
        name,
        email,
        cctTotal: [],
        cctTime: [],
      };
    });
  },
  changeDisplayingUserList(state, userInfo) {
    const { name, user } = userInfo;
    const index = state.displayingUserList.findIndex(
      (displayingUser) => displayingUser.user === user,
    );

    if (index === -1) {
      state.displayingUserList.push({ user, name });
    } else {
      state.displayingUserList.splice(index, 1);
    }
  },
  changeCCTType(state, dataType) {
    state.CCTType[dataType] = !state.CCTType[dataType];
  },
};

const actions = {
  ChangeClassId({ commit }, classId) {
    commit('changeClassId', classId);
  },
  SetStudentList({ commit }, options) {
    console.log(options);
    return fetchUserList(options.jwt, options.params)
      .then(({ data }) => commit('setStudentList', data))
      .catch((error) => console.error(error));
  },
  ChangeDisplayingUserList({ commit }, userInfo) {
    commit('changeDisplayingUserList', userInfo);
  },
  ChangeCCTType({ commit }, dataType) {
    commit('changeCCTType', dataType);
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
