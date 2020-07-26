<template>
  <div id="app">
    <div>
      <router-link to="/">Home</router-link>
      <router-link to="/about">About</router-link>
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    name: 'test-electron-vue'
  }
</script>

<style>
  /* CSS */
</style>
