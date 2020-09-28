import Vue from 'vue';
import Vuex from 'vuex';

import room from './module/room';
import webRTC from './module/webRTC';
import electron from './module/electron';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    room,
    webRTC,
    electron,
  },
});
