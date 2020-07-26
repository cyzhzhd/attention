import Vue from 'vue';
import axios from 'axios';
// Firebase App (the core Firebase SDK) is always required and must be listed first
import * as firebase from 'firebase/app';

// If you enabled Analytics in your project, add the Firebase SDK for Analytics
import 'firebase/analytics';

// Add the Firebase products that you want to use
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';

import App from './App';
import router from './router';
import store from './store';

if (!process.env.IS_WEB) Vue.use(require('vue-electron'));
Vue.http = Vue.prototype.$http = axios;
Vue.config.productionTip = false;

const firebaseConfig = {
  apiKey: 'AIzaSyDsFO7xQhO1hP1UBaqigZiqkepDSilx1d4',
  authDomain: 'soma-team-183.firebaseapp.com',
  databaseURL: 'https://soma-team-183.firebaseio.com',
  projectId: 'soma-team-183',
  storageBucket: 'soma-team-183.appspot.com',
  messagingSenderId: '957154725007',
  appId: '1:957154725007:web:19194eea75ae450223f4fa',
  measurementId: 'G-4CTH4Q25JE',
};

firebase.initializeApp(firebaseConfig);
Vue.prototype.$firebase = firebase;

Vue.config.productionTip = false;
// Vue.prototype.$firestorage = FbApp.storage();
// Vue.prototype.$fireauth = FbApp.auth();

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>',
}).$mount('#app');
