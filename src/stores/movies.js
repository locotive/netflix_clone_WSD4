import { ref } from 'vue'
import { defineStore } from 'pinia'
import createAPI from '@/services/apiService'

export const useMovieStore = defineStore('movies', () => {
  const movies = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchMovies = async () => {
    try {
      loading.value = true
      error.value = null

      const api = createAPI()
      console.log('Fetching movies...')

      const response = await api.get('/movie/popular')
      console.log('API Response:', response.data)

      movies.value = response.data.results
    } catch (err) {
      console.error('Error details:', err.response?.data || err)
      error.value = err.response?.data?.status_message || '영화 데이터를 불러오는데 실패했습니다.'
    } finally {
      loading.value = false
    }
  }

  return {
    movies,
    loading,
    error,
    fetchMovies
  }
})
