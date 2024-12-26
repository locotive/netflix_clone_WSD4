<template>
  <div class="wishlist-container">
    <!-- 뷰 토글 버튼 -->
    <div class="view-toggle">
      <button @click="currentView = 'grid'" :class="{ active: currentView === 'grid' }">
        <font-awesome-icon :icon="faTh" />
      </button>
      <button @click="currentView = 'list'" :class="{ active: currentView === 'list' }">
        <font-awesome-icon :icon="faBars" />
      </button>
    </div>

    <div v-if="wishlist.length === 0" class="empty-message">위시리스트가 비어 있습니다.</div>

    <template v-else>
      <!-- 그리드 뷰 -->
      <div v-if="currentView === 'grid'" class="movie-grid">
        <div class="grid-container">
          <div class="movie-row">
            <div v-for="movie in wishlist" :key="movie.id" class="movie-card">
              <div class="poster-container" @click="toggleWishlist(movie)">
                <div v-if="!movie.imageLoaded" class="loading-overlay">
                  <div class="loading-spinner"></div>
                </div>
                <img
                  :src="getImageUrl(movie.poster_path)"
                  :alt="movie.title"
                  @load="movie.imageLoaded = true"
                  :class="{ 'loaded': movie.imageLoaded }"
                />
                <div class="remove-overlay">
                  <font-awesome-icon :icon="faHeart" class="heart-icon" />
                  <span>찜 해제</span>
                </div>
              </div>
              <div class="movie-title">{{ movie.title }}</div>
              <div class="grid-actions">
                <button class="grid-info-btn" @click.stop="showMovieDetails(movie)">
                  상세정보
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 리스트 뷰 -->
      <div v-else class="list-view">
        <div v-for="movie in wishlist" :key="movie.id" class="list-item">
          <img :src="getImageUrl(movie.poster_path)" :alt="movie.title" class="list-poster" />
          <div class="list-content">
            <h3>{{ movie.title }}</h3>
            <div class="list-meta">
              <span>{{ movie.release_date?.split('-')[0] }}</span>
              <span v-if="movie.runtime">{{ movie.runtime }}분</span>
              <span>⭐ {{ movie.vote_average?.toFixed(1) }}</span>
            </div>
            <p class="list-overview">{{ movie.overview }}</p>
          </div>
          <div class="list-actions">
            <button class="info-btn" @click="showMovieDetails(movie)">
              <font-awesome-icon :icon="faInfoCircle" /> 상세정보
            </button>
            <button class="remove-btn" @click="toggleWishlist(movie)">
              <font-awesome-icon :icon="faHeart" /> 찜해제
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- 모달 -->
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
import { ref } from 'vue'
import { useWishlist } from '@/services/wishlistService'
import {
  faHeart,
  faTh,
  faBars,
  faTimes,
  faStar,
} from '@fortawesome/free-solid-svg-icons'

const currentView = ref('grid')
const selectedMovie = ref(null)
const { wishlist, toggleWishlist } = useWishlist()

function getImageUrl(path) {
  return path ? `https://image.tmdb.org/t/p/w300${path}` : '/placeholder.jpg'
}

function showMovieDetails(movie) {
  selectedMovie.value = movie
}

function closeModal() {
  selectedMovie.value = null
}
</script>

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

.movie-grid {
  width: 100%;
  margin-bottom: 40px;
  margin-top: 30px;
  display: flex;
  flex-direction: column;
}

.grid-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  padding: 0 20px;
}

.movie-row {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin: 0 auto 40px;
  width: 100%;
  max-width: 2000px;
  flex-wrap: wrap;
  padding: 0 20px;
}

.movie-card {
  width: 300px;
  min-width: 300px;
  margin: 0;
  transition: transform 0.3s;
  position: relative;
}

.movie-card:hover {
  transform: scale(1.1);
  z-index: 1;
}

.movie-card img {
  width: 100%;
  height: auto;
  aspect-ratio: 27/40;
  border-radius: 8px;
  object-fit: cover;
}

.poster-container {
  position: relative;
  cursor: pointer;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.poster-container:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.remove-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  color: white;
}

.remove-overlay .heart-icon {
  font-size: 2em;
  color: #e50914;
  margin-bottom: 10px;
}

.poster-container:hover .remove-overlay {
  opacity: 1;
}

