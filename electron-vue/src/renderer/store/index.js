import Vue from 'vue';
import Vuex from 'vuex';

import {
  createPersistedState,
  // createSharedMutations
} from 'vuex-electron';

import electronModules from './electron-modules';
import room from './module/room.js';
import webRTC from './module/webRTC.js';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    electronModules,
    room,
    webRTC,
  },
  plugins: [
    createPersistedState(),
    //  createSharedMutations()
  ],
  strict: process.env.NODE_ENV !== 'production',
});
