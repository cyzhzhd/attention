<template>
  <div class="wrapper">
    <div class="side-navigation-panel">
      <div class="side-navigation-header">
        <img src="../assets/img/common/attention-logo.png" />
      </div>
      <div class="side-navigation-body">
        <div class="side-navigation-item">홈</div>
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
        <div class="main-panel-header-title">수업 목록</div>
        <div class="main-panel-header-class-name">
          2학년 1반
        </div>
      </header>
      <div class="main-panel-contents">
        <div class="main-panel-class-list">
          <div class="create-class-item">
            <div class="create-classroom-plus-icon">
              <img src="../assets/img/common/plus.png" />
            </div>
            <div class="create-classroom-title">수업 만들기</div>
          </div>
          <div class="class-list-header">
            <div class="class-list-header-item">
              수업시간
            </div>
            <div class="class-list-header-item">
              과목
            </div>
            <div class="class-list-header-item">
              선생님
            </div>
          </div>

          <div class="class-item">
            <div class="class-item-header">
              <div class="class-item-teacher-profile"></div>
              <div class="class-item-header-item">
                9:00
              </div>
              <div class="class-item-header-item">
                국어
              </div>
              <div class="class-item-header-item-teacher-name">
                이지은 선생님
              </div>
            </div>
            <img
              src="../assets/img/ClassRoom/test.png"
              class="class-item-preview"
            />
            <div class="class-item-class-start-button" role="button">
              강의 시작
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="secondary-view-panel">
      <div class="secondary-view-panel-box-wrapper">
        <div class="secondary-view-panel-box-title">공지사항</div>
        <div class="secondary-view-panel-box-contents"></div>
      </div>
      <div class="secondary-view-panel-box-wrapper">
        <div class="secondary-view-panel-box-title">시간표</div>
        <div class="secondary-view-panel-box-contents"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {};
</script>

<style scoped>
@import '../assets/css/ClassRoom.css';
</style>
