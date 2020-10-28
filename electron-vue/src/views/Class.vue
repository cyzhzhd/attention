<template>
  <div class="container" ref='contatiner'>
    <div class="closeBtn" ref="closeBtn" @click="backToNormalView">
      화면 공유 종료
    </div>
    <div ref="goal" class="goal">
      <p>2주차 관동별곡</p>
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
      bus.$emit('class:stop-sharing-screen')
      console.log('backToNormalView');
      this.$refs.goal.style.display = 'flex';
      this.$refs.userList.style.display = 'block';
      this.$refs.roomOptions.style.display = 'block';
      this.$refs.contatiner.style.gridTemplateColumns = '100px 1fr 100px';
      this.$refs.contatiner.style.gridTemplateRows = '60px 1fr';
      this.$refs.contatiner.style.gridTemplateAreas = "'goal goal goal' 'userlist webRTC options'";
      this.$refs.closeBtn.style.display = 'none';
      ipcRenderer.send('attention:stop-sharing-screen');
    },
    ...mapActions('webRTC', ['EnterRoom']),
  },
  mounted() {
    console.log("class mounted");
    this.enterRoom();

    bus.$on('onDeliverDisconnection', () => {
      this.$router.go(-1);
    });

    
    bus.$on('rtcPart:start-sharing-screen', () => {
      this.$refs.goal.style.display = 'none';
      this.$refs.userList.style.display = 'none';
      this.$refs.roomOptions.style.display = 'none';
      this.$refs.contatiner.style.gridTemplateColumns = '1fr';
      this.$refs.contatiner.style.gridTemplateRows = '25px 1fr';
      this.$refs.contatiner.style.gridTemplateAreas = "'closeBtn' 'webRTC'";
      this.$refs.closeBtn.style.display = 'block';

      // 연결된 유저 수 * 비디오 높이 + 버튼 높이 보내기
      const offset = 290;
      const height = offset + 205 * (this.storedDisplayingStudentList.length);
      console.log(height, (this.storedDisplayingStudentList.length + 1));
      console.log(this.storedDisplayingStudentList);
      ipcRenderer.send('attention:start-sharing-screen', height);
    });
  },
  beforeDestroy() {
    bus.$off('onDeliverDisconnection');
    bus.$off('rtcPart:start-sharing-screen');
  }
};
</script>

<style scoped>
.container {
  display: grid;
  height: 100vh;
  grid-template-columns: 100px 1fr 100px;
  grid-template-rows: 60px 1fr;
  grid-template-areas:
    'goal goal goal'
    'userlist webRTC options';
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

.closeBtn {
  grid-area: closeBtn;
  display: none;
}
</style>
