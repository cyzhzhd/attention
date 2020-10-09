import Vue from 'vue';
import Vuex from 'vuex';

import states from './states';
import mutations from './mutations';
import getters from './getters';
import actions from './actions';

import room from './module/room';
import webRTC from './module/webRTC';
import electron from './module/electron';
import modal from './module/modal';

Vue.use(Vuex);

export default new Vuex.Store({
  states,
  getters,
  mutations,
  actions,

  modules: {
    room,
    webRTC,
    electron,
    modal,
  },
});
