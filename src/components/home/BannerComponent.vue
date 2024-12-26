<template>
  <div v-if="movie" class="banner" :style="bannerStyle">
    <div v-if="!bannerLoaded" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>
    <div class="banner-content" v-show="bannerLoaded">
      <h1>{{ movie.title }}</h1>
      <p>{{ movie.overview }}</p>
      <div class="button-group">
        <button class="play-btn title-btn" @click="handleWishlistToggle(movie)">
          <font-awesome-icon :icon="faHeart" :class="{ 'active': isInWishlist(movie.id) }" />
          {{ isInWishlist(movie.id) ? '찜 해제' : '찜하기' }}
        </button>
        <button class="info-btn title-btn" @click="showMovieDetails">상세 정보</button>
      </div>
    </div>
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
          <div class="modal-poster-container">
            <div v-if="!modalImageLoaded" class="loading-overlay">
              <div class="loading-spinner"></div>
            </div>
            <img
              :src="`https://image.tmdb.org/t/p/original${selectedMovie.poster_path}`"
              :alt="selectedMovie.title"
              class="modal-poster"
              @load="modalImageLoaded = true"
            />
          </div>
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
</template>

<script setup>
import { computed, ref } from 'vue'
import { faHeart, faTimes, faStar } from '@fortawesome/free-solid-svg-icons'
import { useWishlist } from '@/services/wishlistService'

const props = defineProps({
  movie: {
    type: Object,
    required: true
  }
})

const bannerLoaded = ref(false)
const modalImageLoaded = ref(false)
const { toggleWishlist: toggleWishlistService, isInWishlist } = useWishlist()
const selectedMovie = ref(null)

const bannerStyle = computed(() => ({
  backgroundSize: 'cover',
  backgroundImage: `url("https://image.tmdb.org/t/p/original${props.movie?.backdrop_path}")`,
  backgroundPosition: 'center center',
  position: 'relative'
}))

function onBannerImageLoad() {
  bannerLoaded.value = true
}

const bannerImage = new Image()
bannerImage.onload = onBannerImageLoad
bannerImage.src = `https://image.tmdb.org/t/p/original${props.movie?.backdrop_path}`

function handleWishlistToggle(movie) {
  toggleWishlistService(movie)
}

function showMovieDetails() {
  selectedMovie.value = props.movie
  modalImageLoaded.value = false
}

function closeModal() {
  selectedMovie.value = null
  modalImageLoaded.value = false
}
</script>

<style scoped>
/* 배너 스타일 */
.banner {
  width: 100%;
  height: 50vh;
  background-size: cover;
  background-position: center;
  color: white;
  display: flex;
  align-items: flex-end;
  margin: 0;
  border-radius: 0;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
}

.banner-content {
  padding: 30px 60px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.banner h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.8);
}

.banner p {
  font-size: 1rem;
  max-width: 70%;
  margin-bottom: 1.5rem;
  text-align: left;
  line-height: 1.5;
}

.button-group {
  display: flex;
  gap: 10px;
}

.play-btn,
.info-btn {
  padding: 12px 25px;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.play-btn {
  background-color: white;
  color: black;
}

.play-btn:hover {
  background-color: #e5e5e5;
}

.info-btn {
  background-color: rgba(109, 109, 110, 0.7);
  color: white;
}

.info-btn:hover {
  background-color: rgba(109, 109, 110, 1);
}

@media screen and (max-width: 1024px) {
  .banner {
    width: 100%;
    height: 40vh;
  }

  .banner-content {
    padding: 20px;
  }

  .banner h1 {
    font-size: 2rem;
  }

  .banner p {
    font-size: 0.9rem;
    max-width: 80%;
  }

  .play-btn,
  .info-btn {
    padding: 10px 20px;
    font-size: 0.9rem;
  }
}

@media screen and (max-width: 768px) {
  .banner {
    height: 35vh;
  }

  .banner h1 {
    font-size: 1.8rem;
  }

  .banner p {
    font-size: 0.8rem;
  }

  .play-btn,
  .info-btn {
    padding: 8px 18px;
    font-size: 0.8rem;
  }
}

/* MovieWishlistComponent의 모달 스타일 복사 */
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
  padding: 0;
  text-align: left;
  white-space: normal;
  line-height: 1.2;
  color: white;
  overflow: visible;
  text-overflow: clip;
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

  .modal-text-content h2.movie-title {
    font-size: 1.8em;
  }
}

/* 기존 스타일 유지하고 찜하기 버튼 스타일 추가 */
.banner-button.wishlist {
  background-color: rgba(255, 255, 255, 0.9);
  color: #1a1a1a;
}

.banner-button.wishlist:hover {
  background-color: rgba(255, 255, 255, 1);
}

.banner-button.wishlist .active {
  color: #e50914;
}

.banner-button.wishlist:hover .active {
  color: #ff0f1f;
}

/* 로딩 인디케이터 스타일 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .banner {
    width: 100%;
    height: 40vh;
  }

  .banner-content {
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
  }

  .banner:hover .banner-content {
    opacity: 1;
  }

  .banner-content .overview {
    display: none;
  }

  .movie-title {
    color: white;
    font-size: 1.8rem;
    text-align: center;
    padding: 15px;
    background: rgba(0, 0, 0, 0.7);
    border-radius: 8px;
    margin: 0;
  }
}
</style>
