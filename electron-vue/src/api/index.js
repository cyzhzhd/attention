import axios from 'axios';

const config = {
  baseUrl: 'https://be.swm183.com:3000',
};

function setHeader(jwt, param) {
  return {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
    params: param,
  };
}

function fetchJWT(options) {
  return axios.post(`${config.baseUrl}/user/login`, options);
}

function fetchUserInfo(jwt) {
  return axios.get(`${config.baseUrl}/user`, setHeader(jwt));
}

function signUpUser(options) {
  return axios.post(`${config.baseUrl}/user/account`, options);
}

function fetchClassroomInfo(jwt, options) {
  return axios.get(`${config.baseUrl}/class`, setHeader(jwt, options));
}

function createClassroom(jwt, options) {
  return axios.post(`${config.baseUrl}/class`, options, setHeader(jwt));
}

function addClassroom(jwt, options) {
  return axios.post(`${config.baseUrl}/user/class`, options, setHeader(jwt));
}

function deleteClassroom(jwt, options) {
  return axios.delete(`${config.baseUrl}/class`, setHeader(jwt, options));
}

function fetchClassInfo(jwt, options) {
  return axios.get(`${config.baseUrl}/session`, setHeader(jwt, options));
}

function createClass(jwt, options) {
  return axios.post(`${config.baseUrl}/session`, options, setHeader(jwt));
}

function fetchConcentration(jwt, url, options) {
  return axios.get(
    `${config.baseUrl}/concentration/${url}`,
    setHeader(jwt, options),
  );
}

function fetchUserList(jwt, options) {
  return axios.get(`${config.baseUrl}/class/users`, setHeader(jwt, options));
}

function finishClass(jwt, options) {
  return axios.delete(`${config.baseUrl}/session`, setHeader(jwt, options));
}

export {
  fetchJWT,
  fetchUserInfo,
  signUpUser,
  fetchClassroomInfo,
  createClassroom,
  addClassroom,
  deleteClassroom,
  fetchClassInfo,
  createClass,
  fetchConcentration,
  fetchUserList,
  finishClass,
};
