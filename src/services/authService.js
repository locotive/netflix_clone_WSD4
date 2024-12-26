export default {
  // 이메일 유효성 검사
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // 로그인
  async login(email, password) {
    try {
      // 입력값 검증
      if (!email?.trim()) {
        return { success: false, message: '이메일을 입력해주세요.' };
      }
      if (!password?.trim()) {
        return { success: false, message: '비밀번호를 입력해주세요.' };
      }
      if (!this.validateEmail(email)) {
        return { success: false, message: '유효한 이메일 형식이 아닙니다.' };
      }

      const users = JSON.parse(localStorage.getItem('users') || '[]');

      // 정확히 일치하는 이메일을 가진 사용자 찾기
      const user = users.find((u) => u.email === email);

      if (!user) {
        return { success: false, message: '등록되지 않은 이메일입니다.' };
      }

      // 비밀번호 확인
      if (user.password !== password) {
        return { success: false, message: '비밀번호가 일치하지 않습니다.' };
      }

      const userData = {
        email: user.email,
        loggedIn: true,
        timestamp: new Date().getTime(),
      };

      localStorage.setItem('currentUser', JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (error) {
      console.error('로그인 실패:', error);
      return { success: false, message: '로그인 중 오류가 발생했습니다.' };
    }
  },

  // 회원가입
  async register(email, password, confirmPassword, terms) {
    try {
      // 입력값 검증
      if (!email?.trim()) {
        return { success: false, message: '이메일을 입력해주세요.' };
      }
      if (!password?.trim()) {
        return { success: false, message: '비밀번호를 입력해주세요.' };
      }
      if (!confirmPassword?.trim()) {
        return { success: false, message: '비밀번호 확인을 입력해주세요.' };
      }
      if (!terms) {
        return { success: false, message: '이용약관에 동의해주세요.' };
      }
      if (!this.validateEmail(email)) {
        return { success: false, message: '유효한 이메일 형식이 아닙니다.' };
      }
      if (password !== confirmPassword) {
        return { success: false, message: '비밀번호가 일치하지 않습니다.' };
      }

      const users = JSON.parse(localStorage.getItem('users') || '[]');
      if (users.some((u) => u.email === email)) {
        return { success: false, message: '이미 등록된 이메일입니다.' };
      }

      users.push({ email, password });
      localStorage.setItem('users', JSON.stringify(users));

      return { success: true, message: '회원가입이 완료되었습니다.' };
    } catch (error) {
      console.error('회원가입 실패:', error);
      return { success: false, message: '회원가입 중 오류가 발생했습니다.' };
    }
  },

  // 로그아웃
  logout() {
    localStorage.removeItem('currentUser');
    return true;
  },

  // 로그인 상태 확인
  checkAuth() {
    const userData = localStorage.getItem('currentUser');
    if (!userData) return false;

    const user = JSON.parse(userData);
    // 24시간 후 자동 로그아웃
    if (new Date().getTime() - user.timestamp > 24 * 60 * 60 * 1000) {
      this.logout();
      return false;
    }

    return true;
  },
};
