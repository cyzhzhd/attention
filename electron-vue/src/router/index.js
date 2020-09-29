import Vue from 'vue';
import VueRouter from 'vue-router';
import Login from '../views/Login.vue';
import MainPage from '../views/MainPage.vue';
// import ClassRoomList from '../views/ClassRoomList.vue';
// import ClassRoom from '../views/ClassRoom.vue';
// import Class from '../views/Class.vue';
import AddClassRoom from '../views/AddClassRoom.vue';
import ClassRoomSettings from '../views/ClassRoomSettings.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login,
  },

  {
    path: '/mainPage',
    name: 'MainPage',
    component: MainPage,
  },
  // {
  //   path: '/classroomList',
  //   name: 'ClassRoomList',
  //   component: ClassRoomList,
  // },
  // {
  //   path: '/classroom/:classroomId/:classroomName',
  //   name: 'ClassRoom',
  //   component: ClassRoom,
  // },
  // {
  //   path: '/classroom/:classroomId/:classroomName/:classId',
  //   name: 'Class',
  //   component: Class,
  // },
  {
    path: '/add-classroom',
    name: 'AddClassRoom',
    component: AddClassRoom,
  },
  {
    path: '/classroom-settings/:classroomId/:classroomName',
    name: 'ClassRoomSettings',
    component: ClassRoomSettings,
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ '../views/About.vue'),
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
