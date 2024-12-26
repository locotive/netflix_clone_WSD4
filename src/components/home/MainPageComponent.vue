<template>
  <div class="main-page">
    <!-- 추천 영화 섹션 -->
    <section class="recommended-movies">
      <h2>추천 영화</h2>
      <div class="movie-grid">
        <div v-for="movie in recommendedMovies"
             :key="movie.id"
             class="movie-card">
          <img :src="getImageUrl(movie.poster_path, 'grid')"
               :alt="movie.title"
               loading="lazy" />
          <div class="movie-actions">
            <button @click="toggleWishlist(movie)"
                    :class="{ 'in-wishlist': isInWishlist(movie.id) }">
              <font-awesome-icon :icon="isInWishlist(movie.id) ? solidHeart : regularHeart" />
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useWishlist } from '@/composables/useWishlist'
import { useMovieUtils } from '@/composables/useMovieUtils'
import { movieService } from '@/services/api/movieService'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons'
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons'

const { toggleWishlist, isInWishlist } = useWishlist()
const { getImageUrl } = useMovieUtils()
const recommendedMovies = ref([])

// 추천 영화 목록 가져오기
const fetchRecommendedMovies = async () => {
  try {
    const response = await movieService.getRecommendedMovies()
    recommendedMovies.value = response.results
  } catch (error) {
    console.error('추천 영화 로딩 실패:', error)
  }
}

// 위시리스트 변경 감지
const handleWishlistChange = () => {
  fetchRecommendedMovies() // 추천 목록 갱신
}

onMounted(() => {
  fetchRecommendedMovies()
  window.addEventListener('wishlist-changed', handleWishlistChange)
})

onUnmounted(() => {
  window.removeEventListener('wishlist-changed', handleWishlistChange)
})
</script>

<style scoped>
.main-page {
  padding: 20px;
}

.recommended-movies {
  margin-bottom: 40px;
}

.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
  padding: 20px 0;
}

.movie-card {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
}

.movie-actions {
  position: absolute;
  top: 10px;
  right: 10px;
}

.movie-actions button {
  background: rgba(0, 0, 0, 0.5);
  border: none;
  border-radius: 50%;
  padding: 8px;
  cursor: pointer;
  color: white;
}

.movie-actions button.in-wishlist {
  color: #e50914;
}
</style>
