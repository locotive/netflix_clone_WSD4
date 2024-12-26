import { ref, onUnmounted } from 'vue'
import { movieService } from '@/services/api/movieService'

export function useMovieGrid() {
  const movies = ref([])
  const currentPage = ref(1)
  const isLoading = ref(false)
  const totalPages = ref(0)

  async function fetchMovies(page = 1) {
    if (isLoading.value) return

    try {
      isLoading.value = true
      const data = await movieService.getMovies(page)
      movies.value = data.results
      totalPages.value = data.total_pages
      currentPage.value = page
    } catch (error) {
      console.error('Error fetching movies:', error)
    } finally {
      isLoading.value = false
    }
  }

  function resetState() {
    movies.value = []
    currentPage.value = 1
    totalPages.value = 0
    isLoading.value = false
  }

  onUnmounted(() => {
    resetState()
  })

  return {
    movies,
    currentPage,
    isLoading,
    totalPages,
    fetchMovies,
    resetState
  }
}
