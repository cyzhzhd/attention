<template>
  <div class="wrapper">
    <main-header></main-header>
    <div class="classroom-list-contents">
      <!-- <crl-drop-down-box></crl-drop-down-box> -->
      <CRLDropDownBox></CRLDropDownBox>
      <section class="main-panel-contents">
        <ul class="contents-grid-wrapper">
          <li
            class="classroom-card"
            v-for="room in $store.state.classroom"
            :key="room._id"
          >
            <div class="classroom-card-header">
              <router-link
                class="classroom-card-title"
                :to="{
                  name: 'ClassRoom',
                  params: {
                    classroomId: room._id,
                  },
                }"
                action
              >
                <img
                  class="classroom-thumbnail"
                  src="../assets/img/ClassRoomList/charisse-kenion-ts-E3IVKv8o-unsplash.jpg"
                />
                <div class="classroom-info">
                  <div class="classroom-title">{{ room.name }}</div>
                  <div class="classroom-member-count">
                    총 {{ room.students.length }}명
                  </div>
                  <div
                    class="classroom-teacher-thumbnail"
                    img
                    src="teacher-thumbnail.svg"
                  ></div>
                  <div class="classroom-teacher-name">
                    {{ room.teacherName }}
                  </div>
                </div>
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
        <li v-if="$store.state.user.isTeacher">
          <a @click.prevent="manageClassRoom(child.data)">팀 관리</a>
        </li>
        <li v-if="$store.state.user.isTeacher">
          <a @click.prevent="deleteClassRoom(child.data)">팀 삭제</a>
        </li>
        <li v-else>
          <a @click.prevent="leaveTeam(child.data)">팀 나가기</a>
        </li>
      </template>
    </vue-context>
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
  </div>
</template>

<script>
import VueContext from 'vue-context';
import 'vue-context/src/sass/vue-context.scss';
import bus from '../../utils/bus';
import MainHeader from '../components/common/MainHeader.vue';
import CRLDropDownBox from '../components/ClassRoomList/CRLDropDownBox.vue';
import smallModal from '../components/common/smallModal.vue';

export default {
  name: 'roomList',
  components: {
    VueContext,
    smallModal,
    MainHeader,
    CRLDropDownBox,
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

    async leaveTeam(room) {
      console.log(room);
      const options = {
        class: room.classroomId,
      };
      await this.$store.dispatch('LEAVE_CLASSROOM', options);
      this.getClassRoomList();
    },

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
          class: joinedClass,
        };
        await this.$store.dispatch('FETCH_CLASS_ROOM_INFO', options);
      });
    },

    async getClassRoomList() {
      this.$store.state.classroom = [];
      await this.$store.dispatch('FETCH_USER_INFO');
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
  mounted() {
    bus.$on('ClassRoomList:addClassRoom', () => {
      this.getClassRoomList();
    });
  },
  beforeDestroy() {
    bus.$off('ClassRoomList:addClassRoom');
  },
};
</script>

<style scoped>
@import '../assets/css/ClassRoomList.css';
</style>
