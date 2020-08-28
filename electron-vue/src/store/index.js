import Vue from 'vue';
import Vuex from 'vuex';

import room from './module/room';
import webRTC from './module/webRTC';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    room,
    webRTC,
  },
});
