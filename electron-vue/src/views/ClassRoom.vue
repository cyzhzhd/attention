<template>
  <div class="wrapper">
    <side-navigation-panel></side-navigation-panel>
    <div class="main-panel">
      <header class="main-panel-header">
        <div class="main-panel-header-title">수업 목록</div>
        <div class="main-panel-header-class-name">2학년 1반</div>
      </header>
      <div class="main-panel-contents">
        <div class="main-panel-class-list">
          <router-link
            v-if="this.$user._id === teacher"
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
          <div class="class-list-header">
            <div class="class-list-header-item">수업</div>
            <div class="class-list-header-item">수업시간</div>
            <div class="class-list-header-item">선생님</div>
          </div>

          <section class="class-ready" v-if="isClassReady">
            <div class="class-item">
              <div class="class-item-header">
                <div class="class-item-teacher-profile"></div>
                <div class="class-item-header-item">{{ className }}</div>
                <div class="class-item-header-item">{{ startDate }}</div>
                <div class="class-item-header-item">
                  {{ startTime }} ~ {{ endTime }}
                </div>
                <div class="class-item-header-item-teacher-name">
                  {{ classInfo.teacherName }} 선생님
                </div>
              </div>
              <router-link
                class="classroom-card-title"
                :to="{
                  name: 'Class',
                  params: {
                    classroomId: classroomId,
                    classId: classId,
                  },
                }"
                action
              >
                <img
                  src="../assets/img/ClassRoom/test.png"
                  class="class-item-preview"
                />
              </router-link>
            </div>
          </section>
          <section v-else>
            class not ready
          </section>
          <div class="class-item-class-start-button" role="button">
            강의 시작
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SideNavigationPanel from '../components/common/SideNavigationPanel.vue';

export default {
  name: 'ClassRoom',
  components: {
    SideNavigationPanel,
  },
  data() {
    return {
      classroomId: this.$route.params.classroomId,
      classroomName: this.$route.params.classroomName,
      classId: this.$route.params.classId,
      teacher: this.$route.params.teacher,
      classInfo: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      className: '',
      isClassReady: true,
    };
  },
  methods: {
    async getClassList() {
      console.log('jwt = ', this.$jwt);
      const options = {
        headers: {
          Authorization: `Bearer ${this.$jwt}`,
        },
        params: {
          class: this.classroomId,
          session: this.classId,
        },
      };
      const info = await this.$http.get(
        'https://be.swm183.com:3000/session',
        options,
      );
      this.classInfo = info.data;
      console.log(this.classInfo);
      this.className = info.data.name;
      const startDate = this.getTime(info.data.scheduledStartTime);
      this.startDate = startDate.date;
      this.startTime = startDate.time;

      const endDate = this.getTime(info.data.scheduledEndTime);
      this.endDate = endDate.date;
      this.endTime = endDate.time;
    },

    getTime(day) {
      console.log(day);
      const dates = day.split('-');
      const date = `${dates[1]}월 ${dates[2].slice(0, 2)}일`;
      const times = dates[2].slice(3).split(':');
      const time = `${times[0]}시 ${times[1]}분`;
      return { date, time };
    },
  },
  mounted() {
    if (this.classId === 'notReady') {
      this.isClassReady = false;
    } else {
      this.getClassList();
    }
  },
};
</script>

<style scoped>
@import '../assets/css/ClassRoom.css';
</style>
