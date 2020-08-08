import Vue from 'vue';

// firebase
// Firebase App (the core Firebase SDK) is always required and must be listed first
import * as firebase from 'firebase/app';
// If you enabled Analytics in your project, add the Firebase SDK for Analytics
import 'firebase/analytics';
// Add the Firebase products that you want to use
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';

import App from './App.vue';
import router from './router';
import store from './store';

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

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
