<template>
  <div>
    <TermsComponent
      :is-visible="showTerms"
      @accept="handleTermsAccept"
      @close="showTerms = false"
    />
    <div class="bg-image"></div>
    <div class="container">
      <div id="phone">
        <div id="content-wrapper">
          <!-- 로그인 폼 -->
          <div :class="['card', { hidden: !isLoginVisible }]" id="login">
            <form @submit.prevent="handleLogin" novalidate>
              <h1>Sign in</h1>
              <div class="input" :class="{ active: isEmailFocused || email }">
                <input
                  id="email"
                  type="email"
                  v-model="email"
                  @focus="focusInput('email')"
                  @blur="blurInput('email')"
                />
                <label for="email">Username or Email</label>
              </div>
              <div class="input" :class="{ active: isPasswordFocused || password }">
                <input
                  id="password"
                  type="password"
                  v-model="password"
                  @focus="focusInput('password')"
                  @blur="blurInput('password')"
                />
                <label for="password">Password</label>
              </div>
              <span class="checkbox remember">
                <input type="checkbox" id="remember" v-model="rememberMe" />
                <label for="remember" class="read-text">Remember me</label>
              </span>
              <span class="checkbox forgot">
                <a href="#">Forgot Password?</a>
              </span>
              <button
                type="submit"
                class="login-btn"
              >
                Login
              </button>
            </form>

            <template v-if="isLoginVisible">
              <div class="divider">
                <span>또는</span>
              </div>
              <KakaoLoginButton class="kakao-btn" />
            </template>

            <a href="javascript:void(0)" class="account-check" @click="toggleForm">
              Already have an account? <b>Sign in</b>
            </a>
          </div>

          <!-- 회원가입 폼 -->
          <div :class="['card', { hidden: isLoginVisible }]" id="register">
            <form @submit.prevent="handleRegister">
              <h1>Sign up</h1>
              <div class="input">
                <input
                  type="email"
                  v-model="registerEmail"
                  @focus="focusInput('registerEmail')"
                  @blur="handleBlur('registerEmail')"
                  required
                />
                <label :class="{
                  'label-active': isRegisterEmailFocused || registerEmail,
                  'label-blue': isRegisterEmailFocused
                }">이메일</label>
                <transition name="fade">
                  <small v-if="isRegisterEmailFocused" class="hint-text">
                    유효한 이메일 주소를 입력해주세요
                  </small>
                </transition>
              </div>
              <div class="input" :class="{ active: isRegisterPasswordFocused || registerPassword }">
                <input
                  id="register-password"
                  type="password"
                  v-model="registerPassword"
                  @focus="focusInput('registerPassword')"
                  @blur="blurInput('registerPassword')"
                  required
                />
                <label for="register-password">Password</label>
              </div>
              <div class="input" :class="{ active: isConfirmPasswordFocused || confirmPassword }">
                <input
                  id="confirm-password"
                  type="password"
                  v-model="confirmPassword"
                  @focus="focusInput('confirmPassword')"
                  @blur="blurInput('confirmPassword')"
                  required
                />
                <label for="confirm-password">Confirm Password</label>
              </div>
              <span class="checkbox remember">
                <input type="checkbox" id="terms" v-model="acceptTerms" required />
                <label for="terms" class="read-text">
                  I have read <b @click.prevent="showTerms = true" style="cursor: pointer">Terms and Conditions</b>
                </label>
              </span>
              <button type="submit">Register</button>
            </form>
            <a href="javascript:void(0)" class="account-check" @click="toggleForm"
              >Don't have an account? <b>Sign up</b></a
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'
import TermsComponent from './TermsComponent.vue'
import KakaoLoginButton from './KakaoLoginButton.vue'

