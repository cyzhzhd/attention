<template>
  <div class="webRTC">
    <video ref="localVideo" autoplay muted playsinline></video>
    <div ref="videos"></div>
    <div>
      <button class="start-button" @click="OnStart">start</button>
      <button class="call-button" @click="StartConnecting">call</button>
      <button class="mute-video-button" @click="MuteVideo">video</button>
      <button class="mute-mic-button" @click="MuteAudio">mic</button>

      <b>Your session ID =</b>
      <text class="sessionID">call first</text>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'WebRTC',
  data() {
    return {};
  },

  methods: {
    ...mapActions('webRTC', [
      'OnStart',
      'StartConnecting',
      'LocalVideoSetter',
      'VideoSetter',
      'MuteVideo',
      'MuteAudio',
    ]),
  },
  mounted() {
    this.LocalVideoSetter(this.$refs.localVideo);
    this.VideoSetter(this.$refs.videos);
  },
};
</script>

<style>
.start-button {
  background-color: aquamarine;
  border-radius: 0.5rem;
}
.call-button {
  background-color: aquamarine;
  border-radius: 0.5rem;
}
.mute-video-button {
  background-color: aquamarine;
  border-radius: 0.5rem;
}
</style>
