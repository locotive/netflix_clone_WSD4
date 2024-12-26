<template>
  <div class="terms-modal" v-if="isVisible" @click.self="close">
    <div class="terms-content">
      <h2>이용약관</h2>
      <div class="terms-text">
        <h3>1. 서비스 이용약관</h3>
        <p>본 서비스는 TMDB API를 활용한 영화 정보 제공 서비스입니다.</p>

        <h3>2. 개인정보 수집 및 이용</h3>
        <p>회원가입 시 수집하는 개인정보는 다음과 같습니다:</p>
        <ul>
          <li>이메일 주소</li>
          <li>TMDB API 키</li>
        </ul>

        <h3>3. API 키 사용</h3>
        <p>사용자는 유효한 TMDB API 키를 제공해야 하며, 이는 다음 용도로 사용됩니다:</p>
        <ul>
          <li>영화 정보 조회</li>
          <li>영화 검색</li>
          <li>영화 상세 정보 확인</li>
        </ul>

        <h3>4. 책임 제한</h3>
        <p>본 서비스는 TMDB에서 제공하는 데이터의 정확성을 보장하지 않습니다.</p>
      </div>
      <div class="terms-actions">
        <button @click="accept" class="accept-btn">동의</button>
        <button @click="close" class="close-btn">닫기</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

defineProps({
  isVisible: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['accept', 'close'])

const accept = () => {
  emit('accept')
}

const close = () => {
  emit('close')
}
</script>

<style scoped>
.terms-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.terms-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  color: #333;
}

.terms-content h2 {
  margin-bottom: 1.5rem;
  color: #2069ff;
}

.terms-text {
  margin-bottom: 2rem;
}

.terms-text h3 {
  margin: 1.5rem 0 0.5rem;
  color: #444;
}

.terms-text p, .terms-text ul {
  margin: 0.5rem 0;
  line-height: 1.6;
}

.terms-text ul {
  padding-left: 1.5rem;
}

.terms-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

button {
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.accept-btn {
  background: #2069ff;
  color: white;
}

.close-btn {
  background: #e0e0e0;
  color: #333;
}

button:hover {
  opacity: 0.9;
}
</style>
