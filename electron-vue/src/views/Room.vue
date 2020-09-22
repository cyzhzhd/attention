<template>
  <div class="container">
    <div class="goal">
      <p>학습목표</p>
      <p>관동 별곡의 감성을 느끼다</p>
    </div>
    <h2 class="room-detail">
      <!-- {{ roomName }} -->
      <a @click="leaveRoom">
        뒤로가기
        <i class="fa fa-long-arrow-left fa" aria-hidden="true"></i>
      </a>
    </h2>
    <web-rtc class="webRTC"></web-rtc>
    <chat class="chat"></chat>
    <user-list class="user-list"></user-list>
    <room-footer class="footer"></room-footer>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import chat from '../components/Room/chat.vue';
import WebRtc from '../components/Room/webRTC.vue';
import userList from '../components/Room/userlist.vue';
import RoomFooter from '../components/Room/roomFooter.vue';

export default {
  name: 'room',
  components: {
    chat,
    WebRtc,
    userList,
    RoomFooter,
  },
  data() {
    return {
      roomId: this.$route.params.roomId,
      roomName: this.$route.params.roomName,
    };
  },
  methods: {
    enterRoom() {
      console.log('vue에서 roomId', this.roomId);
      this.EnterRoom({ roomName: this.roomName, roomId: this.roomId });
    },

    leaveRoom() {
      this.$router.go(-1);
      console.log('vue에서 roomId', this.roomId);
      this.LeaveRoom({ roomName: this.roomName, roomId: this.roomId });
    },
    ...mapActions('webRTC', ['EnterRoom', 'LeaveRoom']),
  },
  mounted() {
    this.enterRoom();
  },
};
</script>

<style>
.container {
  display: grid;
  height: 100vh;
  grid-template-columns: 100px 1fr 20%;
  grid-template-rows: 10% 1fr 65px;
  grid-template-areas:
    '. goal detail'
    'userlist webRTC chat'
    'footer footer footer';
}
.goal {
  grid-area: goal;
  display: flex;

  height: 50px;
  margin-top: 20px;

  background: #00d39d;
  border-radius: 31px;
}
.goal p {
  margin-left: 20px;
  margin-top: 10px;

  text-align: start;
  font-family: SpoqaHanSans;
  font-size: 1.3rem;
  font-style: normal;
  font-weight: normal;
  color: white;
}
.room-detail {
  grid-area: detail;
  margin-top: 30px;
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
.footer {
  grid-area: footer;
}
</style>
