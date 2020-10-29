<template>
  <div class="webRTC">
    <div class="teacher">
      <video ref="teacherVideo"></video>
    </div>
    <div ref="videos" class="videos">
      <div>
        <canvas id="fcanvas" width="240" height="180"></canvas>
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
  name: 'WebRTCStudent',
  methods: {
    ...mapActions('webRTC', ['SetUser', 'VideoSetter']),
  },
  mounted() {
    const { _id } = this.$store.state.user;
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

<style scoped>
.webRTC {
  height: 93vh;
  display: grid;
  /* grid-template-rows: 70% 30%; */
  /* grid-template-areas: 'teacher', 'videos'; */
  grid-template-columns: 80% 20%;
  grid-template-areas: 'teacher videos';
}
.teacher {
  grid-area: 'teacher';
  align-self: center;
}
.teacher video {
  width: 100%;
  max-height: 67vh;
}
.videos {
  /* position: absolute; */
  grid-area: 'videos';
  display: flex;
  flex-direction: column;
  /* align-items: center; */
  justify-content: center;
  /* grid-template-columns: 1fr; */
  margin-top: 15px;
}
.videos video {
  position: relative;
  z-index: 1;
  /* width: 100%; */
  max-height: 21vh;
  /* padding: 0 5px; */
}
/* .videos canvas {
  position: absolute;
  z-index: 2;
  max-height: 21vh;
} */

.videos #fcanvas {
  position: absolute;
  z-index: 2;
  max-height: 21vh;
}
.videos div p {
  color: black;
}
</style>
