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

function fetchClassInfo(jwt, options) {
  return axios.get(`${config.baseUrl}/class`, setHeader(jwt, options));
}

export { fetchJWT, fetchUserInfo, signUpUser, fetchClassInfo };
// export { fetchJWT, getItem, postItem, postItemJWT, deleteItem };
