<template>
  <header class="header">
    <img
      class="logo"
      src="../../assets/img/login-signup/logo.png"
      @click="tempHome()"
    />
    <slot name="router"> </slot>
    <div class="current-user-wrapper">
      <img
        class="current-user"
        src="../../assets/img/login-signup/userprofile.png"
      /><img
        class="dropdown-icon"
        src="../../assets/img/login-signup/dropdown.png"
      />
    </div>
  </header>
</template>
<script>
export default {
  methods: {
    tempHome() {
      this.$router.push({ name: 'Login' });
    },
  },
};
</script>

<style scoped>
.header {
  width: 100%;
  height: 140px;
  padding: 0 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
}

.logo {
  cursor: pointer;
  width: 250px;
}
.current-user-wrapper {
  display: flex;
  align-items: center;
}

.current-user-wrapper > * + * {
  margin-left: 16px;
}

.current-user {
  width: 50px;
  height: 50px;
}

.dropdown-icon {
  width: 24px;
}
.router {
  display: flex;
  /* justify-content: space-between; */
  /* width: 30vw; */
}
.router-item{
  font-size: 18px;
  font-weight: 900;
  color: #9097fd;
  margin-right: 1rem;
  cursor: pointer;
}
</style>
