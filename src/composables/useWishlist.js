import { ref } from 'vue'
import { useToast } from "vue-toastification"

export function useWishlist() {
  const toast = useToast()
  const wishlist = ref(JSON.parse(localStorage.getItem('wishlist') || '[]'))

  // 위시리스트 상태 변경 시 이벤트 발생
  const emitWishlistChange = () => {
    const event = new CustomEvent('wishlist-changed', {
      detail: { wishlist: wishlist.value }
    })
    window.dispatchEvent(event)
  }

  function toggleWishlist(movie) {
    const index = wishlist.value.findIndex(m => m.id === movie.id)
    const wasInWishlist = index !== -1

    if (wasInWishlist) {
      wishlist.value.splice(index, 1)
      toast.info(`'${movie.title}' 위시리스트에서 제거되었습니다.`, {
        position: "bottom-right",
        timeout: 3000,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
    } else {
      wishlist.value.push(movie)
      toast.success(`'${movie.title}' 위시리스트에 추가되었습니다!`, {
        position: "bottom-right",
        timeout: 3000,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
    }

    localStorage.setItem('wishlist', JSON.stringify(wishlist.value))
    emitWishlistChange() // 상태 변경 알림
  }

  return {
    wishlist,
    toggleWishlist,
    isInWishlist: (movieId) => wishlist.value.some(movie => movie.id === movieId)
  }
}
