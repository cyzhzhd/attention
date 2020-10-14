import Vue from 'vue';
import Vuex from 'vuex';

import state from './state';
import mutations from './mutations';
import getters from './getters';
import actions from './actions';

import webRTC from './module/webRTC';
import electron from './module/electron';
import modal from './module/modal';

Vue.use(Vuex);

export default new Vuex.Store({
  state,
  getters,
  mutations,
  actions,

  modules: {
    webRTC,
    electron,
    modal,
  },
});
