/* eslint no-shadow: ["error", { "allow": ["state"] }] */
/* eslint-disable no-use-before-define */
/* eslint no-param-reassign: "error" */

const state = {
  datacollection: null,
  studentList: {},
  absence: [],
  focusPoint: [],
  sleep: [],
  turnHead: [],
};

const getters = {
  studentList(state) {
    return state.studentList;
  },
};

const mutations = {
  setStudentList(state, classroom) {
    console.log('setStudentList start --------------------');
    // state.classInfo = classroom;
    classroom.students.forEach(student => {
      state.studentList[student] = {
        user: student,
        cctTotal: [],
        cctTime: [],
      };
    });
    console.log('setStudentList done --------------------');
  },
};

const actions = {
  SetStudentList({ commit }, classroom) {
    console.log(classroom);
    commit('setStudentList', classroom);
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
