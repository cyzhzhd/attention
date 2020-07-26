<template>
  <div>
    <h2>Login</h2>
    <form @submit.prevent="onSubmit">
      <input id="nickname" v-model.trim="login.nickname" placeholder="Enter your nickname" />
      <button type="submit" variant="primary" :disabled="!login.nickname">Login</button>
    </form>
  </div>
</template>

<script>
import router from '../router';

export default {
  name: 'AddBoard',
  data() {
    return {
      login: { nickname: '' },
    };
  },
  methods: {
    onSubmit() {
      router.push({
        name: 'RoomList',
        params: { nickname: this.login.nickname },
      });
    },
  },
};
</script>

<style>
</style>
