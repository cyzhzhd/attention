<template>
  <div class="webRTC">
    <div ref="videos" class="videos">
      <div class="localVideo-div">
        <video
          ref="localVideo"
          class="localVideo"
          autoplay
          muted
          playsinline
        ></video>
        <p>{{ $store.state.user.name }}</p>
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
.videos {
  display: grid;
  grid-template-columns: 1fr;
}
.videos div p {
  position: absolute;
  color: white;
  background-color: gray;
}
.localVideo-div {
  display: flex;
}
</style>
