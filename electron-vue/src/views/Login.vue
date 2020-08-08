<template>
  <div>
    <h2>Login</h2>
    <form @submit.prevent="SetNickName(login.nickname)">
      <input
        id="nickname"
        v-model.trim="login.nickname"
        placeholder="Enter your nickname"
      />
      <button type="submit" variant="primary" :disabled="!login.nickname">
        Login
      </button>
    </form>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'loginPage',
  data() {
    return {
      login: { nickname: '' },
    };
  },
  methods: {
    ...mapActions('room', ['SetNickName']),
  },
};
</script>

<style></style>
