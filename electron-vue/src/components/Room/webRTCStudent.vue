<template>
  <div class="webRTC">
    <div class="teacher" ref="teacherVideo"></div>
    <div ref="videos" class="videos">
      <div class="localVideo-div">
        <canvas id="fcanvas" width="240" height="180"></canvas>
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
  height: 100vh;
  display: grid;
  grid-template-columns: 80% 20%;
  grid-template-areas: 'teacher videos';
}
.teacher {
  grid-area: 'teacher';
  height: 100%;
  /* display: flex; */
  /* align-items: center; */
  align-self: center;
  background-image: url('../../assets/img/room/temp.png');
  /* border: 1px solid gray; */
}
.teacher video {
  width: 100%;
  max-height: 76vh;
  object-fit: cover;
}
.videos {
  grid-area: 'videos';
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-top: 15px;
}
.videos #fcanvas {
  position: absolute;
  z-index: 2;
  max-height: 21vh;
}
.videos div p {
  position: absolute;
  color: white;
  background-color: gray;
}

.localVideo-div {
  display: flex;
}
.localVideo {
  transform: rotateY(180deg);
  -webkit-transform: rotateY(180deg);
}
</style>
