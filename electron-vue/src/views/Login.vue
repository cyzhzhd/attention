<template>
  <div class="login-page">
    <nav class="login-signup">
      <ul class="menu">
        <li class="menu-item" @click.prevent="activeLogIn">
          <a href="#" class="menu-link">
            Log In
          </a>
        </li>
        <li class="menu-item" @click.prevent="activeSignUp">
          <a href="#" class="menu-link">
            Sign Up
          </a>
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
  </div>
</template>

<script>
export default {
  name: 'loginPage',
  data() {
    return {
      login: { email: '', password: '' },
      signup: { email: '', password: '', displayName: '' },
      hasLogInActivated: true,
    };
  },
  methods: {
    LogIn() {
      this.$auth
        .signInWithEmailAndPassword(this.login.email, this.login.password)
        .then(credential => {
          this.$setUser(credential.user);

          this.login.email = '';
          this.login.password = '';

          this.$router.push({
            name: 'RoomList',
          });
        });
    },

    SignUp() {
      const options = {
        email: this.signup.email,
        password: this.signup.password,
        displayName: this.signup.displayName,
      };
      this.$http.post('/api/firebase/signup', options).then(() => {
        this.login.email = this.signup.email;
        this.signup.email = '';
        this.signup.password = '';
        this.hasLogInActivated = true;
      });
    },

    activeLogIn() {
      this.hasLogInActivated = true;
    },
    activeSignUp() {
      this.hasLogInActivated = false;
    },
  },
};
</script>

<style>
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
