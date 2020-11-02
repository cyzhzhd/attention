<template>
  <div class="wrapper">
    <div slot="section">
      <router-link class="side-navigation-item" to="/">홈</router-link>
      <router-link class="side-navigation-item" to="/ClassRoomList"
        >교실 목록</router-link
      >
      <router-link
        class="side-navigation-item"
        :to="{ name: 'Dashboard', params: { classroomId, classId: 'all' } }"
      >
        대시 보드
      </router-link>
    </div>
    <router-link
      v-if="$store.state.user.isTeacher"
      :to="{
        name: 'AddClass',
        params: {
          classroomId,
        },
      }"
      action
    >
      <div class="create-class-item">
        <div class="create-classroom-plus-icon">
          <img src="../assets/img/common/plus.png" />
        </div>
        <div class="create-classroom-title">수업 만들기</div>
      </div>
    </router-link>
    <main-header></main-header>

    <div class="classroom-contents">
      <div class="class-list">
        <div class="time-line">
          <div class="time-line-header">TimeLine</div>
          <div class="time-line-divider"></div>
        </div>
        <ul class="class-card-list">
          <li
            class="class-card"
            v-for="classInfo in displayingClassList"
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
/* eslint no-param-reassign: "error" */
import MainHeader from '../components/common/MainHeader.vue';

export default {
  name: 'ClassRoom',
  components: {
    MainHeader,
  },
  data() {
    return {
      classroomId: this.$route.params.classroomId,
      classList: [],
      noClass: false,
      displayingClassList: [],
    };
  },
  methods: {
    async fetchClassList() {
      const options = {
        class: this.classroomId,
      };
      this.classList = await this.$store.dispatch('FETCH_CLASSLIST', options);
      if (this.classList.length === 0) {
        this.noClass = true;
        return;
      }
      this.classList.reverse().forEach((classInfo) => {
        const { date, time } = this.getTime(classInfo.scheduledStartTime);
        classInfo.time = `${date} \n ${time}`;
      });
      this.displayingClassList = this.classList.slice(0, 4);
    },

    getTime(day) {
      const dates = day.split('-');
      const date = `${dates[1]}/${dates[2].slice(0, 2)}`;
      const times = dates[2].slice(3).split(':');
      const time = `${times[0]}:${times[1]}`;
      return { date, time };
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
  },
  async mounted() {
    this.fetchClassList();
  },
};
</script>

<style scoped>
@import '../assets/css/ClassRoom.css';
</style>
