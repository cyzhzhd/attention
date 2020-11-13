<template>
  <div>
    <div class="class-screen-toolbar">
      <div
        v-if="$store.state.user.isTeacher"
        class="class-screen-toolbar-item"
        @click.prevent="callControlModal('showingScreenSharingModal')"
      >
        화면공유
      </div>
      <!-- <div
        class="class-screen-toolbar-item class-screen-chat"
        @click.prevent="callControlModal('showingChatModal')"
      >
        채팅
      </div> -->
      <div
        class="class-screen-toolbar-item class-screen-chat"
        @click.prevent="callControlModal('showingChatModal')"
      >
        <div
          class="unseen-message"
          v-if="$store.state.modal.numUnseenMessage !== 0"
        >
          {{ $store.state.modal.numUnseenMessage }}
        </div>
        채팅
      </div>
      <div
        class="class-screen-toolbar-item"
        @click.prevent="callControlModal('showingGroupModal')"
      >
        그룹
      </div>
      <div
        v-if="$store.state.user.isTeacher"
        class="class-screen-toolbar-item"
        @click.prevent="callControlModal('showingCCTModal')"
      >
        그래프
      </div>
      <div
        v-if="$store.state.user.isTeacher"
        class="class-screen-toolbar-item"
        @click.prevent="callControlModal('showingSettingModal')"
      >
        설정
      </div>
      <div class="class-screen-toolbar-item class-screen-toolbar-icon-wrapper">
        <div @click.prevent="muteVideo">
          <img src="../../assets/img/room/camera-on.svg" v-if="!isVideoMuted" />
          <img src="../../assets/img/room/camera-off.svg" v-if="isVideoMuted" />
        </div>
        <div @click.prevent="muteAudio">
          <img src="../../assets/img/room/mic-on.svg" v-if="!isAudioMuted" />
          <img src="../../assets/img/room/mic-off.svg" v-if="isAudioMuted" />
        </div>
      </div>
      <div class="quit-class-button-wrapper" v-if="$store.state.user.isTeacher">
        <div
          class="quit-class-button"
          @click.prevent="$refs.menu.open($event)"
          @click.stop
        >
          종료
        </div>
      </div>
      <div class="quit-class-button-wrapper" v-else>
        <a class="quit-class-button" @click="leaveClass()">종료</a>
      </div>
    </div>

    <settings></settings>
    <chat></chat>
    <CCTGraph></CCTGraph>
    <screen-sharing></screen-sharing>
    <group></group>
    <vue-context ref="menu">
      <template>
        <li>
          <a @click.prevent="leaveClass(true)">수업 종료</a>
        </li>
        <li>
          <a @click.prevent="leaveClass()">수업 나가기</a>
        </li>
      </template>
    </vue-context>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import VueContext from 'vue-context';
import 'vue-context/src/sass/vue-context.scss';
import settings from './roomOptions/mainSettings.vue';
import chat from './roomOptions/chat.vue';
import screenSharing from './roomOptions/screenSharing.vue';
import CCTGraph from './roomOptions/CCTGraph.vue';
import group from './roomOptions/group.vue';
// import bus from '../../../utils/bus';

export default {
  name: 'room-options',
  components: {
    settings,
    chat,
    screenSharing,
    CCTGraph,
    group,
    VueContext,
  },
  data() {
    return {
      classroomId: this.$route.params.classroomId,
      roomName: this.$route.params.roomName,
      modalSize: {
        width: '300px',
      },
      isVideoMuted: true,
      isAudioMuted: true,
    };
  },

  computed: {
    ...mapGetters('webRTC', ['storedLocalVideo']),
    ...mapGetters('modal', ['modalList']),
  },
  methods: {
    callControlModal(modalName) {
      this.$store.dispatch('modal/ControlModal', modalName);
    },

    muteVideo() {
      this.isVideoMuted = !this.isVideoMuted;
      this.MuteVideo();
    },
    muteAudio() {
      this.isAudioMuted = !this.isAudioMuted;
      this.MuteAudio();
    },

    async leaveClass(isFinishing = false) {
      this.LeaveRoom();
      if (isFinishing) {
        const options = {
          class: this.classroomId,
          session: this.$route.params.classId,
        };
        console.log('finish class');
        this.FinishClass();
        await this.$store.dispatch('FINISH_CLASS', options);
      }
      this.$router.go(-1);
    },

    ...mapActions('webRTC', [
      'MuteVideo',
      'MuteAudio',
      'ShareScreen',
      'LeaveRoom',
      'ButtonSetter1',
      'FinishClass',
    ]),
  },
};
</script>

<style scoped>
@import url(//spoqa.github.io/spoqa-han-sans/css/SpoqaHanSans-kr.css);
@import url(//spoqa.github.io/spoqa-han-sans/css/SpoqaHanSans-jp.css);
@font-face {
  font-family: 'GmarketSansBold';
  src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansBold.woff')
    format('woff');
  font-weight: normal;
  font-style: normal;
}

.class-screen-toolbar {
  width: 20px;
  height: 450px;
  z-index: 999;
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 1px solid #9097fd;
  border-top-left-radius: 40px;
  border-bottom-left-radius: 40px;
  top: 50%;
  transform: translateY(-50%);
  right: 0px;
  background-color: #fff;
  transition: transform 100ms ease-in;
  font-family: 'GmarketSansBold';
  font-weight: 100;
}

.class-screen-toolbar > * {
  visibility: hidden;
}

.class-screen-toolbar:hover {
  transform: translate(0px, -50%);
  width: 120px;
}
.class-screen-toolbar:hover > * {
  visibility: visible;
}
.class-screen-toolbar:hover > .quit-class-button-wrapper {
  width: 80px;
}
.class-screen-chat {
  display: flex;
  flex-direction: column;
}
.unseen-message {
  background-color: red;
  color: white;
  border-radius: 1rem;

  width: 20px;
  font-size: 12px;
}
.quit-class-button-wrapper {
  background-color: #9097fd;
  border-radius: 20px;
  color: #fff;
  font-size: 18px;
  text-align: center;
  margin-top: 24px;
  cursor: pointer;
  text-overflow: ellipsis;
}
.quit-class-button {
  margin: 5px 0;
}
.class-screen-toolbar-item {
  font-size: 18px;
  color: #9097fd;
  cursor: pointer;
  text-overflow: ellipsis;
}

.class-screen-toolbar-item + .class-screen-toolbar-item {
  margin-top: 20px;
}

.class-screen-toolbar-icon-wrapper {
  display: flex;
  flex-direction: column;
}
.class-screen-toolbar-icon-wrapper div img {
  height: 40px;
}
.class-screen-toolbar-icon {
  width: 50px;
  height: 50px;
  background-color: #e4e4e4;
}

.class-screen-toolbar-icon + .class-screen-toolbar-icon {
  margin-top: 16px;
}
</style>
