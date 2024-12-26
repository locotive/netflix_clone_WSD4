import { ref, onMounted, onUnmounted } from 'vue'

export function useMovieUtils() {
  const isMobile = ref(window.innerWidth <= 768)
  const isLoading = ref(false)

  const getImageUrl = (path, viewType = 'grid') => {
    if (!path) return '/placeholder.jpg'

    const size = {
      grid: isMobile.value ? 'w185' : 'w342',
      list: 'w185',
      modal: 'original',
      thumbnail: 'w92'
    }[viewType] || 'w342'

    return `https://image.tmdb.org/t/p/${size}${path}`
  }

  const preloadImage = (path) => {
    if (!path) return
    const img = new Image()
    img.src = getImageUrl(path, 'grid')
  }

  const handleResize = () => {
    isMobile.value = window.innerWidth <= 768
  }

  const cleanup = () => {
    window.removeEventListener('resize', handleResize)
  }

  onMounted(() => {
    window.addEventListener('resize', handleResize)
  })

  onUnmounted(() => {
    cleanup()
  })

  return {
    isMobile,
    isLoading,
    getImageUrl,
    preloadImage,
    cleanup
  }
}
