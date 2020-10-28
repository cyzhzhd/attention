<template>
  <div class="wrapper">
    <side-navigation-panel>
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
    </side-navigation-panel>
    <div class="main-panel">
      <!-- <header class="main-panel-header">
        <div class="main-panel-header-title">수업 목록</div>
        <div class="main-panel-header-class-name">2학년 1반</div>
      </header> -->
      <div class="main-panel-contents">
        <div class="main-panel-class-list">
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
          <div class="class-list-header">
            <div class="class-list-header-item">수업</div>
            <div class="class-list-header-item">수업시간</div>
            <div class="class-list-header-item">선생님</div>
          </div>
          <section>
            <li v-for="classInfo in displayingClassList" :key="classInfo._id">
              <div class="class-item">
                <div class="class-item-header">
                  <div class="class-item-teacher-profile"></div>
                  <div class="class-item-header-item">{{ classInfo.name }}</div>
                  <div class="class-item-header-item">{{ classInfo.time }}</div>
                  <div class="class-item-header-item-teacher-name">
                    {{ classInfo.teacherName }} 선생님
                  </div>
                </div>
                <div v-if="classInfo.endTime">
                  <router-link
                    class="classroom-card-title"
                    :to="{
                      name: 'Dashboard',
                      params: {
                        classroomId,
                        classId: classInfo._id,
                      },
                    }"
                    action
                  >
                    <img
                      src="../assets/img/ClassRoom/test.png"
                      class="class-item-preview-finished"
                    />
                  </router-link>
                </div>
                <div v-else>
                  <router-link
                    class="classroom-card-title"
                    :to="{
                      name: 'Class',
                      params: {
                        classroomId: classroomId,
                        classId: classInfo._id,
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
              </div>
            </li>
          </section>
          <section v-if="noClass">
            위의 수업 만들기를 클릭해 수업을 만들 수 있답니다~
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
/* eslint no-param-reassign: "error" */
import SideNavigationPanel from '../components/common/SideNavigationPanel.vue';

export default {
  name: 'ClassRoom',
  components: {
    SideNavigationPanel,
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
        classInfo.time = `${date} ${time}`;
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
  },
  async mounted() {
    this.fetchClassList();
  },
};
</script>

<style scoped>
@import '../assets/css/ClassRoom.css';
</style>
