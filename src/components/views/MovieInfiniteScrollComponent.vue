<template>
  <div class="movie-grid" ref="gridContainer">
    <div v-if="isLoading && movies.length === 0" class="loading">
      <div class="loading-spinner"></div>
      <p>영화를 불러오는 중...</p>
    </div>
    <div v-else-if="!isLoading && movies.length === 0" class="no-results">
      검색 결과가 없습니다. 필터 조건을 변경해보세요.
    </div>
    <div v-else class="movie-list">
      <div
        v-for="movie in movies"
        :key="movie.id"
        class="movie-item"
        :class="{ 'in-wishlist': isInWishlist(movie.id) }"
        @click="toggleWishlist(movie)"
      >
        <div class="poster-container">
          <div v-if="!movie.imageLoaded" class="loading-overlay">
            <div class="loading-spinner"></div>
          </div>
          <img
            :src="movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/no-poster.jpg'"
            :alt="movie.title"
            class="movie-poster"
            loading="lazy"
            @load="movie.imageLoaded = true"
            :class="{ 'loaded': movie.imageLoaded }"
          />
        </div>
        <div class="movie-info">
          <h3>{{ movie.title }}</h3>
          <div class="movie-details">
            <div class="meta-info">
              <p class="rating">⭐ {{ movie.vote_average.toFixed(1) }}</p>
              <p class="release-date">{{ formatDate(movie.release_date) }}</p>
            </div>
            <p class="overview">{{ movie.overview || '줄거리 없음' }}</p>
            <div class="list-actions">
              <button class="info-btn" @click.stop="handleInfoClick($event, movie)" @mouseenter="showTooltip($event, '영화 상세정보 보기')" @mouseleave="hideTooltip">
                <font-awesome-icon :icon="faInfoCircle" /> 상세정보
              </button>
            </div>
          </div>
        </div>
        <div v-if="isInWishlist(movie.id)" class="wishlist-badge">
          찜됨
        </div>
      </div>
    </div>
    <div v-if="isLoading" class="loading-indicator">
      <div class="loading-spinner"></div>
      <p>더 많은 영화를 불러오는 중...</p>
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
              :src="`https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}`"
              :alt="selectedMovie.title"
              class="modal-poster"
              @error="handleImageError"
              @load="handleImageLoad"
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
    <div v-if="tooltip.visible" class="tooltip" :style="tooltip.style">
      {{ tooltip.text }}
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import createAPI from '@/services/apiService'
import { useWishlist } from '@/services/wishlistService'
import { faInfoCircle, faTimes, faStar } from '@fortawesome/free-solid-svg-icons'

const props = defineProps({
  fetchUrl: {
    type: String,
    required: true, // API 데이터를 가져올 기본 URL
  },
  genreCode: String,
  sortingOrder: String,
  voteAverage: Number,
  year: [String, Number],
  runtime: String,
  language: String,
  adult: Boolean,
})


const movies = ref([])
const currentPage = ref(1)
const isLoading = ref(false)

const { isInWishlist, toggleWishlist } = useWishlist()

function formatDate(dateStr) {
  if (!dateStr) return '개봉일 미정'
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getFinalUrl = (page) => {
  // 기본 URL에서 중복된 파라미터를 방지합니다.
  const baseUrl = props.fetchUrl.includes('api_key=') ? props.fetchUrl : `${props.fetchUrl}&api_key=${props.apiKey}`;

  return `${baseUrl}&page=${page}&language=ko-KR`;
};

// 영화 데이터 로드 함수 수정
const loadMovies = async () => {
  if (isLoading.value) return

  try {
    isLoading.value = true
    const url = getFinalUrl(currentPage.value)
    console.log('Loading movies from URL:', url)

    // props.apiKey로 API 인스턴스 생성
    const api = createAPI()
    const response = await api.get(props.fetchUrl)

    if (response.data && response.data.results) {
      const newMovies = response.data.results
      if (currentPage.value === 1) {
        movies.value = newMovies
      } else {
        movies.value = [...movies.value, ...newMovies]
      }
      console.log(`Loaded ${newMovies.length} movies. Total: ${movies.value.length}`)
    }
  } catch (error) {
    console.error('Error loading movies:', error)
  } finally {
    isLoading.value = false
  }
}


// props가 변경될 때 데이터 리로드
watch(
  () => [
    props.genreCode,
    props.sortingOrder,
    props.voteAverage,
    props.year,
    props.runtime,
    props.language,
    props.adult
  ],
  () => {
    console.log('Search params changed, reloading data...')
    currentPage.value = 1
    movies.value = []
    loadMovies()
  }
)

const gridContainer = ref(null)

// 스크롤 감지 함수 추가
const handleScroll = () => {
  const scrollPosition = window.innerHeight + window.scrollY
  const bottomOfPage = document.documentElement.offsetHeight - 200 // 하단에서 200px 여유

  console.log('Scroll Position:', scrollPosition)
  console.log('Bottom of Page:', bottomOfPage)

  if (scrollPosition >= bottomOfPage && !isLoading.value) {
    console.log('Loading more movies...')
    currentPage.value++
    loadMovies()
  }
}

// 컴포넌트 마운트 시 스크롤 이벤트 리스너 추가
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  loadMovies() // 초기 데이터 로드
})

