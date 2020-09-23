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
import bus from '../../../utils/bus';

export default {
  name: 'WebRTC',
  methods: {
    ...mapActions('webRTC', ['SetUser', 'LocalVideoSetter', 'VideoSetter']),
  },
  created() {
    bus.$on('test', () => {
      console.log('bus is working!!!');
    });
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
  grid-template-columns: repeat(auto-fit, minmax(480px, auto));
  /* grid-template-rows: repeat(auto-fit, minmax(360px, 750px)); */
  /* max-height: 750px; */

  margin-top: 20px;
}
.videos video {
  width: 99%;
  max-height: 750px;
}
.videos div p {
  color: black;
}
</style>
