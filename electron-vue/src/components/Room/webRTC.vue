<template>
  <div class="webRTC">
    <div ref="videos" class="videos">
      <div>
        <video
          ref="localVideo"
          class="localVideo"
          autoplay
          muted
          playsinline
        ></video>
        <p>Me</p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
// import bus from '../../../utils/bus';

export default {
  name: 'WebRTC',
  methods: {
    ...mapActions('webRTC', ['SetUser', 'VideoSetter']),
  },
  // created() {
  //   bus.$on('test', () => {
  //     console.log('bus is working!!!');
  //   });
  // },
  mounted() {
    const { _id } = this.$user;
    this.SetUser(_id);
    const params = {
      localVideo: this.$refs.localVideo,
      videos: this.$refs.videos,
    };
    this.VideoSetter(params);
  },
};
</script>

<style>
.webRTC {
  width: 85vw;
  height: 93vh;
}
.videos {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  /* grid-template-rows: 1fr 1fr; */
  /* justify-items: center; */
  /* grid-template-rows: 1fr 1fr 1fr; */
  /* grid-template-columns: repeat(auto-fit, minmax(480px, auto)); */
  /* grid-template-rows: repeat(auto-fit, minmax(360px, 750px)); */
  /* max-height: 750px; */

  margin-top: 20px;
}
.videos video {
  width: 99%;
  /* max-height: 750px; */
  max-height: 43vh;
}
.videos div p {
  color: black;
}
</style>
