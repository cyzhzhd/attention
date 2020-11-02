<template>
  <div class="wrapper">
    <main-header></main-header>
    <div class="class-room-list-student-contents">
      <div class="main-wrapper">
        <div class="classroom-info-list">
          <div class="classroom-info-box">
            <div class="classroom-info-box-title">공지사항</div>
            <div class="classroom-info-box-contents"></div>
          </div>
          <div class="classroom-info-box">
            <div class="classroom-info-box-title">학사일정</div>
            <div class="classroom-info-box-contents"></div>
          </div>
        </div>

        <div class="current-classroom-wrapper">
          <div class="current-classroom-thumbnail"></div>
          <div class="enter-current-classroom-section">
            <img
              src="../assets/img/ClassRoomList/arrow01.svg"
              class="enter-current-classroom-section-img-left"
            />
            <div class="enter-current-classroom-button">교실로 입장</div>
            <img
              src="../assets/img/ClassRoomList/arrow02.svg"
              class="enter-current-classroom-section-img-left"
            />
          </div>

          <div class="enter-new-classroom-form">
            <div class="enter-new-classroom-form-title">교실 추가하기</div>
            <div class="enter-new-classroom-form-input-wrapper">
              <input
                class="enter-new-classroom-form-input"
                type="text"
                placeholder="인증코드"
              />
              <label class="enter-new-classroom-form-submit-button">확인</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import MainHeader from '../components/common/MainHeader.vue';

export default {
  name: 'classroomlist-student',
  components: {
    MainHeader,
  },
};
</script>

<style scoped>
@import '../assets/css/ClassRoomListStudent.css';
</style>