const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const registerEmail = ref('')
const registerPassword = ref('')
const confirmPassword = ref('')
const rememberMe = ref(false)
const acceptTerms = ref(false)
const isLoginVisible = ref(true)
const isEmailFocused = ref(false)
const isPasswordFocused = ref(false)
const showTerms = ref(false)
const isRegisterEmailFocused = ref(false)
const isRegisterPasswordFocused = ref(false)
const isConfirmPasswordFocused = ref(false)
const emailError = ref('')

onMounted(() => {
  // Remember Me 상태 복원
  const savedRememberMe = localStorage.getItem('rememberMe')
  rememberMe.value = savedRememberMe === 'true'

  // 저장된 사용자 정보 복원
  const savedUser = localStorage.getItem('currentUser')

  // Remember Me가 true일 때만 저장된 정보 복원
  if (rememberMe.value && savedUser) {
    try {
      const userData = JSON.parse(savedUser)
      email.value = userData.email || ''
      password.value = userData.password || ''  // TMDb-Key 대신 password 사용
    } catch (error) {
      console.error('Error restoring saved data:', error)
    }
  }
})

const handleLogin = async () => {
  // 일반 로그인 로직만 처리
  if (!email.value) {
    toast.error('이메일을 입력해주세요')
    return
  }

  if (!password.value) {
    toast.error('비밀번호를 입력해주세요')
    return
  }

  // 이메일 형식 검증
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    toast.error('올바른 이메일 형식이 아닙니다')
    return
  }

  try {
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    console.log('저장된 사용자 목록:', users) // 디버깅용

    const user = users.find((u) => u.email === email.value)
    console.log('찾은 사용자:', user) // 디버깅용
    console.log('입력된 비밀번호:', password.value) // 디버깅용

    if (!user) {
      toast.error('등록되지 않은 이메일입니다.')
      return
    }

    if (user.password !== password.value) {
      toast.error('비밀번호가 일치하지 않습니다.')
      console.log('저장된 비밀번호:', user.password) // 디버깅용
      return
    }

    if (rememberMe.value) {
      localStorage.setItem('rememberMe', 'true')
      localStorage.setItem('currentUser', JSON.stringify({
        email: email.value,
        password: password.value  // 비밀번호도 함께 저장
      }))
    } else {
      localStorage.removeItem('rememberMe')
      localStorage.removeItem('currentUser')
    }

    await authStore.login(email.value)
    toast.success('로그인되었습니다.')
    await router.push('/')
  } catch (error) {
    console.error('로그인 실패:', error)
    toast.error('로그인 처리 중 오류가 발생했습니다.')
  }
}



