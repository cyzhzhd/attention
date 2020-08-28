/* eslint-disable no-use-before-define */
import Vue from 'vue';
import axios from 'axios';
import CryptoJS from 'crypto-js';

// firebase
// Firebase App (the core Firebase SDK) is always required and must be listed first
import * as firebase from 'firebase/app';
// If you enabled Analytics in your project, add the Firebase SDK for Analytics
import 'firebase/analytics';
// Add the Firebase products that you want to use
import 'firebase/auth';
import 'firebase/database';
import 'firebase/firestore';
// import 'firebase/storage';

import App from './App.vue';
import router from './router';
import store from './store';

Vue.config.productionTip = false;
Vue.prototype.$http = axios;

const key = generateRandomKey();
const options = {
  params: key,
};
console.log(options);
axios.get('/api/firebase', options).then(response => {
  console.log(response.data);
  const bytes = CryptoJS.AES.decrypt(response.data, key);
  const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  console.log(decryptedData);
  firebase.initializeApp(decryptedData);
  Vue.prototype.$firebase = firebase;
  Vue.prototype.$auth = firebase.auth();

  Vue.prototype.$setUser = user => {
    Vue.prototype.$user = user;
  };
});

function generateRandomKey() {
  let tempKey = '';
  for (let i = 0; i < 16; i += 1) {
    const random = Math.floor(Math.random() * 58 + 65);
    const char = String.fromCharCode(random);
    tempKey += char;
  }
  return tempKey;
}

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
