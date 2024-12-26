<template>
  <div class="movie-grid" ref="gridContainer">
    <div :class="['grid-container', currentView]">
      <div
        v-for="(movieGroup, i) in visibleMovieGroups"
        :key="i"
        :class="['movie-row', { full: movieGroup.length === rowSize }]"
      >
        <div
          v-for="movie in movieGroup"
          :key="movie.id"
          class="movie-card"
        >
          <div class="image-wrapper" @click="handleWishlistToggle(movie)">
            <div v-if="!movie.imageLoaded" class="loading-overlay">
              <div class="loading-spinner"></div>
            </div>
            <img
              :src="getImageUrl(movie.poster_path)"
              :alt="movie.title"
              @load="movie.imageLoaded = true"
              loading="lazy"
            />
          </div>
          <h3 class="movie-title">{{ movie.title }}</h3>
          <div v-if="isInWishlist(movie.id)" class="wishlist-badge">
            <span>👍</span>
          </div>
          <div class="grid-actions">
            <button class="grid-info-btn" @click="handleInfoClick($event, movie)">
              상세정보
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 모달은 그대로 유지 -->
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

    <!-- 페이지네이션 버튼 추가 -->
    <div class="pagination">
      <button @click="prevPage" :disabled="currentPage === 1">이전</button>
      <span>{{ currentPage }} / {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages">다음</button>
    </div>
  </div>
</template>

<style scoped>
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

.wishlist-indicator {
  position: absolute;
  top: 0;
  right: 10px;
  font-size: 20px;
  background-color: rgba(229, 9, 20, 0.5);
  box-shadow: 0 0 5px rgba(229, 9, 20, 0.7);
}

.movie-card.in-wishlist::after {
  content: '찜됨';
  position: absolute;
  top: 16px;
  right: 16px;
  background: #e50914;  /* Netflix 레드 컬러 */
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  z-index: 3;
  transition: all 0.3s ease;
  animation: popIn 0.3s ease;
}

.movie-card:hover.in-wishlist::after {
  transform: scale(1.1);
  background: #ff0f1f;  /* 좀 더 밝은 레드 */
}

@keyframes popIn {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}


.movie-card {
  width: calc(16.666% - 25px);
  min-width: 200px;
  margin: 0 0 20px 0;
  position: relative;
  display: flex;
  flex-direction: column;
}

.grid-container {
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  padding: 20px;
}

.movie-row {
  display: flex;
  gap: 30px;
  margin: 0 auto 40px;
  width: 100%;
  max-width: 2000px;
  flex-wrap: wrap;
  padding: 0 20px;
}

.grid-container.list .movie-row {
  flex-direction: column;
}

.movie-card {
  position: relative;
  min-width: 200px;
  aspect-ratio: 2/3;
}

.grid-container.list .movie-card {
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.movie-card img {
  width: 100%;
  height: auto;
  aspect-ratio: 27/40;
  border-radius: 8px;
  object-fit: cover;
}

.movie-title {
  margin: 8px 0;
  text-align: center;
  font-size: 0.9rem;
  color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  min-height: 2.4em;
  line-height: 1.2;
  padding: 0 5px;
}

.movie-card:hover .movie-title {
  color: #535bf2;
}

.grid-container.list .movie-title {
  text-align: left;
  white-space: normal;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  gap: 15px;
}

.pagination button {
  background-color: #333;
  color: white;
  border: none;
  padding: 10px 15px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.pagination button:hover:not(:disabled) {
  background-color: #444;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination span {
  color: #fff;
  font-size: 1.1em;
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
  z-index: 1000;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-left-color: #e50914;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.movie-card.in-wishlist {
  position: relative;
}

.movie-card.in-wishlist::after {
  content: '찜됨';
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(229, 9, 20, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9rem;
  z-index: 2;
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

/* 모바일 대응 */
@media (max-width: 1200px) {
  .grid-container {
    grid-template-columns: repeat(4, 1fr);
    gap: 15px;
  }
}

@media (max-width: 992px) {
  .grid-container {
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
  }
}

@media (max-width: 480px) {
  .grid-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    padding: 10px;
  }
  .movie-row {
  display: grid; /* grid 레이아웃 사용 */
  grid-auto-rows: auto; /* 행 높이는 콘텐츠에 따라 자동 */
  gap: 30px; /* 열과 행 간격 */
  margin: 0 auto 40px; /* 중앙 정렬 */
  width: 100%; /* 부모 요소 전체 너비 */
  max-width: 2000px; /* 최대 너비 제한 */
  padding: 0 20px; /* 양쪽 여백 */
}

  .movie-card {
    min-width: 300px;
  }
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

.movie-card:hover .grid-actions {
  opacity: 1;
  transform: translateY(-5px);
}

.image-wrapper {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  aspect-ratio: 2/3;
}

.movie-card:hover .image-wrapper {
  transform: none;
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

.image-wrapper {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  aspect-ratio: 2/3;
}

.movie-card:hover .image-wrapper {
  transform: none;
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
.movie-card {
  width: calc(16.666% - 25px);
  margin: 0;
  transition: transform 0.3s;
  position: relative;
}

.movie-card:hover {
  transform: scale(1.2);
  z-index: 1;
}

.movie-card img {
  width: 100%;
  height: auto;
  aspect-ratio: 27/40;
  border-radius: 8px;
  object-fit: cover;
}
.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-left-color: #e50914;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@media (max-width: 768px) {
  .grid-actions {
    opacity: 1;
    position: absolute;
    bottom: 10px;
    right: 10px;
    transform: none;
  }

  .movie-card:hover .grid-actions {
    transform: none;
  }

  .grid-info-btn {
    padding: 6px 12px;
    font-size: 0.8em;
    background: rgba(180, 180, 180, 0.9);
  }
}
</style>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import createAPI from '@/services/apiService'
import { useWishlist } from '@/services/wishlistService'
import { faTimes, faStar } from '@fortawesome/free-solid-svg-icons'
import { useMovieUtils } from '@/composables/useMovieUtils'
import { movieService } from '@/services/api/movieService'

const props = defineProps({
  fetchUrl: {
    type: String,
    required: true
  }
})

const gridContainer = ref(null)
const movies = ref([])
const currentPage = ref(1)
const rowSize = ref(2)
const moviesPerPage = ref(24)
const currentView = ref('grid')

const { toggleWishlist, isInWishlist } = useWishlist()
const { isMobile, isLoading, getImageUrl, cleanup } = useMovieUtils()

const fetchMovies = async () => {
  try {
    isLoading.value = true
    const api = createAPI()
    const requests = Array.from({ length: 10 }, (_, i) => i + 1).map(page =>
      api.get(props.fetchUrl, { params: { page } })
    )
    const responses = await Promise.all(requests)

    movies.value = responses.flatMap(response => response.data.results)
  } catch (error) {
    console.error('Error fetching movies:', error)
  } finally {
    isLoading.value = false
  }
}

const visibleMovieGroups = computed(() => {
  const startIndex = (currentPage.value - 1) * moviesPerPage.value
  const endIndex = startIndex + moviesPerPage.value

  console.log('Current page:', currentPage.value)
  console.log('Start index:', startIndex, 'End index:', endIndex)

  const paginatedMovies = movies.value.slice(startIndex, endIndex)
  console.log('Paginated movies:', paginatedMovies)

  return paginatedMovies.reduce((resultArray, item, index) => {
    const groupIndex = Math.floor(index / rowSize.value)
    console.log('Group index:', groupIndex, 'Item:', item)

    if (!resultArray[groupIndex]) resultArray[groupIndex] = []
    resultArray[groupIndex].push(item)
    return resultArray
  }, [])
})


const totalPages = computed(() => Math.ceil(movies.value.length / moviesPerPage.value))

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++
}

function prevPage() {
  if (currentPage.value > 1) currentPage.value--
}

function calculateLayout() {
  if (gridContainer.value) {
    rowSize.value = isMobile.value ? 3 : 6
    const numberOfRows = 4
    moviesPerPage.value = rowSize.value * numberOfRows
  }
}

onMounted(async () => {
  await fetchMovies()
  calculateLayout()
})

onBeforeUnmount(() => {
  cleanup()
})

const selectedMovie = ref(null)

async function showMovieDetails(movie) {
  try {
    selectedMovie.value = await movieService.getMovieDetails(movie.id)
  } catch (error) {
    console.error('Error fetching movie details:', error)
  }
}

function closeModal() {
  selectedMovie.value = null
}

function handleWishlistToggle(movie) {
  toggleWishlist(movie)
}

// 이벤트 전파 중단을 위한 stop 수정자 추가
function handleInfoClick(event, movie) {
  event.stopPropagation()
  showMovieDetails(movie)
}
</script>
