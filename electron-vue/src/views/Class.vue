<template>
  <div class="container">
    <div class="goal">
      <p>2주차 관동별곡</p>
    </div>
    <web-rtc class="webRTC"></web-rtc>
    <!-- <chat class="chat"></chat> -->
    <user-list class="user-list"></user-list>
    <room-options class="room-options"></room-options>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
// import chat from '../components/Room/roomOptions/chat.vue';
import WebRtc from '../components/Room/webRTC.vue';
import userList from '../components/Room/userlist.vue';
import roomOptions from '../components/Room/roomOptions.vue';

export default {
  name: 'Class',
  components: {
    // chat,
    WebRtc,
    userList,
    roomOptions,
  },
  data() {
    return {
      classroomId: this.$route.params.classroomId,
      classId: this.$route.params.classId,
    };
  },
  methods: {
    enterRoom() {
      console.log('vue에서 roomId', this.roomId);
      this.EnterRoom({
        classroomId: this.classroomId,
        classId: this.classId,
        jwt: this.$jwt,
      });
    },
    ...mapActions('webRTC', ['EnterRoom']),
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
  grid-template-columns: 100px 1fr 100px;
  grid-template-rows: 60px 1fr;
  grid-template-areas:
    'goal goal goal'
    'userlist webRTC options';
  /* 'footer footer footer'; */
}
.goal {
  grid-area: goal;
  display: flex;

  background: #12ac85;
}

.goal p {
  margin-left: 9rem;
  margin-top: 16px;

  font-family: Gmarket Sans;
  font-style: normal;
  font-weight: bold;
  font-size: 25px;
  /* line-height: 36px; */
  text-align: center;
  letter-spacing: 0.31em;
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
.room-options {
  grid-area: options;
}
</style>
