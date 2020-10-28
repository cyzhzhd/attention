<template>
  <div class="login-page">
    <div class="login-form" v-if="hasLogInActivated">
      <h2>Login</h2>
      <form
        class="login-form"
        @submit.prevent="LogIn(login.email, login.password)"
      >
        <input
          type="email"
          class="login-email"
          v-model.trim="login.email"
          placeholder="Enter your email address"
        />
        <input
          type="password"
          class="login-password"
          v-model.trim="login.password"
          placeholder="password"
        />
        <button type="submit" variant="primary" :disabled="!login.email">
          Login
        </button>
      </form>
    </div>
    <div class="signup-form" v-else>
      <h2>Sign Up</h2>
      <form class="signup-form" @submit.prevent="SignUp()">
        <input
          type="email"
          class="signup-email"
          v-model.trim="signup.email"
          placeholder="Enter your email address"
        />
        <input
          type="password"
          class="signup-password"
          v-model.trim="signup.password"
          placeholder="password"
        />
        <input
          type="password"
          class="signup-password-check"
          v-model.trim="signup.passwordCheck"
          placeholder="password-check"
        />
        <input
          type="text"
          class="signup-displayname"
          v-model.trim="signup.displayName"
          placeholder="displayname"
        />
        <form>
          가입 유형
          <select name="dropdown" v-model="signup.type">
            <option value="학생" selected>학생</option>
            <option value="선생님">선생님</option>
          </select>
        </form>
        <button type="submit" variant="primary" :disabled="!signup.email">
          Sign Up
        </button>
      </form>
    </div>
    <p class="error-message">{{ errorMessage }}</p>
  </div>
</template>

<script>
export default {
  name: 'loginPage',
  data() {
    return {
      login: { email: '', password: '' },
      signup: {
        email: '',
        password: '',
        passwordCheck: '',
        displayName: '',
        type: '학생',
      },
      errorMessage: this.$store.state.errorMessage,
      hasLogInActivated: true,
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
        this.errorMessage = this.$store.state.errorMessage;
      }
    },

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
          this.login.email = this.signup.email;
          this.signup.email = '';
          this.signup.password = '';
          this.signup.passwordCheck = '';
          this.signup.displayName = '';
          this.hasLogInActivated = true;
        } else {
          this.errorMessage = this.$store.state.errorMessage;
        }
      } else {
        this.errorMessage = '비밀번호를 다시 확인해주세요.';
      }
    },

    activeLogIn() {
      this.errorMessage = '';
      this.hasLogInActivated = true;
    },
    activeSignUp() {
      this.errorMessage = '';
      this.hasLogInActivated = false;
    },
  },
};
</script>

<style scoped>
.menu {
  display: flex;
}
.menu-item {
  background: white;
  width: 50%;
  transition: 0.5s;
}
.menu-item:hover {
  background: #42b983;
  width: 60%;
}
.menu-link {
  display: block;
  padding: 1em;
  font-size: 1.2rem;
  font-weight: bold;
  color: #555;
  text-decoration: none;
  text-align: center;
}
.menu-link:hover {
  color: white;
}
</style>
