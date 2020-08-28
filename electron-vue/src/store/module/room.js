/* eslint no-shadow: ["error", { "allow": ["state"] }] */
import axios from 'axios';
import router from '../../router';

const state = {
  email: '',
};

const getters = {
  storedNickName(state) {
    return state.email;
  },
};

const mutations = {
  logIn(state, email, password) {
    state.email = email + password;
    router.push({
      name: 'RoomList',
      params: { nickname: email },
    });
  },
  signUp(email, password, displayName) {
    console.log('signup method');
    console.log(email, password, displayName);
    const options = {
      email,
      password,
      displayName,
    };
    axios.post('/api/firebase/signup', options);
  },
};

const actions = {
  LogIn({ commit }, email, password) {
    commit('logIn', email, password);
  },
  SignUp({ commit }, email, password, displayName) {
    console.log('actions', email, password, displayName);
    commit('signUp', email, password, displayName);
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
