<template>
  <div class="wrapper">
    <side-navigation-panel></side-navigation-panel>
    <class-room-list></class-room-list>
  </div>
</template>

<script>
import SideNavigationPanel from '../components/MainPage/SideNavigationPanel.vue';
import ClassRoomList from '../components/MainPage/ClassRoomList.vue';

export default {
  components: {
    SideNavigationPanel,
    ClassRoomList,
  },
};
</script>

<style>
/* html body {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
} */

* {
  box-sizing: border-box;
}
</style>
