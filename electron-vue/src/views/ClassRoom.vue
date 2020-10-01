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
          <router-link :to="{ name: 'AddClass' }" action>
            <div class="create-class-item">
              <div class="create-classroom-plus-icon">
                <img src="../assets/img/common/plus.png" />
              </div>
              <div class="create-classroom-title">수업 만들기</div>
            </div>
          </router-link>
          <!-- <div class="create-class-item">
            <div class="create-classroom-plus-icon">
              <img src="../assets/img/common/plus.png" />
            </div>
            <div class="create-classroom-title">수업 만들기</div>
          </div> -->
          <div class="class-list-header">
            <div class="class-list-header-item">수업시간</div>
            <div class="class-list-header-item">과목</div>
            <div class="class-list-header-item">선생님</div>
          </div>

          <div class="class-item">
            <div class="class-item-header">
              <div class="class-item-teacher-profile"></div>
              <div class="class-item-header-item">9:00</div>
              <div class="class-item-header-item">국어</div>
              <div class="class-item-header-item-teacher-name">
                이지은 선생님
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

            <div class="class-item-class-start-button" role="button">
              강의 시작
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SideNavigationPanel from '../components/common/SideNavigationPanel.vue';

export default {
  components: {
    SideNavigationPanel,
  },
  data() {
    return {
      classroomId: this.$route.params.classroomId,
      classRoomName: this.$route.params.classRoomName,
      classId: 'asdasd',
    };
  },
  methods: {
    // async getClassList() {
    //   console.log('jwt = ', this.$jwt);
    //   const options = {
    //     headers: {
    //       Authorization: `Bearer ${this.$jwt}`,
    //     },
    //   };
    //   const userInfo = await this.$http.get('/api/user', options);
    //   const { ownClasses } = userInfo.data;
    //   this.classRooms = [];
    //   ownClasses.forEach(async ownClass => {
    //     options.params = {
    //       class: ownClass,
    //     };
    //     const classInfo = await this.$http.get('/api/class', options);
    //     this.classRooms.push(classInfo.data);
    //   });
    //   console.log('room = ', this.classRooms);
    // },
  },
};
</script>

<style scoped>
@import '../assets/css/ClassRoom.css';
</style>
