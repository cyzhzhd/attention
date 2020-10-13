<template>
  <div class="wrapper">
    <side-navigation-panel>
      <div slot="section">
        <router-link class="side-navigation-item" to="/">홈</router-link>
      </div>
    </side-navigation-panel>
    <div class="main-panel">
      <header class="main-panel-header">
        <div class="main-panel-header-title">교실 목록</div>
        <div class="main-panel-header-icon">
          <img src="../assets/img/ClassRoomList/blackboard.png" />
        </div>
      </header>
      <section class="main-panel-contents">
        <ul class="main-panel-classroom-list">
          <router-link
            class="create-classroom-title"
            :to="{ name: 'AddClassRoom' }"
            action
          >
            <div class="create-classroom-card">
              <div class="create-classroom-plus-icon">
                <img src="../assets/img/common/plus.png" />
              </div>
              <p v-if="$store.state.user.isTeacher">
                교실 만들기
              </p>
              <p v-else>
                교실 추가하기
              </p>
            </div>
          </router-link>

          <li class="classroom-card" v-for="room in $store.state.classroom" :key="room._id">
            <div class="classroom-card-header">
              <router-link
                class="classroom-card-title"
                :to="{
                  name: 'ClassRoom',
                  params: {
                    classroomId: room._id,
                    classroomName: room.name,
                    classId: room.session,
                    teacher: room.teacher,
                  },
                }"
                action
              >
                {{ room.name }}
                <img
                  class="classroom-card-background"
                  src="../assets/img/ClassRoomList/charisse-kenion-ts-E3IVKv8o-unsplash.jpg"
                />
              </router-link>
              <div
                class="classroom-card-more-button"
                @click.prevent="
                  $refs.menu.open($event, {
                    classroomId: room._id,
                    classroomName: room.name,
                    host: room.teacherName,
                  })
                "
                @click.stop
              >
                <img src="../assets/img/common/threedot.png" />
              </div>
            </div>
          </li>
        </ul>
      </section>
    </div>
    <vue-context ref="menu">
      <template slot-scope="child">
        <li>
          <a @click.prevent="manageClassRoom(child.data)">팀 관리</a>
        </li>
        <li>
          <a @click.prevent="leaveTeam(child.data)">팀 나가기</a>
        </li>
        <li>
          <a @click.prevent="deleteClassRoom(child.data)">팀 삭제</a>
        </li>
      </template>
    </vue-context>
    <handoverModal
      v-bind:showModal="modalList.handOverModal"
      v-bind:classRoomId="classRoomId"
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
import SideNavigationPanel from '../components/common/SideNavigationPanel.vue';
import handoverModal from '../components/ClassRoomList/handoverModal.vue';
import createClassRoomModal from '../components/ClassRoomList/createClassRoomModal.vue';
import smallModal from '../components/common/smallModal.vue';

export default {
  name: 'roomList',
  components: {
    VueContext,
    handoverModal,
    smallModal,
    createClassRoomModal,
    SideNavigationPanel,
  },

  data() {
    return {
      modalList: {
        handOverModal: false,
        confirmModal: false,
        addClassRoomModal: false,
      },
      classRoomId: '',
      textConfirm: '',
    };
  },

  methods: {
    manageClassRoom(room) {
      this.$router.push({
        name: 'ClassRoomSettings',
        params: { classRoomId: room.classroomId, roomName: room.classroomName },
      });
    },

    //   leaveTeam(room) {
    //     if (room.host === this.uid) {
    //       this.classRoomId = room.classroomId;
    //       this.modalList.handOverModal = true;
    //     } else {
    //       const options = {
    //         classRoomId: room.classroomId,
    //         uid: this.uid,
    //       };
    //       this.$http.post('https://be.swm183.com:3000/firebase/leaveTeam', options);
    //     }
    //   },

    deleteClassRoom(room) {
      this.modalList.confirmModal = true;
      this.classRoomId = room.classroomId;
    },

    async confirm() {
      if (this.textConfirm === '확인') {
        this.controlModal('confirmModal');
        const options = {
            class: this.classRoomId,
        };
        await this.$store.dispatch('DELETE_CLASSROOM', options);
        this.getClassRoomList();
      }
    },

    controlModal(modelName) {
      this.modalList[modelName] = !this.modalList[modelName];

      if (this.modalList[modelName] && modelName === 'confirmModal') {
        this.modalList[modelName] = false;
        this.textConfirm = '';
      }
    },

    addListOnClassRoom(classList) {
      classList.forEach(async joinedClass => {
        const options = {
            class:joinedClass,
        }
        await this.$store.dispatch('FETCH_CLASS_ROOM_INFO', options);
      });
    },

    async getClassRoomList() {
      this.$store.state.classroom = [];
      await this.$store.dispatch("FETCH_USER_INFO");
      const { ownClasses } = this.$store.state.user;
      this.addListOnClassRoom(ownClasses);

      const { classes } = this.$store.state.user;
      this.addListOnClassRoom(classes);
      console.log(this.$store.state.classroom);
    },
  },

  created() {
    console.log('object');
    this.getClassRoomList();
  },
};
</script>

<style scoped>
@import '../assets/css/ClassRoomList.css';
</style>
