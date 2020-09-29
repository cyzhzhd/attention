<template>
  <div class="side-navigation-panel">
    <div class="side-navigation-header">
      <img src="../assets/img/common/attention-logo.png" />
    </div>
    <div class="side-navigation-body">
      <router-link class="side-navigation-item" to="/">홈</router-link>
      <div class="side-navigation-item">교실 목록</div>
      <div class="side-navigation-item">수업 목록</div>
    </div>
    <div class="side-navigation-footer">
      <div class="current-user-profile"></div>
      <div class="current-user-name">이지은 선생님</div>
    </div>
  </div>
</template>

<script>
export default {};
</script>

<style scoped>
.side-navigation-panel {
  width: 320px;
  display: flex;
  flex-direction: column;
}

.side-navigation-header {
  padding: 24px 32px;
  width: 100%;
}

.side-navigation-header > img {
  width: 100%;
}

.side-navigation-body {
  min-width: 0;
  flex: 1;
  padding: 0 24px;
}

.side-navigation-item {
  font-family: 'Spoqa Han Sans', 'Spoqa Han Sans JP', 'Sans-serif';
  font-weight: 400;
  font-size: 36px;
  padding: 0 32px;
  transition: background-color 100ms ease-in;
  color: #666666;
  cursor: pointer;
  border-radius: 12px;
}

.side-navigation-item:hover {
  background-color: #e4f7f1;
}

.side-navigation-item + .side-navigation-item {
  margin-top: 4px;
}

.side-navigation-footer {
  display: flex;
  align-items: center;
  padding: 24px 32px;
}

.current-user-profile {
  width: 62px;
  height: 62px;
  margin-right: 8px;
  border-radius: 50%;
  background-color: #e4f7f1;
}

.current-user-name {
  font-family: 'Spoqa Han Sans', 'Spoqa Han Sans JP', 'Sans-serif';
  font-weight: 400;
  font-size: 24px;
  color: #666666;
}
</style>
