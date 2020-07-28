import Vue from 'vue';
import Router from 'vue-router';
import Login from '../components/login.vue';
import RoomList from '../components/roomList.vue';
import Chat from '../components/room.vue';
import AddRoom from '../components/addRoom.vue';
import VideoMain from '../components/videoPopup/videoMain.vue';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'login',
      component: Login,
    },
    {
      path: '/room/:nickname',
      name: 'RoomList',
      component: RoomList,
    },
    {
      path: '/add-room',
      name: 'AddRoom',
      component: AddRoom,
    },
    {
      path: '/chat/:nickname/:roomid/:roomname',
      name: 'Chat',
      component: Chat,
    },
    {
      path: '/videoPopup',
      name: 'VideoPopup',
      component: VideoMain,
    },
    {
      path: '*',
      redirect: '/',
    },
  ],
});
