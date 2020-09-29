<template>
  <div class="app">
    <!-- <div class="nav">
      <router-link class="router" to="/">Home</router-link>
      <router-link class="router" to="/about">About</router-link>
    </div> -->
    <router-view class="router-view" />
  </div>
</template>

<style lang="scss">
@import './assets/css/app.css';
.app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;

  // display: grid;
  // grid-template-columns: minmax(70px, 5%) 1fr;
  // grid-template-areas: 'nav router-view';
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

// html {
//   font-family: 'Apple SD Gothic Neo', Roboto, 'Noto Sans KR', NanumGothic,
//     'Malgun Gothic', sans-serif;
//   color: #555;
//   line-height: 1.2;
//   word-wrap: break-word;
// }
// body {
//   -webkit-font-smoothing: antialiased;
// }
</style>
