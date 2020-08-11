<template>
  <div class="container">
    <h3 class="text-center">
      {{ roomname }}
      <a @click="$router.go(-1)">(back)</a>
      <span class>
        <br />see videos
        <i
          class="fa fa-video-camera"
          aria-hidden="true"
          @click.prevent="showVideo"
        ></i>
      </span>
    </h3>
    <div class="messaging">
      <div class="inbox_msg">
        <div class="mesgs">
          <chat v-if="!useVideo"></chat>
          <WebRTC v-if="useVideo"></WebRTC>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import chat from '../components/Room/chat.vue';
import WebRTC from '../components/Room/webRTC.vue';

export default {
  name: 'room',
  components: {
    chat,
    WebRTC,
  },
  data() {
    return {
      roomId: this.$route.params.roomId,
      roomname: this.$route.params.roomname,
      user: {
        email: 'email address',
        nickname: this.$route.params.nickname,
      },
      useVideo: false,
    };
  },
  methods: {
    showVideo() {
      this.useVideo = !this.useVideo;
    },
  },
};
</script>

<style scoped="">
.container {
  max-width: 1170px;
  margin: auto;
}
img {
  max-width: 100%;
}
.inbox_msg {
  border: 1px solid #c4c4c4;
  clear: both;
  overflow: hidden;
}

.recent_heading h4 {
  color: #05728f;
  font-size: 21px;
  margin: auto;
}
.mesgs {
  float: left;
  padding: 30px 15px 0 25px;
  width: 60%;
}
</style>
