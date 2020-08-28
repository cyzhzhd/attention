<template>
  <div class="modal-wrapper" v-on:click="closeModal">
    <Modal v-if="showModal" @close="showModal">
      <h3 slot="header" @click="showUserList">
        유저 목록 보기
        <i class="fa fa-users" aria-hidden="true"></i>
      </h3>

      <h4 slot="body">
        <li v-for="user in userlist" :key="user.uid">
          <a @click="chooseUser(user)">{{ user.userName }}</a>
        </li>
      </h4>
      <h4 slot="footer">
        팀을 나가려면 다른 유저에게 팀장을 양도해주세요.
        <i
          class="fa fa-times closeModalBtn fa-2x"
          aria-hidden="true"
          v-on:click="closeModal"
        ></i>
      </h4>
    </Modal>
  </div>
</template>

<script>
import Modal from '../common/Modal.vue';

export default {
  components: {
    Modal,
  },
  props: ['showModal', 'roomId'],
  data() {
    return {
      userlist: [],
    };
  },
  methods: {
    closeModal() {
      this.$emit('closemodal');
      this.userlist = [];
    },
    async chooseUser(chosenUser) {
      // 위임하기 모달 하나 더 추가
      this.$emit('closemodal');

      await this.leaveTeam();
      this.delegateHost(chosenUser);
    },
    delegateHost(chosenUser) {
      const options = {
        roomId: this.roomId,
        uid: chosenUser.uid,
        userName: chosenUser.userName,
      };
      this.$http.post('api/firebase/delegateHost', options);
    },
    leaveTeam() {
      const options = {
        roomId: this.roomId,
        uid: this.$user.uid,
      };
      this.$http.post('/api/firebase/leaveTeam', options);
    },
    showUserList() {
      this.$firebase
        .database()
        .ref(`/rooms/${this.roomId}/userlist`)
        .on('value', snapshot => {
          this.userlist = [];
          snapshot.forEach(doc => {
            const item = doc.val();
            this.userlist.push(item);
          });
        });
    },
  },
};
</script>

<style></style>
