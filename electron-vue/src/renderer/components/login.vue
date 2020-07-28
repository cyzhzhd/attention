<template>
  <div>
    <h2>Login</h2>
    <form @submit.prevent="onSubmit(login.nickname)">
      <!-- <form> -->
      <input id="nickname" v-model.trim="login.nickname" placeholder="Enter your nickname" />
      <!-- <span class>
        Login
        <i
          class="fa fa-sign-in"
          aria-hidden="true"
          variant="primary"
          :disabled="!login.nickname"
          @click.prevent="setNickName(login.nickname)"
        ></i>
      </span>-->
      <button type="submit" variant="primary" :disabled="!login.nickname">Login</button>
    </form>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import router from '../router';

export default {
  name: 'loginPage',
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

    ...mapActions('room', ['setNickName']),
  },
};
</script>

<style>
</style>
