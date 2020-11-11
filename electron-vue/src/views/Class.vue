<template>
  <div class="container" ref="contatiner">
    <div class="closeBtnWrapper">
      <button class="closeBtn" ref="closeBtn" @click="backToNormalView">
        화면 공유 종료
      </button>
    </div>
    <div class="webRTC" ref="rtcT">
      <web-rtc-teacher v-if="$store.state.user.isTeacher"></web-rtc-teacher>
      <web-rtc-student v-else></web-rtc-student>
    </div>
    <div class="user-list" ref="userList">
      <user-list></user-list>
    </div>
    <div class="room-options" ref="roomOptions">
      <room-options></room-options>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { ipcRenderer } from 'electron'; // eslint-disable-line import/no-extraneous-dependencies
import WebRtcStudent from '../components/Room/webRTCStudent.vue';
import WebRtcTeacher from '../components/Room/webRTCTeacher.vue';
import userList from '../components/Room/userlist.vue';
import roomOptions from '../components/Room/roomOptions.vue';
import bus from '../../utils/bus';

export default {
  name: 'Class',
  computed: {
    ...mapGetters('webRTC', ['storedDisplayingStudentList']),
  },
  components: {
    WebRtcStudent,
    userList,
    roomOptions,
    WebRtcTeacher,
  },
  data() {
    return {
      classroomId: this.$route.params.classroomId,
      classId: this.$route.params.classId,
    };
  },
  methods: {
    enterRoom() {
      this.EnterRoom({
        classroomId: this.classroomId,
        classId: this.classId,
        jwt: this.$store.state.jwt,
        isTeacher: this.$store.state.user.isTeacher,
      });
    },
    backToNormalView() {
      console.log('backToNormalView');
      bus.$emit('class:stop-sharing-screen');
      this.$refs.userList.style.display = 'block';
      this.$refs.roomOptions.style.display = 'block';
      this.$refs.contatiner.style.gridTemplateColumns = '100px 1fr';
      this.$refs.contatiner.style.gridTemplateRows = '60px 1fr';
      this.$refs.contatiner.style.gridTemplateAreas = "'userlist webRTC'";
      this.$refs.closeBtn.style.display = 'none';
      ipcRenderer.send('attention:stop-sharing-screen');
    },
    ...mapActions('webRTC', ['EnterRoom']),
  },
  mounted() {
    console.log('class mounted');
    this.enterRoom();

    bus.$on('onDeliverDisconnection', () => {
      this.$router.go(-1);
    });

    bus.$on('rtcPart:start-sharing-screen', () => {
      this.$refs.userList.style.display = 'none';
      this.$refs.roomOptions.style.display = 'none';
      this.$refs.contatiner.style.gridTemplateColumns = '1fr';
      this.$refs.contatiner.style.gridTemplateRows = '25px 1fr';
      this.$refs.contatiner.style.gridTemplateAreas = "'closeBtn' 'webRTC'";
      this.$refs.closeBtn.style.display = 'block';

      // 연결된 유저 수 * 비디오 높이 + 버튼 높이 보내기
      const offset = 196;
      const height = offset + 175 * this.storedDisplayingStudentList.length;
      console.log(height, this.storedDisplayingStudentList.length + 1);
      console.log(this.storedDisplayingStudentList);
      ipcRenderer.send('attention:start-sharing-screen', height);
    });
  },
  beforeDestroy() {
    bus.$off('onDeliverDisconnection');
    bus.$off('rtcPart:start-sharing-screen');
  },
};
</script>

<style scoped>
.container {
  display: grid;
  height: 100vh;
  grid-template-columns: 100px 1fr;
  /* grid-template-rows: 1fr; */
  grid-template-areas: 'userlist webRTC';
  background-color: #f6f7fb;
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
  height: 100vh;
  overflow-y: auto;
}
.room-options {
  grid-area: options;
}
.closeBtnWrapper {
  display: flex;
  align-content: center;
  justify-content: center;
}
.closeBtn {
  grid-area: closeBtn;
  display: none;
  cursor: pointer;
  width: 110px;
  border-radius: 1rem;
  border: 1px solid #9097fd;
  color: #9097fd;
  left: 30px;
}
</style>
