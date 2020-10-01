<template>
  <div class="options-vue">
    <div class="option-bar">
      <div class="options">
        <div
          class="option"
          @click.prevent="controlModal('showingScreenSharingModal')"
        >
          화면공유
        </div>
        <div class="option" ref="temp">임시버튼</div>
        <div class="option" @click.prevent="controlModal('showingChatModal')">
          채팅
        </div>
        <div class="option" @click.prevent="controlModal('showingInviteModal')">
          초대
        </div>
        <div
          class="option"
          @click.prevent="controlModal('showingSettingModal')"
        >
          설정
        </div>
        <div class="camdio">
          <div @click.prevent="muteVideo">
            <img
              src="../../assets/img/room/camera-on.svg"
              v-if="!isVideoMuted"
            />
            <img
              src="../../assets/img/room/camera-off.svg"
              v-if="isVideoMuted"
            />
          </div>
          <div @click.prevent="muteAudio">
            <img src="../../assets/img/room/mic-on.svg" v-if="!isAudioMuted" />
            <img src="../../assets/img/room/mic-off.svg" v-if="isAudioMuted" />
          </div>
        </div>
      </div>
      <div class="back">
        <div @click.prevent>
          <a @click="leaveRoom">수업종료</a>
        </div>
      </div>
    </div>
    <div class="modal-wrapper" v-on:click="controlModal('showingInviteModal')">
      <smallModal
        v-if="modalList.showingInviteModal"
        @close="modalList.showingInviteModal"
      >
        <h3 slot="header">Copy this roomId and give it to your student</h3>
        <h4 slot="body">{{ this.$route.params.roomId }}</h4>
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
    <!-- <chat
      v-bind:showingModal="modalList.showingChatModal"
      v-on:closeModal="controlModal"
    ></chat> -->
    <screen-sharing
      v-bind:showingModal="modalList.showingScreenSharingModal"
      v-on:closeModal="controlModal"
    ></screen-sharing>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import smallModal from '../common/smallModal.vue';
import settings from './roomOptions/mainSettings.vue';
// import chat from './roomOptions/chat.vue';
import screenSharing from './roomOptions/screenSharing.vue';
import bus from '../../../utils/bus';

export default {
  name: 'room-options',
  components: {
    smallModal,
    settings,
    // chat,
    screenSharing,
  },
  data() {
    return {
      roomId: this.$route.params.roomId,
      roomName: this.$route.params.roomName,
      modalList: {
        showingInviteModal: false,
        showingSettingModal: false,
        showingChatModal: false,
        showingScreenSharingModal: false,
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

    leaveRoom() {
      this.$router.go(-1);
      this.LeaveRoom();
    },

    ...mapActions('webRTC', [
      'MuteVideo',
      'MuteAudio',
      'ShareScreen',
      'LeaveRoom',
      'ButtonSetter1',
    ]),
  },
  mounted() {
    this.ButtonSetter1(this.$refs.temp);
  },
};
</script>

<style scoped>
.options-vue {
  background: #e4f7f1;
}
.option-bar {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  min-height: 100%;
}
.options {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-top: 20px;
  font-size: 1.1rem;
  width: 80%;
  height: 15rem;
}
.option {
  background: #12ac85;
  border-radius: 49px;
  height: 30px;
  color: white;
  padding-top: 6px;
  cursor: pointer;
}
.options div a {
  text-decoration: none;
  color: white;
}
.camdio {
  display: flex;
}
.camdio div img {
  height: 40px;
}

.back {
  font-size: 1.1rem;
  background: #00d39d;
  color: white;
  border-radius: 49px;

  padding-top: 6px;
  margin-bottom: 2rem;
  height: 30px;
  width: 80%;
  cursor: pointer;
}
</style>