const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const handleRegister = async () => {
  console.log('회원가입 시도:', {
    registerEmail: registerEmail.value,
    registerPassword: registerPassword.value,
    confirmPassword: confirmPassword.value,
    acceptTerms: acceptTerms.value
  });

  // 입력값 확인
  if (!registerEmail.value.trim()) {
    toast.error('이메일을 입력해주세요.');
    return;
  }

  if (!registerPassword.value.trim()) {
    toast.error('비밀번호를 입력해주세요.');
    return;
  }

  if (!confirmPassword.value.trim()) {
    toast.error('비밀번호 확인을 입력해주세요.');
    return;
  }

  // 이메일 유효성 검사
  if (!validateEmail(registerEmail.value)) {
    toast.error('유효한 이메일을 입력해주세요.');
    return;
  }

  // 비밀번호와 비밀번호 확인 값 일치 확인
  if (registerPassword.value !== confirmPassword.value) {
    toast.error('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
    return;
  }

  // 약관 동의 확인
  if (!acceptTerms.value) {
    toast.error('이용약관에 동의해주세요.');
    return;
  }

  try {
    const users = JSON.parse(localStorage.getItem('users') || '[]')

    if (users.some((u) => u.email === registerEmail.value)) {
      toast.error('이미 등록된 이메일입니다.')
      return
    }

    // 새로운 사용자 추가 - password 필드명 확인
    users.push({
      email: registerEmail.value,
      password: registerPassword.value  // 이 부분이 맞게 저장되는지 확인
    })

    console.log('저장되는 사용자 데이터:', users) // 디버깅용
    localStorage.setItem('users', JSON.stringify(users))

    toast.success('회원가입이 완료되었습니다.')
    isLoginVisible.value = true
    email.value = registerEmail.value

    // 폼 초기화
    registerEmail.value = '';
    registerPassword.value = '';
    confirmPassword.value = '';
    acceptTerms.value = false;
  } catch (error) {
    console.error('회원가입 에러:', error)
    toast.error('회원가입 처리 중 오류가 발생했습니다.')
  }
};


const focusInput = (inputName) => {
  if (inputName === 'email') isEmailFocused.value = true
  if (inputName === 'password') isPasswordFocused.value = true
  if (inputName === 'registerEmail') isRegisterEmailFocused.value = true
  if (inputName === 'registerPassword') isRegisterPasswordFocused.value = true
  if (inputName === 'confirmPassword') isConfirmPasswordFocused.value = true
}

const blurInput = (inputName) => {
  if (inputName === 'email') isEmailFocused.value = false
  if (inputName === 'password') isPasswordFocused.value = false
  if (inputName === 'registerEmail') isRegisterEmailFocused.value = false
  if (inputName === 'registerPassword') isRegisterPasswordFocused.value = false
  if (inputName === 'confirmPassword') isConfirmPasswordFocused.value = false
}

const toggleForm = () => {
  isLoginVisible.value = !isLoginVisible.value
}

const handleTermsAccept = () => {
  acceptTerms.value = true
  showTerms.value = false
}

const handleBlur = (inputName) => {
  setTimeout(() => {
    if (inputName === 'email') isEmailFocused.value = false
    if (inputName === 'password') isPasswordFocused.value = false
    if (inputName === 'registerEmail') isRegisterEmailFocused.value = false
    if (inputName === 'registerPassword') isRegisterPasswordFocused.value = false
    if (inputName === 'confirmPassword') isConfirmPasswordFocused.value = false
  }, 200)
}
</script>

<style scoped>
:root {
  --container-start-x: -50%;
  --container-end-x: -90%;
  --container-start-y: -58%;
  --container-end-y: -42%;
  --container-start-color: #ececec;
  --container-end-color: #100f0f;
}

.bg-image {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('https://images.unsplash.com/photo-1507041957456-9c397ce39c97?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D');
  background-size: cover;
  background-position: center;
}

.bg-image::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(27, 27, 27, 0.9);
}

a {
  text-decoration: none;
  margin: 0;
  padding: 0;
}

.container {
  height: 100svh;
  width: 100svw;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

#phone {
  width: 50svw;
  max-width: 80dvh;
  max-height: 60dvh;
  aspect-ratio: 3.35 / 4.5;
  border-radius: min(2.5cqw, 2cqh);
  text-align: center;
  transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);

  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

@media (max-height: 600px) {
  #phone {
    transform: translate(-50%, -50%) scale(0.5); /* Scale down on small screens */
  }
}

@media (max-height: 400px) {
  #phone {
    transform: translate(-50%, -50%) scale(0.3); /* Further scale down */
  }
}

#content-wrapper {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  position: relative;
}

input {
  font-size: 1.2rem;
  font-weight: 600;
  color: #000;
  background-color: transparent;
  border: none;
  outline: none;
  width: 100%;
  height: 2.5rem;
  padding: 0;
  margin: 0;
}

.read-text {
  display: flex;
  align-items: center;
  justify-content: center;
  text-indent: 10px; /* 원하는 들여쓰기 크기로 조정하세요 */
  color: #2b2b2b !important;
  font-weight: 900;
}

h1 {
  font-size: 24px;
  font-weight: 800;
  text-align: center;
  margin-top: 0;

  color: #272727;
}

button {
  display: block;
  border-radius: 50px;
  border: none;
  width: 100%;
  background-color: #2069ff;
  color: #fff;
  padding: 17px;
  text-transform: uppercase;
  letter-spacing: 2px;
  box-shadow: 0px 10px 30px rgba(23, 83, 209, 0.3);
  transition: all 0.2s ease;
}

