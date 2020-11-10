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
          <div class="time-line-header">TIMELINE</div>
          <div class="time-line-divider"></div>
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

export default {
  name: 'ClassRoom',
  components: {
    MainHeader,
    CRDropDownBox,
  },
  data() {
    return {
      classroomId: this.$route.params.classroomId,
      classList: [],
    };
  },
  methods: {
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
