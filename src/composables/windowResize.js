// src/composables/windowResize.js

import { onMounted, onUnmounted } from 'vue'

export function useWindowResize(gridContainer, isMobile) {
  const handleResize = () => {
    // 창 크기 변경시 처리할 로직
    isMobile.value = window.innerWidth <= 768 // 모바일 화면 여부
    if (gridContainer.value) {
      // 그리드 크기 조정 등 추가적인 레이아웃 처리
    }
  }

  // Resize 이벤트 리스너를 설정
  onMounted(() => {
    window.addEventListener('resize', handleResize)
    handleResize() // 초기 화면 크기 설정
  })

  // 컴포넌트가 언마운트될 때 리스너 제거
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })

  return { handleResize }
}
