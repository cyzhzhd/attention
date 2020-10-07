<template>
  <div class="login-page">
    <nav class="login-signup">
      <ul class="menu">
        <li class="menu-item" @click.prevent="activeLogIn">
          <a href="#" class="menu-link">Log In</a>
        </li>
        <li class="menu-item" @click.prevent="activeSignUp">
          <a href="#" class="menu-link">Sign Up</a>
        </li>
      </ul>
    </nav>
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
          type="text"
          class="signup-displayname"
          v-model.trim="signup.displayName"
          placeholder="displayname"
        />
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
      signup: { email: '', password: '', displayName: '' },
      errorMessage: '',
      hasLogInActivated: true,
    };
  },
  methods: {
    LogIn() {
      const options = {
        email: this.login.email,
        password: this.login.password,
      };
      this.$http
        .post('https://be.swm183.com:3000/user/login', options)
        .then(response => {
          console.log(response);
          this.$setJWT(response.data);

          this.login.email = '';
          this.login.password = '';

          this.$router.push({
            name: 'ClassRoomList',
          });
        })
        .catch(error => {
          this.errorMessage = error.response;
          // this.errorMessage = '잘못된 아이디 혹은 비밀번호를 입력하셨습니다.';
          console.log(error);
        });
    },

    SignUp() {
      const options = {
        email: this.signup.email,
        password: this.signup.password,
        name: this.signup.displayName,
        isTeacher: 1,
      };
      this.$http
        .post('https://be.swm183.com:3000/user/account', options)
        .then(response => {
          console.log(response);
          // if (response.data.code === 'auth/invalid-password') {
          //   this.errorMessage = '비밀번호는 6자리 이상 입력해주세요';
          // } else if (response.data.code === 'auth/invalid-email') {
          //   this.errorMessage = '정확한 이메일 주소를 입력해주세요.';
          // } else {
          this.login.email = this.signup.email;
          this.signup.email = '';
          this.signup.password = '';
          this.signup.displayName = '';
          this.errorMessage = '';
          this.hasLogInActivated = true;
          // }
        })
        .catch(error => {
          this.errorMessage = error.response;
          console.log(error.response);
          console.error(error);
        });
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
