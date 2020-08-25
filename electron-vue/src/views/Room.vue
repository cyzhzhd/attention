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
    <div class="chat">
      <chat></chat>
    </div>
    <div class="user-list">
      <userList></userList>
    </div>
    <nav class="footer">
      <ul class="menu">
        <li
          class="menu-item"
          @click.prevent="controlModal('showingInviteModal')"
        >
          <a href="#" class="menu-link">Invite</a>
        </li>
        <li class="menu-item" @click.prevent>
          <a href="#" class="menu-link">Room Settings</a>
        </li>
      </ul>
    </nav>

    <inviteModal
      class="invite-modal"
      v-bind:showModal="modelList.showingInviteModal"
      v-on:closemodal="controlModal('showingInviteModal')"
    ></inviteModal>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import chat from '../components/Room/chat.vue';
import WebRTC from '../components/Room/webRTC.vue';
import userList from '../components/Room/userlist.vue';
import inviteModal from '../components/Room/inviteModal.vue';

export default {
  name: 'room',
  components: {
    chat,
    WebRTC,
    userList,
    inviteModal,
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
      totalUser: [],
      logInUserModal: {},
      modelList: {
        showingInviteModal: false,
      },
    };
  },
  methods: {
    enterRoom() {
      console.log('vue에서 roomId', this.roomId);
      this.EnterRoom({ roomName: this.roomname, roomId: this.roomId });
    },

    leaveRoom() {
      this.$router.go(-1);
      console.log('vue에서 roomId', this.roomId);
      this.LeaveRoom({ roomName: this.roomname, roomId: this.roomId });
    },
    controlModal(modelName) {
      this.modelList[modelName] = !this.modelList[modelName];
    },
    ...mapActions('webRTC', ['EnterRoom', 'LeaveRoom']),
  },
  created() {
    this.enterRoom();
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
