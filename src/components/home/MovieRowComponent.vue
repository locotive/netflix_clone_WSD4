<template>
  <div class="movie-row">
    <h2>{{ title }}</h2>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="movies.length === 0 && !loading" class="no-movies">
      No movies found
    </div>
    <div
      v-if="movies.length > 0"
      class="slider-container"
      @wheel="handleWheel"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
      @mousemove="showButtons = true"
      @mouseleave="showButtons = false"
    >
      <button
        class="slider-button left"
        @click="slide('left')"
        :style="{ opacity: showButtons && !atLeftEdge ? 1 : 0 }"
        :disabled="atLeftEdge"
      >
        &lt;
      </button>

      <div class="slider-window" ref="sliderWindow">
        <div
          class="movie-slider"
          ref="slider"
          :style="{ transform: `translateX(-${scrollAmount}px)` }"
        >
          <div
            v-for="movie in movies"
            :key="movie.id"
            class="movie-card"
          >
            <div class="image-wrapper" @click="handleWishlistToggle(movie)">
              <div v-if="!imageLoaded" class="loading-overlay">
                <div class="loading-spinner"></div>
              </div>
              <img
                :src="getImageUrl(movie.poster_path)"
                :alt="movie.title"
                @load="imageLoaded = true"
                loading="lazy"
              />
            </div>
            <div v-if="isInWishlist(movie.id)" class="wishlist-badge">
              <span>👍</span>
            </div>
            <div class="grid-actions">
              <button class="grid-info-btn" @click.stop="showMovieDetails(movie)">
                상세정보
              </button>
            </div>
          </div>
        </div>
      </div>

      <button
        class="slider-button right"
        @click="slide('right')"
        :style="{ opacity: showButtons && !atRightEdge ? 1 : 0 }"
        :disabled="atRightEdge"
      >
        &gt;
      </button>
    </div>
    <div v-if="selectedMovie" class="movie-modal" @click.self="closeModal">
      <div class="modal-content">
        <div
          class="modal-backdrop"
          :style="{
            backgroundImage: `url(https://image.tmdb.org/t/p/original${selectedMovie.backdrop_path})`,
          }"
        >
          <div class="backdrop-overlay"></div>
        </div>

        <button class="close-btn" @click="closeModal">
          <font-awesome-icon :icon="faTimes" />
        </button>

        <div class="modal-body">
          <div class="modal-main-info">
            <img
              :src="getImageUrl(selectedMovie.poster_path)"
              :alt="selectedMovie.title"
              class="modal-poster"
            />
            <div class="modal-text-content">
              <h2 class="movie-title">{{ selectedMovie.title }}</h2>
              <div class="meta-info">
                <span class="rating">
                  <font-awesome-icon :icon="faStar" /> {{ selectedMovie.vote_average?.toFixed(1) }}
                </span>
                <span class="year">{{ selectedMovie.release_date?.split('-')[0] }}</span>
                <span class="runtime" v-if="selectedMovie.runtime">
                  {{ selectedMovie.runtime }}분
                </span>
              </div>
              <p class="overview">{{ selectedMovie.overview }}</p>
              <div class="genre-tags" v-if="selectedMovie.genres">
                <span v-for="genre in selectedMovie.genres" :key="genre.id" class="genre-tag">
                  {{ genre.name }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import createAPI from '@/services/apiService'
import { useWishlist } from '@/services/wishlistService'
import { faTimes, faStar } from '@fortawesome/free-solid-svg-icons'

const props = defineProps({
  title: String,
  fetchUrl: String
})

const movies = ref([])
const loading = ref(false)
const error = ref(null)
const scrollAmount = ref(0)
const showButtons = ref(false)
const selectedMovie = ref(null)
const imageLoaded = ref(false)
const maxScroll = ref(0)

const slider = ref(null)
const sliderWindow = ref(null)
let touchStartX = 0
let touchEndX = 0

const { toggleWishlist: toggleWishlistService, isInWishlist } = useWishlist()

const atLeftEdge = computed(() => scrollAmount.value <= 0)
const atRightEdge = computed(() => scrollAmount.value >= maxScroll.value)

const calculateMaxScroll = () => {
  if (slider.value && sliderWindow.value) {
    const sliderWidth = slider.value.scrollWidth
    const windowWidth = sliderWindow.value.clientWidth
    maxScroll.value = Math.max(0, sliderWidth - windowWidth)
    console.log('Calculated maxScroll:', maxScroll.value, 'sliderWidth:', sliderWidth, 'windowWidth:', windowWidth)
  }
}

const slide = (direction) => {
  if (!sliderWindow.value) return

  const slideAmount = sliderWindow.value.clientWidth / 2
  console.log('Sliding:', direction, 'amount:', slideAmount, 'current scroll:', scrollAmount.value)

  if (direction === 'left') {
    scrollAmount.value = Math.max(0, scrollAmount.value - slideAmount)
  } else {
    scrollAmount.value = Math.min(maxScroll.value, scrollAmount.value + slideAmount)
  }

  console.log('New scroll amount:', scrollAmount.value)
}

function handleWheel(event) {
  event.preventDefault()
  if (event.deltaY > 0) slide('right')
  else slide('left')
}

function handleTouchStart(event) {
  touchStartX = event.touches[0].clientX
}

function handleTouchMove(event) {
  touchEndX = event.touches[0].clientX
}

function handleTouchEnd() {
  const touchDiff = touchStartX - touchEndX
  if (Math.abs(touchDiff) > 50) {
    slide(touchDiff > 0 ? 'right' : 'left')
  }
}

const fetchMovies = async () => {
  try {
    loading.value = true
    error.value = null

    const api = createAPI()
    console.log('Fetching movies from URL:', props.fetchUrl)

    const response = await api.get(props.fetchUrl)
    console.log('API Response:', response.data)

    if (response.data && response.data.results) {
      movies.value = response.data.results
      console.log('Movies loaded:', movies.value.length)
    } else {
      console.error('Invalid response format:', response.data)
      error.value = '영화 데이터 형식이 올바르지 않습니다.'
    }
  } catch (err) {
    console.error('Error fetching movies:', err)
    error.value = err.message || '영화를 불러오는데 실패했습니다.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  console.log('MovieRow mounted with URL:', props.fetchUrl)
  fetchMovies()

  nextTick(() => {
    calculateMaxScroll()
    window.addEventListener('resize', calculateMaxScroll)
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', calculateMaxScroll)
})

watch(movies, () => {
  nextTick(calculateMaxScroll)
})

function getImageUrl(path) {
  return `https://image.tmdb.org/t/p/original${path}`
}

function handleWishlistToggle(movie) {
  toggleWishlistService(movie);
}

const showMovieDetails = async (movie) => {
  try {
    const api = createAPI()
    const response = await api.get(`/movie/${movie.id}`)
    selectedMovie.value = response.data
  } catch (error) {
    console.error('Error fetching movie details:', error)
  }
}

function closeModal() {
  selectedMovie.value = null
}
</script>

<style scoped>
.movie-row {
  margin-bottom: 40px;
  position: relative;
  width: 100%;
  overflow: hidden;
  margin-top: 10px;
}

.movie-row h2 {
  text-align: left;
  margin-left: 10px;
  margin-top: 15px;
  margin-bottom: 10px;
}

.slider-container {
  position: relative;
  overflow: hidden;
  width: 100%;
  padding: 0 20px;  /* 좌우 여백 추가 */
}

.slider-window {
  overflow: hidden;
  margin: 0 auto;
  width: 100%;
}

.movie-slider {
  display: flex;
  transition: transform 0.3s ease;
  gap: 10px;  /* 카드 간격 추가 */
}

.movie-card {
  position: relative;
  width: 100%;
  display: inline-block;
  aspect-ratio: 27/40;
  transition: transform 0.3s;
  transform-origin: center center;
  margin-top: 10px;
  margin-bottom: 15px;
  flex: 0 0 300px;  /* 카드 너비를 300px로 변경 */
  margin-right: 10px;
}

.movie-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.image-wrapper {
  position: relative;
  overflow: hidden;
  transition: transform 0.3s ease;
  height: 100%;
}

.movie-card:hover .image-wrapper {
  transform: scale(1.1);
  z-index: 2;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-left-color: #e50914;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.wishlist-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(229, 9, 20, 0.8);
  color: white;
  padding: 5px 8px;
  border-radius: 4px;
  z-index: 3;
  transition: transform 0.3s ease;
}

.movie-card:hover .wishlist-badge {
  transform: scale(1.1);
}

.movie-row {
  margin-bottom: 40px;
  position: relative;
  width: 100%;
  overflow: hidden;
  margin-top: 10px;
}

.movie-row h2 {
  text-align: left;
  margin-left: 10px;
  margin-top: 15px;
  margin-bottom: 10px;
}

.slider-container {
  position: relative;
  overflow: hidden;
  width: 100%;
  padding: 0 20px;  /* 좌우 여백 추가 */
}

.slider-window {
  overflow: hidden;
  margin: 0 auto;
  width: 100%;
}

.movie-slider {
  display: flex;
  transition: transform 0.3s ease;
  gap: 10px;  /* 카드 간격 추가 */
}

.slider-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  padding: 20px;
  cursor: pointer;
  transition: opacity 0.3s;
}

.slider-button.left {
  left: 0;
}

.slider-button.right {
  right: 0;
}

.slider-button:disabled {
  cursor: not-allowed;
  opacity: 0.3;
}

.grid-actions {
  position: absolute;
  bottom: 10px;
  right: 10px;
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 2;
}

.grid-info-btn {
  padding: 8px 16px;
  border-radius: 20px;
  background: rgba(180, 180, 180, 0.9);
  backdrop-filter: blur(4px);
  border: 2px solid rgba(255, 255, 255, 0.5);
  color: #1a1a1a;
  font-size: 0.9em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.grid-info-btn:hover {
  transform: scale(1.05);
  background: rgba(210, 210, 210, 1);
  border-color: rgba(255, 255, 255, 0.8);
  box-shadow: 0 6px 20px rgba(255, 255, 255, 0.3);
}

.movie-card:hover .grid-actions {
  opacity: 1;
  transform: translateY(-5px);
}

.movie-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  width: 95%;
  max-width: 1400px;
  max-height: 95vh;
  background: #141414;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  animation: modalFadeIn 0.3s ease;
}

.modal-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  z-index: 0;
}

.backdrop-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(20, 20, 20, 0.5), #141414);
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  color: white;
  border-radius: 50%;
  cursor: pointer;
  z-index: 2;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  position: relative;
  z-index: 1;
  padding: 30px;
}

