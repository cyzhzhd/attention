<template>
  <div class="options-vue">
    <div class="option-bar">
      <div class="options">
        <div class="option" @click.prevent="ShareScreen">화면공유</div>
        <div class="option">채팅</div>
        <div class="option" @click.prevent="controlModal('showingInviteModal')">
          <a href="#">초대</a>
        </div>
        <div class="option" @click.prevent>
          <a href="#">설정</a>
        </div>
        <div class="camdio">
          <div @click.prevent="muteVideo">
            <!-- <img src="../../assets/camera-on.svg" /> -->
            <img src="../../assets/camera-on.svg" v-if="!isVideoMuted" />
            <img src="../../assets/camera-off.svg" v-if="isVideoMuted" />
            <!-- <i class="fa fa-video-camera" v-if="!isVideoMuted" aria-hidden="true"></i> -->
            <!-- <i class="fa fa-pause" v-if="isVideoMuted" aria-hidden="true"></i> -->
          </div>
          <div @click.prevent="muteAudio">
            <img src="../../assets/mic-on.svg" v-if="!isAudioMuted" />
            <img src="../../assets/mic-off.svg" v-if="isAudioMuted" />
            <!-- <i class="fa fa-microphone" v-if="!isAudioMuted" aria-hidden="true"></i>
            <i class="fa fa-microphone-slash" v-if="isAudioMuted" aria-hidden="true"></i>-->
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
      <smallModal v-if="modalList.showingInviteModal" @close="modalList.showingInviteModal">
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
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import smallModal from '../common/smallModal.vue';

export default {
  name: 'room-footer',
  components: {
    smallModal,
  },
  data() {
    return {
      roomId: this.$route.params.roomId,
      roomName: this.$route.params.roomName,
      modalList: {
        showingInviteModal: false,
      },

      isVideoMuted: true,
      isAudioMuted: true,
    };
  },
  methods: {
    controlModal(modelName) {
      this.modalList[modelName] = !this.modalList[modelName];
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
      console.log('vue에서 roomId', this.roomId);
      this.LeaveRoom({ roomName: this.roomName, roomId: this.roomId });
    },

    ...mapActions('webRTC', [
      'MuteVideo',
      'MuteAudio',
      'ShareScreen',
      'LeaveRoom',
    ]),
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
}
</style>