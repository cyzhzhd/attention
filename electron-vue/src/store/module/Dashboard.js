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
  },
};

const actions = {
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
