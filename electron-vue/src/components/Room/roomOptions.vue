<template>
  <div>
    <div class="class-screen-toolbar">
      <div
        class="class-screen-toolbar-item"
        @click.prevent="controlModal('showingScreenSharingModal')"
      >
        화면공유
      </div>
      <div class="class-screen-toolbar-item" ref="temp">임시버튼</div>
      <div
        class="class-screen-toolbar-item"
        @click.prevent="controlModal('showingChatModal')"
      >
        채팅
      </div>
      <div
        class="class-screen-toolbar-item"
        @click.prevent="controlModal('showingInviteModal')"
      >
        초대
      </div>
      <div
        class="class-screen-toolbar-item"
        @click.prevent="controlModal('showingCCTModal')"
      >
        그래프
      </div>
      <div
        class="class-screen-toolbar-item"
        @click.prevent="controlModal('showingSettingModal')"
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
      <div class="quit-class-button" v-if="$store.state.user.isTeacher">
        <div @click.prevent="$refs.menu.open($event)" @click.stop>종료</div>
      </div>
      <div class="quit-class-button" v-else>
        <a @click="leaveClass">종료</a>
      </div>
    </div>

    <div class="modal-wrapper" v-on:click="controlModal('showingInviteModal')">
      <smallModal
        v-if="modalList.showingInviteModal"
        @close="modalList.showingInviteModal"
      >
        <h3 class="thisiscode" slot="header">강의 입장 코드</h3>
        <h4 class="codebody" slot="body">
          {{ this.$route.params.classroomId }}
        </h4>
        <h4 slot="footer">
          <i
            class="fa fa-times closeModalBtn fa-2x"
            aria-hidden="true"
            v-on:click="controlModal('showingInviteModal')"
          ></i>
        </h4>
      </smallModal>
    </div>
    <settings
      v-bind:showingModal="modalList.showingSettingModal"
      v-on:closeModal="controlModal"
    ></settings>
    <chat
      v-bind:showingModal="modalList.showingChatModal"
      v-on:closeModal="controlModal"
    ></chat>
    <CCTGraph
      v-bind:showingModal="modalList.showingCCTModal"
      v-on:closeModal="controlModal"
    ></CCTGraph>
    <screen-sharing
      v-bind:showingModal="modalList.showingScreenSharingModal"
      v-on:closeModal="controlModal"
    ></screen-sharing>
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
import smallModal from '../common/smallModal.vue';
import settings from './roomOptions/mainSettings.vue';
import chat from './roomOptions/chat.vue';
import screenSharing from './roomOptions/screenSharing.vue';
import CCTGraph from './roomOptions/CCTGraph.vue';
import bus from '../../../utils/bus';

export default {
  name: 'room-options',
  components: {
    smallModal,
    settings,
    chat,
    screenSharing,
    CCTGraph,
    VueContext,
  },
  data() {
    return {
      classroomId: this.$route.params.classroomId,
      roomName: this.$route.params.roomName,
      modalList: {
        showingInviteModal: false,
        showingSettingModal: false,
        showingChatModal: false,
        showingScreenSharingModal: false,
        showingCCTModal: false,
      },

      isVideoMuted: true,
      isAudioMuted: true,
    };
  },

  computed: {
    ...mapGetters('webRTC', ['storedLocalVideo']),
  },
  methods: {
    controlModal(modelName) {
      this.modalList[modelName] = !this.modalList[modelName];

      if (this.modalList[modelName] && modelName === 'showingSettingModal') {
        bus.$emit('videoSetting');
      } else if (
        this.modalList[modelName] &&
        modelName === 'showingScreenSharingModal'
      ) {
        bus.$emit('screenSharing');
      } else if (
        this.modalList[modelName] &&
        modelName === 'showingChatModal'
      ) {
        bus.$emit('openChat');
      } else if (this.modalList[modelName] && modelName === 'showingCCTModal') {
        bus.$emit('openCCTGraph');
      }
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
  mounted() {
    this.ButtonSetter1(this.$refs.temp);
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
  height: 500px;
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
.class-screen-toolbar:hover > .quit-class-button {
  width: 100px;
}
.quit-class-button {
  /* width: 40px; */
  /* height: 40px; */
  background-color: #9097fd;
  border-radius: 20px;
  color: #fff;
  font-size: 18px;
  line-height: 40px;
  text-align: center;
  margin-top: 24px;
  cursor: pointer;
  text-overflow: ellipsis;
}
.class-screen-toolbar-item {
  /* font-weight: bold; */
  font-size: 18px;
  color: #9097fd;
  cursor: pointer;
  text-overflow: ellipsis;
}

.class-screen-toolbar-item + .class-screen-toolbar-item {
  margin-top: 24px;
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

.thisiscode {
  font-family: 'GmarketSansBold';
  font-size: 20px;
  letter-spacing: -1px;
  color: #9097fd;
}

.codebody {
  font-family: 'Spoqa Han Sans', 'Spoqa Han Sans JP', 'Sans-serif';
  font-size: 18px;
  letter-spacing: -1px;
  font-weight: normal;
  color: #333333;
}
</style>
