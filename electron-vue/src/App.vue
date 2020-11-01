<template>
  <div class="app">
    <router-view class="router-view" />
  </div>
</template>

<style scoped lang="scss">
@import './assets/css/app.css';
.app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  width: 100%;
  height: 100%;
}

.nav {
  display: flex;
  flex-direction: column;

  a {
    font-size: 1rem;
    font-weight: bold;
    color: #2c3e50;
    background: white;
    text-decoration: none;

    &.router-link-exact-active {
      color: #676ed4;
      background: #42b983;
      text-decoration: none;
    }
  }

  grid-area: nav;
}
.router {
  padding: 10px;
}

.router-view {
  grid-area: 'router-view';
}
</style>