.modal-main-info {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 30px;
  margin-top: 150px;
}

.modal-poster {
  width: 300px;
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
}

.modal-text-content {
  color: white;
}

.modal-text-content h2.movie-title {
  font-size: 2.5em;
  margin: 0 0 15px 0;
  text-align: left;
}

.meta-info {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  color: #999;
}

.overview {
  font-size: 1.1em;
  line-height: 1.6;
  margin-bottom: 20px;
  color: #ccc;
}

.genre-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 15px;
}

.genre-tag {
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  font-size: 0.9em;
  color: #fff;
  backdrop-filter: blur(4px);
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@media (max-width: 768px) {
  .modal-main-info {
    grid-template-columns: 1fr;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.movie-card.recommended {
  position: relative;
}

.movie-card.recommended::after {
  content: '추천됨';
  position: absolute;
  top: 16px;
  right: 16px;
  background: #1db954;
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  z-index: 3;
}

@media (max-width: 768px) {
  .movie-row {
    width: 80%;
    margin: 0 auto;
    padding: 20px 0;
  }

  .slider-container {
    position: relative;
    overflow: hidden;
  }

  .movie-slider {
    display: flex;
    transition: transform 0.3s ease;
  }

  .movie-card {
    flex: 0 0 100%;
    padding: 0 10px;
  }
}

@media (max-width: 480px) {
  .movie-row {
    width: 90%;
  }
}
</style>