button:hover {
  box-shadow: 0px 2px 10px rgba(23, 83, 209, 0.4);
}

.input {
  position: relative;
  margin-top: 1.5rem;
}

.line-active {
  border-bottom: 1px solid #2069ff !important;
  box-shadow: 0px 1px 0px #2069ff !important;
}

.input input {
  background-color: transparent;
  border: none;
  border-bottom: 1px solid #9e9e9e;
  border-radius: 0;
  outline: none;
  height: 2.5rem;
  width: 100%;
  font-size: 1rem;
  padding: 0;
  -webkit-box-shadow: none;
  box-shadow: none;
  box-sizing: content-box;
  transition: all 0.3s ease;
}

.input label {
  color: #9e9e9e;
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  font-size: 1rem;
  cursor: text;
  transition: transform 0.2s ease-out;
  transform-origin: 0% 100%;
  text-align: initial;
  transform: translateY(12px);
  pointer-events: none;
}

.label-active {
  transform: translateY(-14px) scale(0.8) !important;
  transform-origin: 0 0 !important;
}

.label-blue {
  color: #2069ff !important;
}

[type='checkbox']:not(:checked),
[type='checkbox']:checked {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

[type='checkbox'] + label {
  position: relative;
  padding-left: 25px;
  cursor: pointer;
  display: inline-block;
  height: 25px;
  line-height: 22px;
  font-size: 1rem;
  user-select: none;
}

[type='checkbox'] + label:before,
[type='checkbox']:not(.filled-in) + label:after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 18px;
  height: 18px;
  z-index: 0;
  border: 2px solid #5a5a5a;
  border-radius: 3px;
  margin-top: 2px;
  transition: 0.2s;
}

[type='checkbox']:not(.filled-in) + label:after {
  border: 0;
  transform: scale(0);
}

[type='checkbox']:checked + label:before {
  top: -4px;
  left: -5px;
  width: 12px;
  height: 22px;
  border-top: 2px solid transparent;
  border-left: 2px solid transparent;
  border-right: 2px solid #2069ff;
  border-bottom: 2px solid #2069ff;
  transform: rotate(40deg);
  backface-visibility: hidden;
  transform-origin: 100% 100%;
  border-radius: 1px;
}

.checkbox {
  margin-top: 2rem;
  display: block;
  margin-bottom: 2rem;
}

.remember {
  float: left;
}

.forgot {
  float: right;
}

.forgot a {
  text-decoration: none;
  color: #000;
  font-weight: 900;
  line-height: 22px;
}

.card {
  border-radius: 10px;
  width: 100%;
  max-width: 800px;
  position: absolute;
  background-color: white;
  padding: 27px 30px 76px 30px;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.16);
  transition: all 0.4s 0.1s ease;

  top: 50%;

  left: 50%;
  transform: translateX(-50%);
  min-height: 520px;
}

.card form {
  transform: translateX(0px);
  transition: all 0.3s 0.4s ease;
}

#login {
  z-index: 2;
  top: 5svh;
}

#register {
  z-index: 2;
  top: 5svh;
}

.account-check {
  width: 100%;
  text-align: center;
  position: absolute;
  bottom: 25px;
  left: 0;
  opacity: 0;
  text-decoration: none;
  visibility: hidden;
  color: #fff;
  padding: 10px;
  transition: all 0.2s ease;
}

.account-check:active {
  color: #000;
  transform: translateY(2px);
}

#register.hidden {
  top: calc(5svh + 120px) !important;
  z-index: 1;
}

#login.hidden {
  top: calc(5svh + 100px) !important;
  z-index: 1;
}

.card.hidden {
  background-color: #2069ff;
  box-shadow: 0px 20px 40px rgba(23, 83, 209, 0.8);
  padding: 0px 30px 0px 30px;
}

