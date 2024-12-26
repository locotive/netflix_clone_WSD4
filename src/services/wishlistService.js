import { ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'

export function useWishlist() {
  const authStore = useAuthStore()
  const toast = useToast()
  const wishlist = ref([])

  // 사용자별 위시리스트 키 생성
  const getWishlistKey = () => {
    if (authStore.kakaoToken) {
      return `wishlist_kakao_${authStore.user?.id}`
    } else if (authStore.userEmail) {
      return `wishlist_email_${authStore.userEmail}`
    }
    return 'wishlist_anonymous'
  }

  // 위시리스트 로드
  const loadWishlist = () => {
    const key = getWishlistKey()
    const saved = localStorage.getItem(key)
    wishlist.value = saved ? JSON.parse(saved) : []
    console.log('위시리스트 로드됨:', key, wishlist.value)
  }

  // 위시리스트 저장
  const saveWishlist = () => {
    const key = getWishlistKey()
    localStorage.setItem(key, JSON.stringify(wishlist.value))
  }

  // 영화 추가/제거
  const toggleWishlist = (movie) => {
    const index = wishlist.value.findIndex(item => item.id === movie.id)
    if (index === -1) {
      wishlist.value.push(movie)
      toast.success(`'${movie.title}' 위시리스트에 추가되었습니다!`)
    } else {
      wishlist.value.splice(index, 1)
      toast.info(`'${movie.title}' 위시리스트에서 제거되었습니다.`)
    }
    saveWishlist()
  }

  // 찜 여부 확인
  const isInWishlist = (movieId) => {
    return wishlist.value.some(item => item.id === movieId)
  }

  // 인증 상태 변경 감지
  watch(
    () => [authStore.isAuthenticated, authStore.userEmail, authStore.kakaoToken],
    () => {
      console.log('인증 상태 변경 감지됨')
      loadWishlist()
    },
    { immediate: true }
  )

  return {
    wishlist,
    toggleWishlist,
    isInWishlist,
    loadWishlist
  }
}
