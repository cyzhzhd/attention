<template
  ><div class="login-modal">
    <div class="close-button" role="button"></div>
    <label class="sign-up-button">
      <span>새 계정만들기 ></span>
    </label>

    <div class="login-section">
      <div class="login-with-email">
        <input type="text" class="input" />
        <input type="password" class="input" />
        <div class="remember-me-and-forgot-password">
          <label class="remember-me-section">
            <div class="remember-me-text">내 계정 기억하기</div>
          </label>
          <a class="forgot-password">비밀번호 찾기 </a>
        </div>
        <div class="login-button">로그인</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {};
</script>

<style>
* {
  font-family: 'Spoqa Han Sans', 'Spoqa Han Sans JP', 'Sans-serif';
}

.login-modal {
  position: relative;
  width: fit-content;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 32px;
  flex-direction: column;
  box-shadow: 0 2px 8px 0 rgba(10, 8, 2, 0.2);
  border-radius: 8px;
}

.close-button {
  position: absolute;
  top: 16px;
  right: 16px;

  width: 24px;
  height: 24px;
  background-color: rgba(10, 8, 2, 0.2);
}

.login-logo {
  width: 200px;
  margin-bottom: 24px;
}

.sign-up-button {
  font-size: 18px;
  color: #00d39d;
  font-weight: 300;
  margin-bottom: 34px;
}
.login-section {
  display: flex;
  justify-content: space-between;
}

.login-with-email {
  width: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.input {
  width: 100%;
  margin: 15px 0;
}

.remember-me-and-forgot-password {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding-bottom: 25px;
  margin-top: 6px;
}
.remember-me-section {
  display: flex;
  align-items: center;
}

.remember-me-text {
  color: rgba(31, 25, 5, 0.68);
}

.forgot-password {
  color: rgba(31, 25, 5, 0.68);
  height: 20px;
  line-height: 1;
  text-decoration: none;
}
.login-button {
  width: 250px;
  height: 50px;
  margin-top: 25px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #00d39d;
  border-radius: 999px;
  color: #00d39d;
  transition: background-color 300ms ease-in, color 300ms ease-in;
}

.login-button:hover {
  background-color: #00d39d;
  color: white;
}
</style>
