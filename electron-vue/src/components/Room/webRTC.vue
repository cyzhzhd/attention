<template>
  <div class="webRTC">
    <div class="teacher">
      <video ref="teacherVideo"></video>
    </div>
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
  name: 'WebRTC',
  methods: {
    ...mapActions('webRTC', ['SetUser', 'VideoSetter']),
  },
  mounted() {
    const { _id } = this.$user;
    this.SetUser(_id);
    const params = {
      localVideo: this.$refs.localVideo,
      videos: this.$refs.videos,
      teacherVideo: this.$refs.teacherVideo,
    };
    this.VideoSetter(params);
  },
};
</script>

<style>
.webRTC {
  height: 93vh;
  display: grid;
  grid-template-rows: 70% 30%;
  grid-template-areas: 'teacher', 'videos';
}
.teacher {
  grid-area: 'teacher';
}
.teacher video {
  width: 100%;
  max-height: 67vh;
}

.videos {
  grid-area: 'videos';
  display: flex;
  align-items: center;
  /* grid-template-columns: 1fr; */
  margin-top: 20px;
}
.videos video {
  /* width: 99%; */
  max-height: 24.5vh;
}
.videos div p {
  color: black;
}
</style>
