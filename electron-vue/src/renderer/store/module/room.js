import router from '../../router';

const state = {
  nickname: '',
};

const getters = {};

const mutations = {
  setNickName(state, nickname) {
    console.log('logged in');
    state.nickname = nickname;
    router.push({
      name: 'RoomList',
      params: { nickname },
    });
  },
};

const actions = {
  setNickName(context, nickname) {
    context.commit('setNickName', nickname);
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