// 컴포넌트 언마운트 시 이벤트 리스너 제거
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const selectedMovie = ref(null)

async function showMovieDetails(movie) {
  try {
    console.log('Fetching movie details for:', movie.id)

    // props.apiKey 전달
    const api = createAPI(props.apiKey)
    const response = await api.get(`/movie/${movie.id}`)

    console.log('Movie details response:', response.data)
    selectedMovie.value = response.data
  } catch (error) {
    console.error('Error fetching movie details:', error)
  }
}


function closeModal() {
  selectedMovie.value = null
}

function handleInfoClick(event, movie) {
  event.stopPropagation()
  hideTooltip()
  showMovieDetails(movie)
}

// 이미지 로드 관련 디버깅
function handleImageError(e) {
  console.error('Image failed to load:', e.target.src);
}

function handleImageLoad(e) {
  console.log('Image loaded successfully:', e.target.src);
}

// 툴팁 관련 상태 추가
const tooltip = ref({
  visible: false,
  text: '',
  style: {
    top: '0px',
    left: '0px'
  }
})

const mousePosition = ref({ x: 0, y: 0 })

// 툴팁 표시 함수
function showTooltip(event, text) {
  mousePosition.value = {
    x: event.clientX,
    y: event.clientY
  }
  tooltip.value = {
    visible: true,
    text: text,
    style: {
      top: `${event.clientY + 10}px`,
      left: `${event.clientX + 10}px`
    }
  }
}

// 툴팁 숨김 함수
function hideTooltip() {
  tooltip.value.visible = false
}

// 툴팁 위치 업데이터
let tooltipUpdater = null
function startTooltipUpdater() {
  tooltipUpdater = setInterval(() => {
    if (tooltip.value.visible) {
      tooltip.value.style = {
        top: `${mousePosition.value.y + 10}px`,
        left: `${mousePosition.value.x + 10}px`
      }
    }
  }, 1500)
}

function stopTooltipUpdater() {
  if (tooltipUpdater) {
    clearInterval(tooltipUpdater)
    tooltipUpdater = null
  }
}

// 컴포넌트 마운트/언마운트 시 툴팁 업데이터 처리
onMounted(() => {
  startTooltipUpdater()
})

onUnmounted(() => {
  stopTooltipUpdater()
})
</script>

<style scoped>
.movie-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
}

.movie-list {
  display: flex;
  flex-direction: column;
  width: 98%;
  max-width: 2400px;
  margin: 0 auto;
  gap: 30px;
  padding: 20px 10px;
}

.movie-item {
  width: 100%;
  position: relative;
  display: flex;
  background: #333;
  border-radius: 8px;
  overflow: hidden;
}

.movie-item img {
  width: 200px;
  height: 300px;
  object-fit: cover;
}

.movie-info {
  padding: 20px;
  flex-grow: 1;
}

.movie-item:hover {
  transform: scale(1.02);
}

