import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory('/netflix_clone/'),
  routes: [
    {
      path: '/',
      component: () => import('@/components/home/HomeComponent.vue'),
      children: [
        {
          path: '',
          name: 'Home',
          component: () => import('@/components/home/HomeMainComponent.vue')
        },
        {
          path: 'popular',
          name: 'Popular',
          component: () => import('@/components/home/HomePopularComponent.vue')
        },
        {
          path: 'wishlist',
          name: 'Wishlist',
          component: () => import('@/components/views/MovieWishlistComponent.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'search',
          name: 'Search',
          component: () => import('@/components/search/HomeSearchComponent.vue')
        }
      ]
    },
    {
      path: '/signin',
      name: 'SignIn',
      component: () => import('@/components/sign-in/SignInComponent.vue')
    },
    {
      path: '/oauth/callback/kakao',
      name: 'KakaoCallback',
      component: () => import('@/views/KakaoCallback.vue')
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.checkAuth()

  if (isAuthenticated && to.path === '/signin') {
    next('/')
    return
  }

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/signin')
    return
  }

  next()
})

export default router
