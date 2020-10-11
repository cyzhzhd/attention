import Vue from 'vue';
import VueRouter from 'vue-router';
import Login from '../views/Login.vue';
import ClassRoomList from '../views/ClassRoomList.vue';
import ClassRoom from '../views/ClassRoom.vue';
import Class from '../views/Class.vue';
import AddClassRoom from '../views/AddClassRoom.vue';
import AddClass from '../views/AddClass.vue';
import ClassRoomSettings from '../views/ClassRoomSettings.vue';
import ScreenSharingControlPanel from '../views/ScreenSharingControlPanel.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login,
  },
  {
    path: '/classroomList',
    name: 'ClassRoomList',
    component: ClassRoomList,
  },
  {
    path: '/classroom/:classroomId/:classroomName/:classId',
    name: 'ClassRoom',
    component: ClassRoom,
  },
  {
    path: '/classroom/:classroomId/:classId',
    name: 'Class',
    component: Class,
  },
  {
    path: '/add-classroom',
    name: 'AddClassRoom',
    component: AddClassRoom,
  },
  {
    path: '/add-class/:classroomId',
    name: 'AddClass',
    component: AddClass,
  },
  {
    path: '/classroom-settings/:classroomId/:classroomName',
    name: 'ClassRoomSettings',
    component: ClassRoomSettings,
  },
  {
    path: '/ScreenSharingControlPanel',
    name: 'ScreenSharingControlPanel',
    component: ScreenSharingControlPanel,
  },
];

const router = new VueRouter({
  mode: process.env.IS_ELECTRON ? 'hash' : 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
