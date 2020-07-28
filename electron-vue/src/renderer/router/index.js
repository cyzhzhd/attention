import Vue from 'vue';
import Router from 'vue-router';
import Login from '../components/login.vue';
import Room from '../components/room.vue';
import Chat from '../components/chat.vue';
import AddRoom from '../components/addRoom.vue';
Vue.use(Router);

export default new Router({
  routes: [
    // {
    //   path: '/',
    //   name: 'room',
    //   component: require('@/components/room.vue').default,
    // },
    {
      path: '/',
      name: 'login',
      component: Login,
    },
    {
      path: '/room/:nickname',
      name: 'RoomList',
      component: Room,
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
      path: '*',
      redirect: '/',
    },
  ],
});
