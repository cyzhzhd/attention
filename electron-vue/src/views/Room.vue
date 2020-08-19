<template>
  <div class="container">
    <header class="header">
      <h3 class="text-center">
        {{ roomname }}
        <a @click="leaveRoom">(back)</a>
      </h3>
    </header>
    <div class="webRTC">
      <WebRTC></WebRTC>
    </div>
    <div class="char">
      <chat></chat>
    </div>
    <div class="user-list">
      Online
      <ul>
        <li v-for="user in logInUser" v-bind:key="user.uid">
          {{ user.userName }}
        </li>
      </ul>
    </div>
    <nav class="footer">
      <ul class="menu">
        <li class="menu-item" @click.prevent="showRoomId">
          <a href="#" class="menu-link">Invite</a>
        </li>
        <li class="menu-item" @click.prevent>
          <a href="#" class="menu-link">Room Settings</a>
        </li>
      </ul>
    </nav>
    <Modal v-if="showModal" @close="showModal">
      <h3 slot="header">Copy this roomId and give it to your student</h3>

      <h4 slot="body">{{ roomId }}</h4>
      <h4 slot="footer">
        <i
          class="fa fa-times closeModalBtn fa-2x"
          aria-hidden="true"
          @click="showModal = false"
        ></i>
      </h4>
    </Modal>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import chat from '../components/Room/chat.vue';
import WebRTC from '../components/Room/webRTC.vue';
import Modal from '../components/common/Modal.vue';

export default {
  name: 'room',
  components: {
    chat,
    WebRTC,
    Modal,
  },
  data() {
    return {
      roomId: this.$route.params.roomId,
      roomname: this.$route.params.roomname,
      user: {
        email: this.$user.email,
        uid: this.$user.uid,
        displayName: this.$user.displayName,
      },
      logInUser: [],
      logOutUser: [],
      useVideo: false,
      showModal: false,
    };
  },
  methods: {
    showVideo() {
      this.useVideo = !this.useVideo;
    },
    enterRoom() {
      this.EnterRoom(this.roomname);
    },

    leaveRoom() {
      this.$router.go(-1);
      this.LeaveRoom(this.roomname);
    },
    showRoomId() {
      this.showModal = !this.showModal;
    },

    ...mapActions('webRTC', ['EnterRoom', 'LeaveRoom']),
  },

  created() {
    this.enterRoom();

    this.$firebase
      .database()
      .ref(`/rooms/${this.roomId}/userlist`)
      .on('value', snapshot => {
        const userlist = [];
        snapshot.forEach(doc => {
          userlist.push(doc.val());
        });
        this.logInUser = userlist;
      });
  },
};
</script>

<style>
.container {
  display: grid;
  height: 100vh;
  grid-template-columns: 1fr 20% 10%;
  grid-template-rows: 10% 1fr 65px;
  grid-template-areas:
    'header header header'
    'webRTC chat userlist'
    'footer footer footer';
}
.header {
  grid-area: header;
  padding: 15px;
}
.webRTC {
  grid-area: webRTC;
}
.chat {
  grid-area: chat;
}
.user-list {
  grid-area: userlist;
  height: 516px;
  overflow-y: auto;
}
.footer {
  grid-area: footer;
}
</style>
