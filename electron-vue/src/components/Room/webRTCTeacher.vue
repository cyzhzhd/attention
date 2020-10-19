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

export default {
  name: 'WebRTCTeacher',
  methods: {
    ...mapActions('webRTC', ['SetUser', 'VideoSetter']),
  },
  mounted() {
    const { _id } = this.$store.state.user;
    this.SetUser(_id);
    const params = {
      localVideo: this.$refs.localVideo,
      videos: this.$refs.videos,
    };
    this.VideoSetter(params);
  },
};
</script>

<style scoped>
.webRTC {
  /* width: 89.5vw; */
  height: 93vh;
}
.videos {
  display: grid;
  grid-template-columns: 1fr;
  margin-top: 20px;
}
.localVideo {
    object-fit: cover;
}
.videos div video {
  width: 99%;
  max-height: 750px;
}
.videos div p {
  color: black;
}
</style>
