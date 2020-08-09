<template>
  <div id="webRTC">
    <div ref="videos">
      <video ref="localVideo" autoplay muted playsinline></video>
    </div>
    <div>
      <button id="startButton" @click="OnStart">start</button>
      <button id="callButton" @click="StartConnecting">call</button>
      <button id="hangupButton" @click="HangUp">hangup</button>
      <button id="muteVideoButton">Mute</button>
      <b>Your session ID =</b>
      <text id="sessionID">call first</text>
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
      'HangUp',
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