.wishlist-indicator {
  position: absolute;
  top: 10px;
  right: 10px;
  color: #e50914;
  background: rgba(0, 0, 0, 0.5);
  padding: 5px;
  border-radius: 50%;
}

.info-btn {
  width: 100%;
  padding: 8px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.info-btn:hover {
  background: rgba(255, 255, 255, 0.2);
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

.movie-title {
  margin-top: 5px;
  text-align: center;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 8px;
  line-height: 1.2;
  color: #fff;
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
    margin-top: 100px;
  }

  .modal-poster {
    width: 200px;
    margin: 0 auto;
  }

  .movie-title {
    font-size: 1.8em;
  }
}

.empty-message {
  text-align: center;
  padding: 40px;
  font-size: 1.2em;
  color: #666;
}

@media (max-width: 1200px) {
  .movie-card {
    width: 300px;
  }
}

@media (max-width: 992px) {
  .movie-card {
    width: 300px;
  }
}

@media (max-width: 768px) {
  .movie-card {
    width: 300px;
  }
}

@media (max-width: 480px) {
  .movie-card {
    width: 300px;
  }
  .movie-row {
    justify-content: center;
  }
}

/* 뷰 토글 버튼 스타일 수정 */
.view-toggle {
  display: flex;
  justify-content: flex-end;
  margin: 20px 0 30px;
  padding: 0 20px;
}

.view-toggle button {
  background-color: #333;
  color: white;
  border: none;
  padding: 10px 15px;
  margin-left: 10px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.view-toggle button.active {
  background-color: #535bf2; /* Popular 컴포넌트와 동일한 활성 색상 */
}

.view-toggle button:focus {
  outline: 2px solid #fff;
  outline-offset: 2px;
}

/* 반응형 스타일 */
@media (max-width: 768px) {
  .view-toggle {
    margin-top: 30px;
  }
}

/* 리스트 뷰 스타일 */
.list-view {
  padding: 0 20px;
  margin-top: 20px;
}

.list-item {
  display: flex;
  gap: 20px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  margin-bottom: 15px;
  transition: transform 0.2s ease;
}

.list-item:hover {
  transform: scale(1.01);
  background: rgba(255, 255, 255, 0.08);
}

.list-poster {
  width: 100px;
  height: 150px;
  object-fit: cover;
  border-radius: 4px;
}

.list-content {
  flex: 1;
}

.list-content h3 {
  margin: 0 0 10px 0;
  font-size: 1.2em;
}

.list-meta {
  display: flex;
  gap: 15px;
  color: #999;
  margin-bottom: 10px;
}

.list-overview {
  color: #ccc;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 0;
}

.list-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: center;
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
}

.list-actions .remove-btn {
  background: rgba(229, 9, 20, 0.8);
  color: white;
}

.list-actions button:hover {
  transform: scale(1.05);
}

/* 반응형 스타일 */
@media (max-width: 768px) {
  .list-item {
    flex-direction: column;
  }

  .list-poster {
    width: 100%;
    height: 100%;
  }

  .list-actions {
    flex-direction: row;
    justify-content: flex-end;
  }
}

/* 그리드 뷰 버튼 스타일 수정 */
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

/* 호버 시에도 제목 크기 유지 */
.movie-card:hover .movie-title {
  font-size: 14px;
}

/* 2. 모달 내 영화 제목 스타일 분리 */
/* 그리드 뷰의 영화 제목 (기존 유지) */
.movie-title {
  margin-top: 5px;
  text-align: center;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 8px;
  line-height: 1.2;
  color: #fff;
}

/* 모달 내 영화 제목 새로운 스타일 */
.modal-text-content h2.movie-title {
  font-size: 2.5em;
  margin: 0 0 15px 0;
  padding: 0;
  text-align: left;
  white-space: normal;
  line-height: 1.2;
  color: white;
  overflow: visible;
  text-overflow: clip;
}

/* 모달 내 다른 스타일들은 유지 */
.modal-main-info {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 30px;
  margin-top: 150px;
}

/* 모바일 반응형 스타일 */
@media (max-width: 768px) {
  .modal-text-content h2.movie-title {
    font-size: 1.8em;
  }
}

/* 그리드 뷰 스타일 수정 */
.movie-grid {
  margin-top: 20px;
}

.movie-card:hover img {
  transform: scale(1.1);  /* 1.2에서 1.1로 축소 */
  transition: transform 0.3s ease;
}

</style>
