<template>
  <div id="app">
    <router-link to="/">main</router-link>
    <router-link to="/login">login</router-link>
    <p>Welcome to our class</p>
    <button v-on:click="googleLogin">Login with google</button>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'electron-vue',
  methods: {
    googleLogin() {
      console.log(this.$firebase);
      const provider = new this.$firebase.auth.GoogleAuthProvider();
      console.log(provider);
      this.$firebase
        .auth()
        .signInWithPopup(provider)
        .then((result) => {
          const { user } = result.user;
          document.write(`Hello ${user.displayName}`);
          console.log(user);
        })
        .catch(console.log);
    },
  },
};
</script>

<style>
/* CSS */
</style>
