/* eslint-disable no-use-before-define */
import Vue from 'vue';
import axios from 'axios';

import App from './App.vue';
import router from './router';
import store from './store';

Vue.config.productionTip = false;
Vue.prototype.$http = axios;

// Vue.prototype.$setJWT = jwt => {
//   Vue.prototype.$jwt = jwt;
// };

// Vue.prototype.$setUser = user => {
//   Vue.prototype.$user = user;
// };

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
