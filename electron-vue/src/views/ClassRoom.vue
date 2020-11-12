<template>
  <div class="wrapper">
    <main-header>
      <div slot="router">
        <div class="router">
          <router-link class="router-item" to="/ClassRoomList">
            교실 목록
          </router-link>
          <router-link
            class="router-item"
            :to="{ name: 'Dashboard', params: { classroomId, classId: 'all' } }"
          >
            대시 보드
          </router-link>
        </div>
      </div>
    </main-header>
    <div class="classroom-contents">
      <CRDropDownBox></CRDropDownBox>
      <div class="class-list">
        <div class="time-line">
          <div class="time-line-header">
            <div>TIMELINE</div>
            <div class="time-line-divider"></div>
          </div>
          <div
            class="classroom-class-invite"
            @click.prevent="controlModal('showingInviteModal')"
          >
            초대코드
          </div>

          <div
            class="modal-wrapper"
            v-on:click="controlModal('showingInviteModal')"
          >
            <Modal
              :size="modalSize"
              v-if="modalList.showingInviteModal"
              @close="modalList.showingInviteModal"
            >
              <h3 class="thisiscode" slot="header">교실 초대 코드</h3>
              <h4 class="codebody" slot="body">
                {{ this.$route.params.classroomId }}
              </h4>
              <h4 slot="footer">
                <i
                  class="fa fa-times closeModalBtn fa-2x"
                  aria-hidden="true"
                  v-on:click="controlModal('showingInviteModal')"
                ></i>
              </h4>
            </Modal>
          </div>
        </div>
        <ul class="class-card-list">
          <li
            class="class-card"
            v-for="classInfo in $store.state.classList"
            :key="classInfo._id"
          >
            <div class="class-card-left">
              <div class="class-card-duration-time">{{ classInfo.time }}</div>
            </div>
            <div class="class-card-center">
              <div class="class-card-header">
                <div class="class-card-classroom">{{ classInfo.name }}</div>
                <div class="class-card-subject">
                  {{ classInfo.teacherName }} 선생님
                </div>
              </div>
              <div class="class-card-thumbnail"></div>
            </div>
            <div class="class-card-right">
              <div
                v-if="classInfo.endTime"
                class="class-card-enter-button"
                @click="enterDashboard(classInfo._id)"
              >
                대시보드
              </div>
              <div
                v-else
                class="class-card-enter-button"
                @click="enterClass(classInfo._id)"
              >
                입장
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import bus from '../../utils/bus';
import MainHeader from '../components/common/MainHeader.vue';
import CRDropDownBox from '../components/ClassRoom/CRDropDownBox.vue';
import Modal from '../components/common/Modal.vue';

export default {
  name: 'ClassRoom',
  components: {
    MainHeader,
    CRDropDownBox,
    Modal,
  },
  data() {
    return {
      classroomId: this.$route.params.classroomId,
      classroomName: this.$route.params.classroomName,
      classList: this.$store.state.classList,
      modalList: {
        showingInviteModal: false,
      },
      modalSize: {
        width: '300px',
      },
    };
  },
  methods: {
    controlModal(modelName) {
      this.modalList[modelName] = !this.modalList[modelName];
    },
    async callFetchClassList() {
      const options = {
        class: this.classroomId,
      };
      await this.$store.dispatch('FETCH_CLASSLIST', options);
    },
    enterClass(classId) {
      this.$router.push({
        name: 'Class',
        params: {
          classroomId: this.classroomId,
          classId,
        },
      });
    },
    enterDashboard(classId) {
      this.$router.push({
        name: 'Dashboard',
        params: {
          classroomId: this.classroomId,
          classId,
        },
      });
    },
  },
  created() {
    this.callFetchClassList();
    bus.$on('ClassRoom:addClass', () => {
      this.callFetchClassList();
    });
  },
  beforeDestroy() {
    bus.$off('ClassRoom:addClass');
  },
};
</script>

<style scoped>
@import '../assets/css/ClassRoom.css';
</style>
