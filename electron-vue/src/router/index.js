import Vue from 'vue';
import VueRouter from 'vue-router';
import Login from '../views/Login.vue';
import SignIn from '../views/SignIn.vue';
import ClassRoomList from '../views/ClassRoomList.vue';
import ClassRoom from '../views/ClassRoom.vue';
import Class from '../views/Class.vue';
import ClassRoomSettings from '../views/ClassRoomSettings.vue';
import Dashboard from '../views/Dashboard.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login,
  },
  {
    path: '/signin',
    name: 'SignIn',
    component: SignIn,
  },
  {
    path: '/classroomList',
    name: 'ClassRoomList',
    component: ClassRoomList,
  },
  {
    path: '/classroom/:classroomId',
    name: 'ClassRoom',
    component: ClassRoom,
  },
  {
    path: '/classroom-settings/:classroomId/:classroomName',
    name: 'ClassRoomSettings',
    component: ClassRoomSettings,
  },
  {
    path: '/dashboard/:classroomId/:classId',
    name: 'Dashboard',
    component: Dashboard,
  },
  {
    path: '/class/:classroomId/:classId',
    name: 'Class',
    component: Class,
  },
];

const router = new VueRouter({
  mode: process.env.IS_ELECTRON ? 'hash' : 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
