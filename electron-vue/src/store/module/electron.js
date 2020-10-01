/* eslint no-shadow: ["error", { "allow": ["state"] }] */
/* eslint-disable no-use-before-define */
import { desktopCapturer } from 'electron'; // eslint-disable-line import/no-extraneous-dependencies

const state = {
  screenNames: null,
  screenInfo: null,
  canvas: null,
  ctx: null,
  screenVideos: null,
  captureScreensBtn: null,
};

const getters = {};

const mutations = {
  variableSetter(state, payload) {
    state.screenNames = payload.screenNames;
    state.screenInfo = payload.screenInfo;
    state.screenVideos = payload.screenVideos;
    state.captureScreensBtn = payload.captureScreens;
    state.canvas = payload.canvas;
  },
};

const actions = {
  VariableSetter({ commit }, payload) {
    commit('variableSetter', payload);
  },
  CaptureScreens() {
    captureScreens();
  },
};

function captureScreens() {
  desktopCapturer
    .getSources({
      types: ['window', 'screen'],
      thumbnailSize: {
        width: 250,
        height: 140,
      },
    })
    .then(async sources => {
      sources.forEach(source => {
        const div = document.createElement('div');
        const canvas = document.createElement('canvas');
        const img = document.createElement('IMG');
        const p = document.createElement('p');
        const textNode = document.createTextNode(source.name);
        const context = canvas.getContext('2d');
        canvas.width = source.thumbnail.getSize().width;
        img.onload = () => context.drawImage(img, 0, 0);
        img.src = source.thumbnail.toDataURL();
        div.detail = source;
        p.appendChild(textNode);
        div.appendChild(canvas);
        div.appendChild(p);

        div.classList.add('screen');
        state.canvas.appendChild(div);
      });
    });
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
