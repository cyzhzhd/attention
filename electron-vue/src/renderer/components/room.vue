<template>
  <div class="container">
    <h3 class="text-center">
      {{roomname}}
      <a @click="leaveRoom">(back)</a>

      <span class>
        <br />see videos
        <i class="fa fa-video-camera" aria-hidden="true" @click.prevent="showVideo"></i>
      </span>
    </h3>
    <div class="messaging">
      <div class="inbox_msg">
        <div class="mesgs">
          <chat v-if="!useVideo"></chat>
          <videoElements v-if="useVideo"></videoElements>
        </div>
        <div class>
          online
          <div v-for="user in userList" v-bind:key="user.email">{{user.nickname}}</div>
        </div>
      </div>

      <div>
        <span class>
          see videos with pop up
          <i
            class="fa fa-video-camera"
            aria-hidden="true"
            @click.prevent="popUpVideo"
          ></i>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import chat from './room/chat.vue';
import videoElements from './room/webRTC.vue';

export default {
  name: 'room',
  components: {
    chat,
    videoElements,
  },
  data() {
    return {
      roomid: this.$route.params.roomid,
      roomname: this.$route.params.roomname,
      user: {
        email: 'email address',
        nickname: this.$route.params.nickname,
      },
      useVideo: false,
      data: { type: '', nickname: '', message: '' },
      userList: [],
      db: this.$firebase
        .firestore()
        .collection('rooms')
        .doc(this.$route.params.roomid),
    };
  },
  methods: {
    showVideo() {
      this.useVideo = !this.useVideo;
    },
    popUpVideo() {
      // this.$emit('popUpVideo', this.$route.fullPath);
      this.$electron.ipcRenderer.send('popUpVideo', this.$route.fullPath);
      console.log('video popup');
    },

    fetchUserList() {
      this.db.onSnapshot((querySnapshot) => {
        this.userList = querySnapshot.data().userOnline;
        console.log(querySnapshot.data().userOnline);
      });
    },

    enterRoom() {
      this.db.update({
        userOnline: this.$firebase.firestore.FieldValue.arrayUnion(this.user),
      });
    },

    leaveRoom() {
      this.$router.go(-1);
      this.db.update({
        userOnline: this.$firebase.firestore.FieldValue.arrayRemove(this.user),
      });
    },

    // 함수형 프로그래밍으로 중복을 제거할 방법?
    updateLogIn() {
      this.$router.go(-1);
      this.db.update({
        userOnline: this.$firebase.firestore.FieldValue.arrayRemove(this.user),
      });
    },
  },

  created() {
    this.fetchUserList();
    this.enterRoom();
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
