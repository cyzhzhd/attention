import router from '../../router';

const state = {
  nickname: '',
};

const getters = {
  storedNickName(state) {
    return state.nickname;
  },
};

const mutations = {
  setNickName(state, nickname) {
    state.nickname = nickname;
    router.push({
      name: 'RoomList',
      params: { nickname },
    });
  },
};

const actions = {
  SetNickName({ commit }, nickname) {
    commit('setNickName', nickname);
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
