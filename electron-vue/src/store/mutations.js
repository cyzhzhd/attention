export default {
  SET_JWT(state, jwt) {
    state.jwt = jwt;
  },
  SET_ERROR(state, error) {
    state.errorMessage = error;
    if (error === 'invalid_email_and_password')
      state.errorMessage = '잘못된 아이디 혹은 비밀번호를 입력하셨습니다.';
    if (error === 'invalid_email')
      state.errorMessage = '이메일을 확인해주세요.';
    if (error === 'password_too_short')
      state.errorMessage = '비밀번호는 8자리 이상이어야 합니다.';
    if (error === 'duplicate_email')
      state.errorMessage = '이미 가입한 이메일입니다.';
    console.log(error);
  },
  SET_USER(state, userInfo) {
    state.user = userInfo;
  },
  SET_CLASSROOM_LIST(state, classInfo) {
    console.log(state);
    console.log(classInfo);
    console.log(state.classroom);
    state.classroom.push(classInfo);
  },
};
