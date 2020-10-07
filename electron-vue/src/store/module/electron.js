/* eslint no-shadow: ["error", { "allow": ["state"] }] */
/* eslint-disable no-use-before-define */
// import { desktopCapturer } from 'electron'; // eslint-disable-line import/no-extraneous-dependencies
import { ipcRenderer, desktopCapturer } from 'electron'; // eslint-disable-line import/no-extraneous-dependencies
import webRTC from './webRTC/rtcPart';

let screensharingStream;

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
    .then(sources => {
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

        div.addEventListener('click', getDisplay.bind(null, div));

        div.classList.add('screen');
        state.canvas.appendChild(div);
      });
    });
}

function getDisplay(div) {
  navigator.mediaDevices
    .getUserMedia({
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: div.detail.id,
          minWidth: 640,
          maxWidth: 640,
          minHeight: 320,
          maxHeight: 320,
        },
      },
    })
    .then(stream => {
      screensharingStream = stream;
      webRTC.ShareScreen(screensharingStream);
      ipcRenderer.send('open-new-window-for-screensharing');
    })
    .catch(error => {
      console.error(error);
    });
}

ipcRenderer.on('close-sharing-panel', () => {
  console.log('got close-sharing-panel');
  const tracks = screensharingStream.getTracks();
  tracks.forEach(track => track.stop());
  screensharingStream = null;
});
export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
