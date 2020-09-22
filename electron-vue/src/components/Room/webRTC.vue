<template>
  <!-- <div class="webRTC"> -->
  <div ref="videos" class="videos">
    <div>
      <video ref="localVideo" class="localVideo" autoplay muted playsinline></video>
      <p>Me</p>
    </div>
  </div>
  <!-- </div> -->
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'WebRTC',
  methods: {
    ...mapActions('webRTC', ['SetUser', 'LocalVideoSetter', 'VideoSetter']),
  },
  mounted() {
    this.SetUser(this.$user);
    this.LocalVideoSetter(this.$refs.localVideo);
    this.VideoSetter(this.$refs.videos);
  },
};
</script>

<style>
.videos {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(420px, auto));
  /* grid-template-rows: repeat(auto-fit, minmax(240px, 720px)); */
}
.videos video {
  width: 100%;
}
.videos div p {
  color: black;
}
</style>
