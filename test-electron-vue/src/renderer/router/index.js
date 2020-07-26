import Vue from 'vue'
import Router from 'vue-router'
import Home from '../components/LandingPage.vue'
import About from '../components/Ex.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/about',
      name: 'About',
      component: About
    }
  ]
})
