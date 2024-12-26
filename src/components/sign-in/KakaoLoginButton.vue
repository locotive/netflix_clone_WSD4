<template>
  <button
    @click="loginWithKakao"
    class="kakao-login-btn"
    :disabled="!isConfigValid"
  >
    카카오 로그인
  </button>
</template>

<script setup>
import { onMounted, ref } from 'vue';

const isConfigValid = ref(false);
const KAKAO_CLIENT_ID = ref('');
const REDIRECT_URI = ref('');

onMounted(() => {
  // 환경변수 로드 및 검증
  KAKAO_CLIENT_ID.value = import.meta.env.VITE_KAKAO_CLIENT_ID;
  REDIRECT_URI.value = import.meta.env.VITE_KAKAO_REDIRECT_URI;

  console.log('Environment:', import.meta.env.MODE); // 현재 환경 출력
  console.log('KAKAO_CLIENT_ID:', KAKAO_CLIENT_ID.value);
  console.log('REDIRECT_URI:', REDIRECT_URI.value);

  if (KAKAO_CLIENT_ID.value && REDIRECT_URI.value) {
    isConfigValid.value = true;
  } else {
    console.error('카카오 로그인 환경변수가 설정되지 않았습니다.');
  }
});

const loginWithKakao = () => {
  if (!isConfigValid.value) {
    console.error('카카오 로그인 설정이 완료되지 않았습니다.');
    return;
  }

  const kakaoURL = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID.value}&redirect_uri=${REDIRECT_URI.value}&response_type=code`;

  window.location.href = kakaoURL;
};
</script>

<style scoped>
.kakao-login-btn {
  background-color: #FEE500;
  color: #000000;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
</style>
