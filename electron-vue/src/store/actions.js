import {
  fetchJWT,
  fetchUserInfo,
  signUpUser,
  fetchClassroomInfo,
  createClassroom,
  addClassroom,
  leaveClassroom,
  deleteClassroom,
  fetchClassInfo,
  createClass,
  fetchConcentration,
  finishClass,
  fetchClassList,
} from '../api';

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
      .then(() => 'success')
      .catch(({ response }) => setError(commit, response.data));
  },

  FETCH_CLASS_ROOM_INFO({ commit, state }, options) {
    return fetchClassroomInfo(state.jwt, options)
      .then(({ data }) => {
        commit('SET_CLASSROOM_LIST', data);
        return data;
      })
      .catch(error => console.error(error));
  },

  CREATE_CLASSROOM({ commit, state }, options) {
    return createClassroom(state.jwt, options)
      .then(() => 'success')
      .catch(({ response }) => setError(commit, response.data));
  },
  ADD_CLASSROOM({ commit, state }, options) {
    return addClassroom(state.jwt, options)
      .then(() => 'success')
      .catch(({ response }) => setError(commit, response.data));
  },
  LEAVE_CLASSROOM({ commit, state }, options) {
    return leaveClassroom(state.jwt, options)
      .then(() => 'success')
      .catch(({ response }) => setError(commit, response.data));
  },
  DELETE_CLASSROOM({ commit, state }, options) {
    return deleteClassroom(state.jwt, options)
      .then(() => 'sucess')
      .catch(({ response }) => setError(commit, response.data));
  },
  FETCH_CLASS_INFO({ state }, options) {
    return fetchClassInfo(state.jwt, options)
      .then(({ data }) => data)
      .catch(error => console.error(error));
  },
  CREATE_CLASS({ state }, options) {
    return createClass(state.jwt, options)
      .then(({ data }) => data)
      .catch(error => console.error(error));
  },
  FETCH_CONCENTRATION({ state }, options) {
    return fetchConcentration(state.jwt, options.url, options.params)
      .then(({ data }) => data)
      .catch(error => console.error(error));
  },
  FINISH_CLASS({ state }, options) {
    return finishClass(state.jwt, options)
      .then(({ data }) => data)
      .catch(error => console.error(error));
  },
  FETCH_CLASSLIST({ state }, options) {
    return fetchClassList(state.jwt, options)
      .then(({ data }) => data)
      .catch(error => console.error(error));
  },
};
