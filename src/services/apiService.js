import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const createAPI = () => {
  const authStore = useAuthStore()
  const apiKey = authStore.apiKey

  if (!apiKey) {
    console.error('API 키가 없습니다')
    throw new Error('API 키가 필요합니다')
  }

  console.log('API 인스턴스 생성:', {
    hasApiKey: !!apiKey,
    baseURL: 'https://api.themoviedb.org/3'
  })

  const instance = axios.create({
    baseURL: 'https://api.themoviedb.org/3',
    params: {
      api_key: apiKey,
      language: 'ko-KR'
    }
  })

  // API 요청/응답 인터셉터
  instance.interceptors.request.use(
    config => {
      console.log('API 요청:', config.url)
      return config
    },
    error => {
      console.error('API 요청 에러:', error)
      return Promise.reject(error)
    }
  )

  instance.interceptors.response.use(
    response => {
      console.log('API 응답 성공:', response.config.url)
      return response
    },
    error => {
      console.error('API 응답 에러:', error)
      return Promise.reject(error)
    }
  )

  return instance
}

// 영화 데이터 조회 함수들
export const fetchMovies = async (endpoint) => {
  const api = createAPI()
  try {
    const response = await api.get(endpoint)
    return response.data
  } catch (error) {
    console.error(`데이터 조회 실패 (${endpoint}):`, error)
    throw error
  }
}

export const fetchMovieDetails = async (movieId) => {
  const api = createAPI()
  try {
    const response = await api.get(`/movie/${movieId}`)
    return response.data
  } catch (error) {
    console.error(`영화 상세 정보 조회 실패 (ID: ${movieId}):`, error)
    throw error
  }
}

export default createAPI
