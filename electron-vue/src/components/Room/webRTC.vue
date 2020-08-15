<template>
  <div class="webRTC">
    <video ref="localVideo" autoplay muted playsinline></video>
    <div ref="videos"></div>
    <div>
      <button class="startButton" @click="OnStart">start</button>
      <button class="callButton" @click="StartConnecting">call</button>
      <button class="muteVideoButton">Mute</button>
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
    ]),
  },
  mounted() {
    this.LocalVideoSetter(this.$refs.localVideo);
    this.VideoSetter(this.$refs.videos);
  },
};
</script>

<style></style>
