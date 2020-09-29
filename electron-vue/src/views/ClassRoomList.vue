<template>
  <div class="wrapper">
    <div class="side-navigation-panel">
      <div class="side-navigation-header">
        <img src="../assets/img/common/attention-logo.png" />
      </div>
      <div class="side-navigation-body">
        <router-link class="side-navigation-item" to="/">홈</router-link>
        <div class="side-navigation-item">교실 목록</div>
        <div class="side-navigation-item">수업 목록</div>
      </div>
      <div class="side-navigation-footer">
        <div class="current-user-profile"></div>
        <div class="current-user-name">이지은 선생님</div>
      </div>
    </div>
    <div class="main-panel">
      <header class="main-panel-header">
        <div class="main-panel-header-title">교실 목록</div>
        <div class="main-panel-header-icon">
          <img src="../assets/img/roomlist/blackboard.png" />
        </div>
      </header>
      <section class="main-panel-contents">
        <ul class="main-panel-classroom-list">
          <!-- <router-link
            class="create-classroom-title"
            :to="{ name: 'AddClassRoom' }"
            action
          > -->
          <div
            class="create-classroom-title create-classroom-card"
            @click="controlModal('addClassRoomModal')"
          >
            <div class="create-classroom-plus-icon">
              <img src="../assets/img/common/plus.png" />
            </div>
            교실 만들기
          </div>
          <!-- </router-link> -->
          <li class="classroom-card" v-for="room in rooms" :key="room.roomId">
            <div class="classroom-card-header">
              <router-link
                class="classroom-card-title"
                :to="{
                  name: 'ClassRoom',
                  params: {
                    classroomId: room.roomId,
                    classroomName: room.roomName,
                  },
                }"
                action
              >
                {{ room.roomName }}
                <img
                  class="classroom-card-background"
                  src="../assets/img/roomlist/charisse-kenion-ts-E3IVKv8o-unsplash.jpg"
                />
              </router-link>
              <div
                class="classroom-card-more-button"
                @click.prevent="
                  $refs.menu.open($event, {
                    classroomId: room.roomId,
                    classroomName: room.roomName,
                    host: room.host,
                  })
                "
                @click.stop
              >
                <img src="../assets/img/roomlist/threedot.png" />
              </div>
            </div>
          </li>
        </ul>
      </section>
    </div>
    <vue-context ref="menu">
      <template slot-scope="child">
        <li>
          <a @click.prevent="manageTeam(child.data)">팀 관리</a>
        </li>
        <li>
          <a @click.prevent="leaveTeam(child.data)">팀 나가기</a>
        </li>
        <li>
          <a @click.prevent="deleteTeam(child.data)">팀 삭제</a>
        </li>
      </template>
    </vue-context>
    <handoverModal
      v-bind:showModal="modalList.handOverModal"
      v-bind:roomId="roomId"
      v-on:closemodal="controlModal('handOverModal')"
    ></handoverModal>
    <div class="modal-wrapper" v-on:click="controlModal('confirmModal')">
      <small-modal
        v-if="modalList.confirmModal"
        @close="modalList.confirmModal"
      >
        <h3 slot="header">방을 삭제하려면 '확인'을 입력해주세요</h3>

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
            v-on:click="controlModal('confirmModal')"
          ></i>
        </h6>
      </small-modal>
    </div>
    <createClassRoomModal
      v-bind:showingModal="modalList.addClassRoomModal"
      v-on:closeModal="controlModal"
    ></createClassRoomModal>
  </div>
</template>

<script>
import VueContext from 'vue-context';
import 'vue-context/src/sass/vue-context.scss';
import handoverModal from '../components/RoomList/handoverModal.vue';
import createClassRoomModal from '../components/RoomList/createClassRoomModal.vue';
import smallModal from '../components/common/smallModal.vue';

export default {
  name: 'roomList',
  components: { VueContext, handoverModal, smallModal, createClassRoomModal },

  data() {
    return {
      uid: this.$user.uid,
      modalList: {
        handOverModal: false,
        confirmModal: false,
        addClassRoomModal: false,
      },
      rooms: [],
      roomId: '',
      textConfirm: '',
    };
  },

  methods: {
    manageTeam(room) {
      this.$router.push({
        name: 'ClassRoomSettings',
        params: { roomId: room.classroomId, roomName: room.classroomName },
      });
    },

    leaveTeam(room) {
      if (room.host === this.uid) {
        this.roomId = room.classroomId;
        this.modalList.handOverModal = true;
      } else {
        const options = {
          roomId: room.classroomId,
          uid: this.uid,
        };
        this.$http.post('/api/firebase/leaveTeam', options);
      }
    },

    deleteTeam(room) {
      if (room.host === this.uid) {
        this.modalList.confirmModal = true;
        this.roomId = room.classroomId;
      }
    },

    confirm() {
      if (this.textConfirm === '확인') {
        this.controlModal('confirmModal');

        const options = {
          roomId: this.roomId,
          uid: this.uid,
        };
        this.$http.post('/api/firebase/deleteTeam', options);
      }
    },
    controlModal(modelName) {
      this.modalList[modelName] = !this.modalList[modelName];

      if (this.modalList[modelName] && modelName === 'confirmModal') {
        this.modalList[modelName] = false;
        this.textConfirm = '';
      }
    },
  },

  created() {
    console.log('uid = ', this.uid);
    this.$firebase
      .database()
      .ref(`/users/${this.uid}/favRooms/`)
      .on('value', snapshot => {
        this.rooms = [];
        snapshot.forEach(doc => {
          const item = doc.val().roomDetail;
          item.roomId = doc.key;
          this.rooms.push(item);
        });
      });
  },
};
</script>

<style scoped>
@import '../assets/css/ClassRoomList.css';
</style>
