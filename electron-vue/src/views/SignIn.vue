<template>
  <div class="sign-in-page">
    <sign-in-cover></sign-in-cover>
    <div class="sign-in-wrapper">
      <div class="sign-in-contents-wrapper">
        <div class="sign-in-header">
          <div>지금, 시작해보세요.</div>
        </div>
        <div class="tab-contents">
          <form @keyup.enter="SignUp()">
            <div class="input-wrapper">
              <label class="input-label">회원 구분</label>
              <div>
                <form action="" method="GET">
                  <select name="user-type" v-model="signup.type">
                    <option value="학생" selected>학생</option>
                    <option value="선생님">선생님</option>
                  </select>
                </form>
              </div>
            </div>
            <div class="input-wrapper">
              <label class="input-label">이메일</label>
              <input
                type="email"
                placeholder="이메일를 입력하세요"
                class="input"
                v-model.trim="signup.email"
              />
            </div>
            <div class="input-wrapper">
              <label class="input-label">비밀번호</label>
              <input
                type="password"
                placeholder="비밀번호를 입력하세요"
                class="input"
                v-model.trim="signup.password"
              />
            </div>
            <div class="input-wrapper">
              <label class="input-label">비밀번호 재확인</label>
              <input
                type="password"
                placeholder="비밀번호를 입력하세요"
                class="input"
                v-model.trim="signup.passwordCheck"
              />
            </div>
            <div class="input-wrapper">
              <label class="input-label">닉네임</label>
              <input
                type="text"
                placeholder="닉네임를 입력하세요"
                class="input"
                v-model.trim="signup.displayName"
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
            @click="SignUp()"
            :disabled="!signup.email"
          >
            회원가입
          </div>
          <!-- <div class="agree">
          회원가입을 하면 ATTENTION의 이용약관에 동의한 것으로 간주합니다.
        </div> -->
        </div>
        <div class="go-to-signup">
          <router-link :to="{ name: 'Login' }"
            >이미 회원이신가요? 이 곳을 클릭하세요.</router-link
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SignInCover from '../components/sign-in/sign-in-cover.vue';

export default {
  name: 'SigninPage',
  components: {
    SignInCover,
  },
  data() {
    return {
      signup: {
        email: '',
        password: '',
        passwordCheck: '',
        displayName: '',
        type: '학생',
      },
      errorMessage: '',
    };
  },
  methods: {
    async SignUp() {
      const isPasswordSame = this.signup.password === this.signup.passwordCheck;
      if (isPasswordSame) {
        const isTeacher = this.signup.type === '학생' ? 0 : 1;
        const options = {
          email: this.signup.email,
          password: this.signup.password,
          name: this.signup.displayName,
          isTeacher,
        };

        const data = await this.$store.dispatch('SIGN_UP_USER', options);
        if (data) {
          this.signup.email = '';
          this.signup.password = '';
          this.signup.passwordCheck = '';
          this.signup.displayName = '';
          this.$router.go(-1);
        } else {
          this.errorMessage = this.$store.getters.GET_ERRORMESSAGE;
        }
      } else {
        this.errorMessage = '비밀번호를 다시 확인해주세요.';
      }
    },
  },
};
</script>

<style scoped>
@import '../assets/css/login.css';
</style>
