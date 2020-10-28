<template>
  <div class="sign-in-page">
    <sign-in-cover></sign-in-cover>
    <div class="sign-in-wrapper">
      <div class="sign-in-contents-wrapper">
        <div class="sign-in-header">
          <div>시작해볼까요?</div>
        </div>
        <div class="tab-contents">
          <form @submit.prevent="LogIn(login.email, login.password)">
            <div class="input-wrapper">
              <label class="input-label">이메일</label>
              <input
                type="email"
                v-model.trim="login.email"
                placeholder="이메일를 입력하세요"
                class="input"
              />
            </div>

            <div class="input-wrapper">
              <label class="input-label">비밀번호</label>
              <input
                type="password"
                v-model.trim="login.password"
                placeholder="비밀번호를 입력하세요"
                class="input"
              />
            </div>

            <p class="error-message">{{ errorMessage }}</p>
          </form>
        </div>

        <div class="sign-in-button-wrapper">
          <img class="arrow" src="../assets/img/login-signup/arrow.png" />
          <div
            class="sign-in-button"
            role="button"
            @click="LogIn(login.email, login.password)"
            :disabled="!login.email"
          >
            로그인
          </div>
        </div>
        <div class="go-to-signup">
          <router-link :to="{ name: 'SignIn' }"
            >아이디가 없으세요? 이 곳을 클릭하세요.</router-link
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SignInCover from '../components/sign-in/sign-in-cover.vue';

export default {
  name: 'loginPage',
  components: {
    SignInCover,
  },
  data() {
    return {
      login: { email: '', password: '' },
      errorMessage: '',
    };
  },
  methods: {
    async LogIn() {
      const options = {
        email: this.login.email,
        password: this.login.password,
      };
      const jwt = await this.$store.dispatch('FETCH_JWT', options);
      const info = await this.$store.dispatch('FETCH_USER_INFO');

      if (jwt && info) {
        this.$router.push({
          name: 'ClassRoomList',
        });
      } else {
        this.errorMessage = this.$store.getters.GET_ERRORMESSAGE;
      }
    },
  },
};
</script>

<style scoped>
@import '../assets/css/login.css';
</style>
