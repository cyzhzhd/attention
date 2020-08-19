import Vue from 'vue';
import axios from 'axios';

// firebase
// Firebase App (the core Firebase SDK) is always required and must be listed first
import * as firebase from 'firebase/app';
// If you enabled Analytics in your project, add the Firebase SDK for Analytics
import 'firebase/analytics';
// Add the Firebase products that you want to use
import 'firebase/auth';
import 'firebase/database';
import 'firebase/firestore';
// import * as firebaseui from 'firebaseui';
// import 'firebase/storage';

import App from './App.vue';
import router from './router';
import store from './store';

Vue.config.productionTip = false;
// const ui = new firebaseui.auth.AuthUI(firebase.auth());

// Vue.prototype.$ui = ui;
Vue.prototype.$http = axios;

// ui.start('#firebaseui-auth-container', {
//   signInOptions: [
//     {
//       provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
//       signInMethod: firebase.auth.EmailAuthProvider.EMAIL_LINK_SIGN_IN_METHOD,
//     },
//   ],
// });

axios.get('/api/firebase').then(response => {
  console.log(response.data);
  firebase.initializeApp(response.data);
  Vue.prototype.$firebase = firebase;
  Vue.prototype.$auth = firebase.auth();

  Vue.prototype.$setUser = user => {
    Vue.prototype.$user = user;
  };
});

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
