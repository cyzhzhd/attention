import { fetchJWT, fetchUserInfo, signUpUser, fetchClassInfo } from '../api';

function setError(commit, error) {
  commit('SET_ERROR', error);
  console.error(error);
}

export default {
  FETCH_JWT({ commit }, options) {
    return fetchJWT(options)
      .then(({ data }) => {
        commit('SET_JWT', data);
        return data;
      })
      .catch(({ response }) => setError(commit, response.data));
  },

  FETCH_USER_INFO({ commit, state }) {
    return fetchUserInfo(state.jwt)
      .then(({ data }) => {
        commit('SET_USER', data);
        return data;
      })
      .catch(error => console.error(error));
  },
  SIGN_UP_USER({ commit }, options) {
    return signUpUser(options)
      .then(data => data)
      .catch(({ response }) => setError(commit, response.data));
  },

  FETCH_CLASS_INFO({ commit, state }, options) {
    return fetchClassInfo(state.jwt, options)
      .then(({ data }) => {
        commit('SET_CLASSROOM_LIST', data);
        return data;
      })
      .catch(error => console.error(error));
  },
};
