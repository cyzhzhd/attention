<template>
  <div class="container">
    <h3 class="text-center">
      {{ roomname }}
      <a @click="leaveRoom">(back)</a>
      <div>
        <span class>
          see videos with pop up
          <i
            class="fa fa-video-camera"
            aria-hidden="true"
            @click.prevent="startClass"
          ></i>
        </span>
      </div>
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
        <div class>
          online
          <div v-for="user in userList" v-bind:key="user">{{ user }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
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
      roomid: this.$route.params.roomid,
      roomname: this.$route.params.roomname,
      user: {
        email: 'email address',
        nickname: this.$route.params.nickname,
      },
      useVideo: false,
      data: { type: '', nickname: '', message: '' },
      // userList: [],
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

    // fetchUserList() {
    //   this.db.onSnapshot((querySnapshot) => {
    //     this.userList = querySnapshot.data().userOnline;
    //     console.log(querySnapshot.data().userOnline);
    //   });
    // },

    enterRoom() {
      this.db.update({
        userOnline: this.$firebase.firestore.FieldValue.arrayUnion(this.user),
      });
      this.EnterRoom(this.roomname);
    },

    leaveRoom() {
      this.$router.go(-1);
      this.db.update({
        userOnline: this.$firebase.firestore.FieldValue.arrayRemove(this.user),
      });
      this.LeaveRoom(this.roomname);
    },

    startClass() {
      window.ipcRenderer.send('startClass', this.$route.fullPath);
      console.log('video popup');
    },

    ...mapActions('webRTC', ['EnterRoom', 'LeaveRoom']),
  },

  created() {
    // this.fetchUserList();
    this.enterRoom();
  },
  computed: {
    ...mapState('webRTC', ['userList']),
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
