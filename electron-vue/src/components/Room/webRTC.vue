<template>
  <div class="webRTC">
    <div>
      <span class="mute-video-button" @click.prevent="muteVideo">
        <i
          class="fa fa-video-camera fa-2x"
          v-if="!isVideoMuted"
          aria-hidden="true"
        ></i>
        <i class="fa fa-pause fa-2x" v-if="isVideoMuted" aria-hidden="true"></i>
      </span>
      <span class="mute-audio-button" @click.prevent="muteAudio">
        <i
          class="fa fa-microphone fa-2x"
          v-if="!isAudioMuted"
          aria-hidden="true"
        ></i>
        <i
          class="fa fa-microphone-slash fa-2x"
          v-if="isAudioMuted"
          aria-hidden="true"
        ></i>
      </span>
    </div>
    <div>
      <video ref="localVideo" autoplay muted playsinline></video>
      <p>Me</p>
    </div>
    <div ref="videos" class="remote-streams"></div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'WebRTC',
  data() {
    return {
      isVideoMuted: true,
      isAudioMuted: true,
    };
  },

  methods: {
    muteVideo() {
      this.isVideoMuted = !this.isVideoMuted;
      this.MuteVideo();
    },
    muteAudio() {
      this.isAudioMuted = !this.isAudioMuted;
      this.MuteAudio();
    },
    ...mapActions('webRTC', [
      'SetUser',
      'LocalVideoSetter',
      'VideoSetter',
      'MuteVideo',
      'MuteAudio',
    ]),
  },
  mounted() {
    this.SetUser(this.$user);
    this.LocalVideoSetter(this.$refs.localVideo);
    this.VideoSetter(this.$refs.videos);
  },
};
</script>

<style>
.mute-video-button {
  margin-right: 30px;
}
.remote-streams div {
  margin: 30px;
}
.remote-streams div p {
  color: black;
}
</style>
