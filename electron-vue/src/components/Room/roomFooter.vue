<template>
  <div>
    <ul class="menu">
      <li class="menu-item menu-link" @click.prevent="ShareScreen">
        <i class="fa fa-desktop fa-2x" aria-hidden="true"></i>
      </li>
      <li class="menu-item menu-link" @click.prevent="muteVideo">
        <i class="fa fa-video-camera fa-2x" v-if="!isVideoMuted" aria-hidden="true"></i>
        <i class="fa fa-pause fa-2x" v-if="isVideoMuted" aria-hidden="true"></i>
      </li>
      <li class="menu-item menu-link" @click.prevent="muteAudio">
        <i class="fa fa-microphone fa-2x" v-if="!isAudioMuted" aria-hidden="true"></i>
        <i class="fa fa-microphone-slash fa-2x" v-if="isAudioMuted" aria-hidden="true"></i>
      </li>
      <li class="menu-item" @click.prevent="controlModal('showingInviteModal')">
        <a href="#" class="menu-link">Invite</a>
      </li>
      <li class="menu-item" @click.prevent>
        <a href="#" class="menu-link">Room Settings</a>
      </li>
    </ul>
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

    ...mapActions('webRTC', ['MuteVideo', 'MuteAudio', 'ShareScreen']),
  },
};
</script>

<style>
</style>