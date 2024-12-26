import createAPI from '../apiService'
import { cacheService } from '../cache/cacheService'

export const movieService = {
  async getMovieDetails(movieId) {
    const cacheKey = `movie_cache_details_${movieId}`
    const cachedData = cacheService.get(cacheKey)

    if (cachedData) {
      return cachedData
    }

    try {
      const api = createAPI()
      const response = await api.get(`/movie/${movieId}`)

      cacheService.set(cacheKey, response.data)
      return response.data
    } catch (error) {
      console.error('Error fetching movie details:', error)
      throw error
    }
  },

  async getMovies(page = 1) {
    const cacheKey = `movie_cache_list_${page}`
    const cachedData = cacheService.get(cacheKey)

    if (cachedData) {
      return cachedData
    }

    try {
      const api = createAPI()
      const response = await api.get('/movie/popular', {
        params: { page }
      })

      cacheService.set(cacheKey, response.data)
      return response.data
    } catch (error) {
      console.error('Error fetching movies:', error)
      throw error
    }
  },

  async getRecommendedMovies() {
    const cacheKey = 'movie_cache_recommended'
    const cachedData = cacheService.get(cacheKey)

    if (cachedData) {
      return cachedData
    }

    try {
      const api = createAPI()
      const response = await api.get('/movie/popular', {
        params: { page: 1 }
      })

      cacheService.set(cacheKey, response.data)
      return response.data
    } catch (error) {
      console.error('Error fetching recommended movies:', error)
      throw error
    }
  }
}
