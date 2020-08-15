<template>
  <div class="container">
    <header class="header">
      <h3 class="text-center">
        {{ roomname }}
        <a @click="leaveRoom">(back)</a>
      </h3>
    </header>
    <div class="webRTC">
      <WebRTC></WebRTC>
    </div>
    <div class="char">
      <chat></chat>
    </div>
    <div class="user-list">
      userlist
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import chat from '../components/Room/chat.vue';
import WebRTC from '../components/Room/webRTC.vue';

export default {
  name: 'room',
  components: {
    chat,
    WebRTC,
  },
  data() {
    return {
      roomId: this.$route.params.roomId,
      roomname: this.$route.params.roomname,
      user: {
        email: 'email address',
        nickname: this.$route.params.nickname,
      },
      useVideo: false,
    };
  },
  methods: {
    showVideo() {
      this.useVideo = !this.useVideo;
    },
    enterRoom() {
      this.EnterRoom(this.roomname);
    },

    leaveRoom() {
      this.$router.go(-1);
      this.LeaveRoom(this.roomname);
    },

    ...mapActions('webRTC', ['EnterRoom', 'LeaveRoom']),
  },

  created() {
    this.enterRoom();
  },
};
</script>

<style>
.container {
  display: grid;
  grid-template-columns: 1fr 20% 10%;
  grid-template-areas:
    'header header header'
    'webRTC chat userlist';
}
.header {
  grid-area: header;
  padding: 15px;
}
.webRTC {
  grid-area: webRTC;
}
.chat {
  grid-area: chat;
}
.user-list {
  grid-area: userlist;
  height: 516px;
  overflow-y: auto;
}
</style>
