<template>
  <div class="modal">
    <div class="modal-wrapper" v-on:click="closeModal">
      <mediumModal v-if="showModal" @close="showModal">
        <h3 slot="header" @click="showUserList">
          유저 목록 보기
          <i class="fa fa-users" aria-hidden="true"></i>
        </h3>

        <h4 slot="body">
          <li v-for="user in userlist" :key="user.uid">
            <div v-if="userlist.length === 1">
              팀에 혼자 남아 있습니다. 팀을 나가려면 팀 삭제를 눌러주세요.
            </div>
            <div v-else>
              <a v-if="user.uid !== $user.uid" @click="chooseUser(user)">{{
                user.userName
              }}</a>
            </div>
          </li>
        </h4>
        <h6 slot="footer">
          팀을 나가려면 다른 유저에게 팀장을 양도해주세요.
          <i
            class="fa fa-times closeModalBtn fa-2x"
            aria-hidden="true"
            v-on:click="closeModal"
          ></i>
        </h6>
      </mediumModal>
    </div>
    <div class="modal-wrapper" v-on:click="closeModal">
      <smallModal v-if="showingConfirmModal" @close="showingConfirmModal">
        <h3 slot="header">
          팀장을 양도하려면 '확인'을 입력해주세요
        </h3>

        <h4 slot="body">
          <form v-on:submit.prevent="confirm">
            <input type="text" v-model.trim="textConfirm" placeholder="확인" />
            <button type="submit" variant="primary" :disabled="!confirm">
              확인
            </button>
          </form>
        </h4>
        <h6 slot="footer">
          이 행동은 되돌릴 수 없습니다.
          <i
            class="fa fa-times closeModalBtn fa-2x"
            aria-hidden="true"
            v-on:click="closeConfirmModal"
          ></i>
        </h6>
      </smallModal>
    </div>
  </div>
</template>

<script>
import mediumModal from '../common/mediumModal.vue';
import smallModal from '../common/smallModal.vue';

export default {
  components: {
    mediumModal,
    smallModal,
  },
  props: ['showModal', 'roomId'],
  data() {
    return {
      userlist: [],
      chosenUser: '',
      textConfirm: '',
      showingConfirmModal: false,
    };
  },
  methods: {
    closeModal() {
      this.$emit('closemodal');
      this.userlist = [];
      this.showingConfirmModal = false;
      this.textConfirm = '';
    },
    closeConfirmModal() {
      this.showingConfirmModal = false;
      this.textConfirm = '';
    },
    chooseUser(chosenUser) {
      this.chosenUser = chosenUser;
      this.showingConfirmModal = !this.showingConfirmModal;
    },

    async confirm() {
      if (this.textConfirm === '확인') {
        this.$emit('closemodal');
        this.closeConfirmModal();

        await this.leaveTeam();
        this.delegateHost();
      } else {
        console.log('try it again');
      }
    },

    delegateHost() {
      const options = {
        roomId: this.roomId,
        uid: this.chosenUser.uid,
        userName: this.chosenUser.userName,
      };
      this.$http.post(
        'https://be.swm183.com:3000/firebase/delegateHost',
        options,
      );
    },
    leaveTeam() {
      const options = {
        roomId: this.roomId,
        uid: this.$user.uid,
      };
      this.$http.post('https://be.swm183.com:3000/firebase/leaveTeam', options);
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
