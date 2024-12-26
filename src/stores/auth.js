import { defineStore } from 'pinia'
import { useWishlist } from '@/services/wishlistService'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: !!localStorage.getItem('user_email') || !!localStorage.getItem('kakao_access_token'),
    apiKey: import.meta.env.VITE_TMDB_API_KEY,
    kakaoToken: localStorage.getItem('kakao_access_token'),
    user: JSON.parse(localStorage.getItem('user_info')),
    userEmail: localStorage.getItem('user_email')
  }),

  getters: {
    getIsAuthenticated: (state) => state.isAuthenticated,
    getApiKey: (state) => state.apiKey,
    getUserName: (state) => {
      if (state.user?.kakao_account?.profile?.nickname) {
        return state.user.kakao_account.profile.nickname
      }
      return state.userEmail?.split('@')[0] || '사용자'
    }
  },

  actions: {
    login(email) {
      try {
        localStorage.setItem('user_email', email)
        this.userEmail = email
        this.isAuthenticated = true
        // 로그인 후 해당 계정의 위시리스트 로드
        const { loadWishlist } = useWishlist()
        loadWishlist()
      } catch (error) {
        console.error('로그인 실패:', error)
        throw error
      }
    },

    kakaoLogin(token, userData) {
      try {
        localStorage.setItem('kakao_access_token', token)
        localStorage.setItem('user_info', JSON.stringify(userData))
        this.kakaoToken = token
        this.user = userData
        this.isAuthenticated = true
        // 카카오 로그인 후 해당 계정의 위시리스트 로드
        const { loadWishlist } = useWishlist()
        loadWishlist()
      } catch (error) {
        console.error('카카오 로그인 실패:', error)
        throw error
      }
    },

    async logout() {
      try {
        if (this.kakaoToken && window.Kakao?.Auth?.getAccessToken()) {
          await window.Kakao.Auth.logout()
        }

        localStorage.removeItem('user_email')
        localStorage.removeItem('kakao_access_token')
        localStorage.removeItem('user_info')
        this.userEmail = null
        this.kakaoToken = null
        this.user = null
        this.isAuthenticated = false

        // 로그아웃 후 익명 위시리스트로 전환
        const { loadWishlist } = useWishlist()
        loadWishlist()
      } catch (error) {
        console.error('로그아웃 실패:', error)
        throw error
      }
    },

    checkAuth() {
      try {
        const userEmail = localStorage.getItem('user_email')
        const kakaoToken = localStorage.getItem('kakao_access_token')
        const userInfo = localStorage.getItem('user_info')

        if (userEmail) {
          this.userEmail = userEmail
          this.isAuthenticated = true
        } else if (kakaoToken && userInfo) {
          this.kakaoToken = kakaoToken
          this.user = JSON.parse(userInfo)
          this.isAuthenticated = true

          if (window.Kakao?.Auth?.getAccessToken()) {
            window.Kakao.Auth.getStatusInfo()
              .then(response => {
                if (response.status !== 'connected') {
                  this.logout()
                }
              })
              .catch(() => this.logout())
          }
        } else {
          this.userEmail = null
          this.kakaoToken = null
          this.user = null
          this.isAuthenticated = false
        }

        console.log('Store: 인증 상태 체크', {
          email: this.userEmail,
          kakaoToken: this.kakaoToken,
          isAuthenticated: this.isAuthenticated,
          user: this.user
        })

        return this.isAuthenticated
      } catch (error) {
        console.error('인증 상태 체크 실패:', error)
        this.logout()
        return false
      }
    }
  }
})