.poster-container {
  position: relative;
  width: 200px;
  aspect-ratio: 2/3;
  background: #1a1a1a;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #1a1a1a;
  z-index: 1;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-left-color: #e50914;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

img {
  opacity: 0;
  transition: opacity 0.3s ease;
}

img.loaded {
  opacity: 1;
  width: 100%;
  height: 100%;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.wishlist-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(229, 9, 20, 0.8);
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  z-index: 3;
}

.movie-poster {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.movie-item:hover .movie-poster {
  transform: scale(1.05);
}

.movie-info h3 {
  margin: 0;
  font-size: 1.8rem;
  color: white;
  margin-bottom: 16px;
  font-weight: 600;
}

.movie-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.meta-info {
  display: flex;
  gap: 20px;
  align-items: center;
}

.rating {
  color: #ffd700;
  font-size: 1.2rem;
  margin: 0;
}

.release-date {
  color: #aaa;
  font-size: 1.1rem;
  margin: 0;
}

.overview {
  color: #ddd;
  font-size: 1.1rem;
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 6;
  line-clamp: 6;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-left-color: #e50914;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading, .no-results, .loading-more {
  text-align: center;
  padding: 20px;
  color: white;
}

/* 모바일 대응 */
@media (max-width: 768px) {
  .movie-list {
    width: 100%;
    padding: 10px;
    gap: 15px;
  }

  .movie-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
    padding: 10px;
    margin-bottom: 10px;
    background-color: #333; /* 배경 추가 */
    border-radius: 8px;
  }

  .poster-container {
    position: relative;
    width: 100%; /* 컨테이너 전체 너비 */
    aspect-ratio: 2 / 3; /* 포스터 비율 유지 */
    background: #1a1a1a;
  }

  .movie-poster {
    width: 100%; /* 컨테이너 너비에 맞게 */
    height: 100%;
    object-fit: cover;
    border-radius: 4px;
  }

  .wishlist-badge {
    position: absolute;
    top: 8px; /* 찜 버튼 위치 */
    right: 8px;
    background: rgba(229, 9, 20, 0.8);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.9em;
    font-weight: bold;
    z-index: 2;
  }

  .movie-info {
    width: 100%; /* 텍스트가 전체 너비를 차지 */
    font-size: 0.9em;
    text-align: center; /* 가운데 정렬 */
    padding: 10px 0;
  }

  .movie-info h3 {
    font-size: 1.1em;
    margin-bottom: 8px;
  }

  .meta-info {
    display: flex;
    justify-content: space-between;
    font-size: 0.9em;
    color: #aaa;
  }

  .overview {
    font-size: 0.9em;
    color: #ddd;
    margin-top: 10px;
  }
}

@media (max-width: 480px) {
  .movie-item {
    gap: 10px;
    padding: 8px;
  }

  .poster-container {
    width: 100%; /* 480px 이하에서도 컨테이너 전체 너비 */
  }

  .wishlist-badge {
    top: 5px; /* 버튼 위치 조금 더 조정 */
    right: 5px;
    font-size: 0.8em;
    padding: 3px 6px;
  }

  .movie-info {
    font-size: 0.8em;
    padding: 5px 0;
  }

  .movie-info h3 {
    font-size: 1em;
  }

  .overview {
    font-size: 0.8em;
  }
}

.list-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.list-actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.2s ease;
}

.list-actions .info-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
}

.list-actions button:hover {
  transform: scale(1.05);
}

@media (max-width: 768px) {
  .list-actions {
    flex-direction: row;
    justify-content: flex-start;
  }
}


/* 모달 관련 스타일 추가 */
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
  font-size: 1.5em;
  border-radius: 50%;
  cursor: pointer;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
}

.close-btn:hover {
  background-color: rgba(0, 0, 0, 0.8);
}

.modal-body {
  position: relative;
  z-index: 1;
  padding: 30px;
  margin-top: 120px;
}

.modal-main-info {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 30px;
  margin-top: 30px;
}

.modal-poster {
  width: 300px;
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
  opacity: 1;
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

  .modal-poster {
    width: 200px;
    margin: 0 auto;
  }

  .modal-text-content h2.movie-title {
    font-size: 1.8em;
  }

  .modal-body {
    margin-top: 60px;
    padding: 20px;
  }
}

.tooltip {
  position: fixed;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  z-index: 1000;
  pointer-events: none;
  white-space: nowrap;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
}

.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  color: #fff;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
