<template>
  <div id="app">
    <HeaderComponent />
    <div id="container">
      <RouterView :key="$route.fullPath" />
    </div>
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import HeaderComponent from '@/layouts/HeaderComponent.vue' // 경로 확인 후 수정 필요
</script>

<style scoped>
.app-header {
  height: 60px; /* 원하는 높이 설정 */
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px; /* 상하 여백 제거 */
  background-color: #141414; /* 헤더 배경 */
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  transition: background-color 0.3s ease;
}
</style>
