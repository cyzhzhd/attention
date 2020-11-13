<template>
  <div class="modal-wrapper" v-on:click="closeModal">
    <Modal :size="modalSize" v-if="groupModal" @close="groupModal">
      <h3 slot="header" class="header" ref="header">
        <div class="modal-title">그룹</div>
        <div class="closeModalBtn">
          <i class="fa fa-times" aria-hidden="true" v-on:click="closeModal"></i>
        </div>
      </h3>
      <h4 slot="body">
        <div class="group-list">
          <div class="group-body">
            <ul class="group-group-list">
              <li
                v-for="group in groupInfo"
                :key="group.name"
                class="group-group"
              >
                <div class="group-name">
                  {{ group.name }}
                  <div
                    class="delete-group-btn"
                    v-if="$store.state.user.isTeacher"
                  >
                    <i
                      class="fa fa-times"
                      aria-hidden="true"
                      v-on:click="deleteGroup(group.name)"
                    ></i>
                  </div>
                </div>
                <div class="group-userlist">
                  <li
                    v-for="user in group.userlist"
                    :key="user.id"
                    class="group-user"
                  >
                    {{ user.user }}
                  </li>
                </div>
                <div class="join-group-btn" @click="joinGroup(group.name)">
                  참가하기
                </div>
              </li>
            </ul>
          </div>
          <div class="group-footer">
            <div class="group-independent-list">
              <div>
                <div class="group-name">무소속</div>
                <li
                  v-for="user in independentGroup.userlist"
                  :key="user.id"
                  class="group-user"
                >
                  {{ user.user }}
                </li>
              </div>
              <div class="join-group-btn" @click="joinGroup('independent')">
                참가하기
              </div>
            </div>
            {{ errorMessage }}
            <div class="group-create-group" v-if="$store.state.user.isTeacher">
              <input
                type="text"
                v-model.trim="newGroupName"
                placeholder="그룹 이름을 입력하세요"
                @keyup.enter="createGroup()"
                class="group-create-group-input"
              />
              <div
                class="group-create-group-btn"
                role="button"
                @click="createGroup()"
                :disabled="newGroupName"
              >
                그룹생성하기
              </div>
            </div>
          </div>
        </div>
      </h4>
      <h4 slot="footer"></h4>
    </Modal>
  </div>
</template>

<script>
/* eslint no-underscore-dangle: 0 */
import { mapGetters, mapActions } from 'vuex';
import Modal from '../../common/Modal.vue';

export default {
  name: 'main-settings',
  components: {
    Modal,
  },
  computed: {
    groupModal() {
      return this.$store.state.modal.modalList.showingGroupModal;
    },
    ...mapGetters('webRTC', ['groupInfo', 'independentGroup']),
  },
  data() {
    return {
      classId: this.$route.params.classId,
      newGroupName: '',
      errorMessage: '',
      modalSize: {
        width: '80vw',
        height: '90vh',
      },
    };
  },
  methods: {
    closeModal() {
      this.$store.dispatch('modal/ControlModal', 'showingGroupModal');
    },
    createGroup() {
      if (!this.newGroupName) {
        return;
      }
      if (
        this.groupInfo.filter((group) => group.name === this.newGroupName)
          .length ||
        this.newGroupName === 'independent'
      ) {
        this.errorMessage = '동명의 그룹이 존재합니다.';
      } else {
        const options = {
          type: 'createParty',
          content: this.newGroupName,
        };
        this.SendSignal(options);
        this.newGroupName = '';
        this.errorMessage = '';
      }
    },
    deleteGroup(groupName) {
      const options = {
        type: 'removeParty',
        content: groupName,
      };
      this.SendSignal(options);
      // send delete request to server
    },
    joinGroup(groupName) {
      const options = {
        type: 'joinParty',
        content: groupName,
      };
      this.SendSignal(options);
    },

    ...mapActions('webRTC', ['SendSignal']),
  },
};
</script>

<style>
.header {
  display: flex;
  cursor: move;
  color: #9097fd;
  font-family: 'GmarketSansBold';
  font-size: 20px;
  letter-spacing: -1px;

  background-color: #f6f7fb;
  height: 50px;
  padding: 0px 30px;
}
.modal-title {
  flex: 1;
  text-align: left;
}

.closeModalBtn {
  cursor: pointer;
}
.group-list {
  display: grid;
  height: 75vh;
  grid-template-columns: 1fr 200px;
  grid-template-areas: 'body footer';
}
.group-body {
  grid-area: 'body';
}
.group-footer {
  grid-area: 'footer';
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.group-group-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
}
.group-group {
  flex: 0 1 22%;
  border: 1px solid #9097fd;
  align-items: center;
  margin: 0 1rem 1rem;
}
.group-name {
  display: flex;
  justify-content: center;
  color: blueviolet;
  font-size: 1.2rem;
}
.delete-group-btn {
  position: absolute;
  cursor: pointer;
  margin-left: 10vw;
}
.group-userlist {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  overflow-y: auto;
  height: 20vh;
}
.group-independent-list {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: 1px solid #9097fd;
  height: 65vh;
  overflow-y: auto;
}
.create-group-btn {
  color: #9097fd;
  border: 1px solid #9097fd;
  height: 30px;
  cursor: pointer;
}
.join-group-btn {
  color: #9097fd;
  height: 30px;
  cursor: pointer;
}
.group-create-group {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  border: 1px solid #9097fd;
  height: 60px;
}
.group-create-group-btn {
  flex: 0 1 auto;
  width: 120px;
  color: white;
  border-radius: 1rem;
  background: #9097fd;
  cursor: pointer;
}
</style>