#register.hidden form {
  transform: translateX(20px);
}

#login.hidden form {
  transform: translateX(-20px);
}

.hidden form {
  opacity: 0;
  transition: all 0.3s ease;
}

.hidden .account-check {
  opacity: 1;
  visibility: visible;
  z-index: 2;
  transition: all 0.2s ease;
}

.register-swap {
  animation: register-swap 0.5s ease forwards;
}

.login-swap {
  animation: login-swap 0.5s ease forwards;
}

.active > label {
  color: rgba(0, 0, 0, 0);
}

@keyframes register-swap {
  0% {
    transform: translate(0%, 0%);
  }
  50% {
    transform: translate(30%, 0%);
  }
  0% {
    transform: translate(0%, 0%);
  }
}

@keyframes login-swap {
  0% {
    transform: translate(0%, 0%);
  }
  50% {
    transform: translate(-70%, 0%);
  }
  0% {
    transform: translate(0%, 0%);
  }
}

@media (max-width: 768px) {
  #phone {
    width: 80%;
    max-height: 70dvh;
    transform: translate(-50%, -60%) scale(1);
  }

  .card {
    padding: 20px 25px 66px 25px;
  }
}

.hint-text {
  position: absolute;
  bottom: -20px;
  left: 5px;
  font-size: 0.75rem;
  color: #2196F3;
  opacity: 0.8;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

:deep(.kakao-login-btn) {
  margin: 20px 0;
}

/* 구분선 스타일 추가 */
.divider {
  position: relative;
  text-align: center;
  margin: 20px 0;
  clear: both;  /* checkbox float 때문에 추가 */
}

.divider::before,
.divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 45%;
  height: 1px;
  background-color: #e0e0e0;
}

.divider::before {
  left: 0;
}

.divider::after {
  right: 0;
}

.divider span {
  background-color: white;
  padding: 0 10px;
  color: #757575;
  font-size: 14px;
}

/* 카카오 로그인 버튼 스타일 오버라이드 */
:deep(.kakao-login-btn) {
  width: 100%;
  background-color: #FEE500;
  color: #000000;
  font-weight: bold;
  border: none;
  border-radius: 50px;
  padding: 17px;
  text-transform: none;  /* 기존 버튼의 대문자 변환 제거 */
  letter-spacing: normal;  /* 기존 버튼의 자간 제거 */
  box-shadow: 0px 10px 30px rgba(254, 229, 0, 0.3);
}

:deep(.kakao-login-btn:hover) {
  box-shadow: 0px 2px 10px rgba(254, 229, 0, 0.4);
}

.login-btn,
.kakao-btn {
  position: relative;  /* 추가 */
  z-index: 10;        /* 추가 */
  width: 100%;
  padding: 15px;
  border-radius: 5px;
  cursor: pointer;
  touch-action: manipulation;  /* 추가 */
  -webkit-tap-highlight-color: transparent;  /* 추가 */
}

.input {
  position: relative;
  z-index: 5;  /* input의 z-index를 버튼보다 낮게 설정 */
}

/* 모바일 환경을 위한 추가 스타일 */
@media (max-width: 768px) {
  .login-btn,
  .kakao-btn {
    min-height: 44px;  /* 모바일 터치 영역 최소 크기 */
    font-size: 16px;   /* 모바일에서 읽기 쉬운 크기 */
  }

  /* 터치 영역 개선 */
  .login-btn:active,
  .kakao-btn:active {
    opacity: 0.8;
  }
}

.input.error input {
  border-color: #e87c03;
}

.error-message {
  color: #e87c03;
  font-size: 13px;
  margin-top: 6px;
}

.login-btn {
  width: 100%;
  padding: 15px;
  border: none;
  border-radius: 5px;
  background-color: #2069ff;
  color: white;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.login-btn:hover {
  background-color: #2196F3;
}

.login-btn:active {
  transform: scale(0.98);
}
</style>
