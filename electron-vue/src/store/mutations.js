/* eslint no-param-reassign: "error" */
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
    if (error === 'register_failed')
      state.errorMessage = '닉네임을 입력해주세요.';
    if (error === 'invalid_time_settings')
      state.errorMessage = '올바르지 못한 시간 설정입니다.';
    if (error === 'session_start_failed')
      state.errorMessage = '한번에 하나 이상의 수업을 만들 수 없습니다.';

    console.log(error);
  },
  SET_USER(state, userInfo) {
    state.user = userInfo;
  },
  SET_CLASSROOM_LIST(state, classInfo) {
    if (classInfo.session === null) classInfo.session = 'notReady';
    /* eslint no-underscore-dangle: ["error", { "allow": [ "_id"] }] */
    let hasFound = false;
    state.classroom.some((classroom) => {
      if (classInfo._id === classroom._id) {
        classroom.session = classInfo.session;
        hasFound = true;
        return true;
      }
      return false;
    });
    if (!hasFound) state.classroom.push(classInfo);
  },
};
