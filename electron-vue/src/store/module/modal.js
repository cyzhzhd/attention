/* eslint no-shadow: ["error", { "allow": ["state"] }] */
/* eslint-disable no-use-before-define */
const state = {};

const getters = {};

const mutations = {
  dragModal(state, payload) {
    const { modal, header } = payload;
    let pos1 = 0;
    let pos2 = 0;
    let pos3 = 0;
    let pos4 = 0;

    header.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
      // e = e || window.event;
      e.preventDefault();
      // get the mouse cursor position at startup
      pos3 = e.clientX;
      pos4 = e.clientY;
      console.log(pos3, pos4);
      document.onmouseup = closeDragmodal;
      document.onmousemove = modalDrag;
    }

    function modalDrag(e) {
      // e = e || window.event;
      e.preventDefault();

      // calculate the new cursor position
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;

      modal.style.top = `${modal.offsetTop - pos2}px`;
      modal.style.left = `${modal.offsetLeft - pos1}px`;
    }

    function closeDragmodal() {
      document.onmouseup = null;
      document.onmousemove = null;
    }
  },
};

const actions = {
  DragModal({ commit }, payload) {
    console.log(payload);
    commit('dragModal', payload);
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
