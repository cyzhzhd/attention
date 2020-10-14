/* eslint no-shadow: ["error", { "allow": ["state"] }] */
/* eslint-disable no-use-before-define */
/* eslint no-param-reassign: "error" */
import { fetchUserList } from '../../api';

const state = {
  studentList: {},
};

const getters = {
  studentList(state) {
    return state.studentList;
  },
};

const mutations = {
  setStudentList(state, studentList) {
    console.log('setStudentList start --------------------');
    state.studentList = {};
    console.log(state.studentList);
    console.log(studentList);
    studentList.forEach(student => {
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
    console.log('setStudentList done --------------------');
  },
};

const actions = {
  // SetStudentList({ commit }, classroom) {
  //   commit('setStudentList', classroom);
  // },

  SetStudentList({ commit }, options) {
    console.log(options);
    return fetchUserList(options.jwt, options.params)
      .then(({ data }) => commit('setStudentList', data))
      .catch(error => console.error(error));
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
