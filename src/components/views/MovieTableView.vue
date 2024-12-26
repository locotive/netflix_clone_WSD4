<template>
  <div class="table-container" :style="{ height: tableHeight }">
    <table class="movie-table">
      <thead>
        <tr>
          <th>포스터</th>
          <th>제목</th>
          <th>설명</th>
          <th>개봉일</th>
          <th>평점</th>
          <th>장르</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="movie in movies" :key="movie.id">
          <td class="poster-cell">
            <img
              :src="getImageUrl(movie.poster_path, 'thumbnail')"
              :alt="movie.title"
              loading="lazy"
            />
          </td>
          <td class="title-cell">{{ movie.title }}</td>
          <td class="overview-cell">{{ movie.overview }}</td>
          <td>{{ formatDate(movie.release_date) }}</td>
          <td>
            <span class="rating">{{ movie.vote_average.toFixed(1) }}</span>
          </td>
          <td>{{ getGenres(movie.genre_ids) }}</td>
        </tr>
      </tbody>
    </table>

    <!-- 페이지네이션 -->
    <div class="pagination">
      <button @click="prevPage" :disabled="currentPage === 1">이전</button>
      <span>{{ currentPage }} / {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages">다음</button>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useMovieUtils } from '@/composables/useMovieUtils'
import createAPI from '@/services/apiService'

const props = defineProps({
  fetchUrl: {
    type: String,
    required: true
  }
})

const movies = ref([])
const currentPage = ref(1)
const totalPages = ref(0)
const { getImageUrl } = useMovieUtils()

// 장르 매핑
const genres = {
  28: '액션',
  12: '모험',
  16: '애니메이션',
  35: '코미디',
  80: '범죄',
  99: '다큐멘터리',
  18: '드라마',
  10751: '가족',
  14: '판타지',
  36: '역사',
  27: '공포',
  10402: '음악',
  9648: '미스터리',
  10749: '로맨스',
  878: 'SF',
  10770: 'TV 영화',
  53: '스릴러',
  10752: '전쟁',
  37: '서부'
}

const getGenres = (genreIds) => {
  return genreIds.map(id => genres[id]).filter(Boolean).join(', ')
}

const calculateMovieCount = () => {
  const screenHeight = window.innerHeight
  console.log('Screen Height:', screenHeight)

  let movieCount
  if (screenHeight <= 500) {
    movieCount = 1
  } else if (screenHeight <= 760) {
    movieCount = 2
  } else if (screenHeight <= 993) {
    movieCount = 3
  } else if (screenHeight <= 1150) {
    movieCount = 4
  } else if (screenHeight <= 1300) {
    movieCount = 5
  } else if (screenHeight <= 1500) {
    movieCount = 6
  } else {
    movieCount = 7
  }

  console.log('Calculated movie count:', movieCount)
  return movieCount
}

const tableHeight = ref('auto')

const fetchMovies = async () => {
  try {
    const movieCount = calculateMovieCount()
    console.log('Fetching movies with count:', movieCount)

    const response = await createAPI().get(props.fetchUrl, {
      params: {
        page: currentPage.value
      }
    })
    movies.value = response.data.results.slice(0, movieCount)
    totalPages.value = response.data.total_pages

    const rowHeight = 120
    const headerHeight = 40
    const paginationSpace = 60
    tableHeight.value = `${(movies.value.length * rowHeight) + headerHeight + paginationSpace}px`
  } catch (error) {
    console.error('Error fetching movies:', error)
  }
}

// 페이지 변경 함수
const changePage = async (page) => {
  currentPage.value = page
  await fetchMovies()
}

// 이전 페이지로 이동
const prevPage = () => {
  if (currentPage.value > 1) {
    changePage(currentPage.value - 1)
  }
}

// 다음 페이지로 이동
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    changePage(currentPage.value + 1)
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('ko-KR')
}

// 페면 크기 변경 감지
const handleResize = () => {
  fetchMovies() // 화면 크기 변경 시 다시 계산하고 가져오기
}

onMounted(() => {
  fetchMovies()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.table-container {
  transition: height 0.3s ease;
  overflow: visible;
  position: relative;
  margin-bottom: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: rgba(0, 0, 0, 0.2);
  table-layout: fixed;
  margin-bottom: 20px;
}

/* thead 스타일 별도 지정 */
thead th {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #2c2c2c;
  height: 50px; /* 헤더 높이 축소 */
  vertical-align: middle;
}

/* tbody 스타일 */
tbody td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #2c2c2c;
  height: 120px;
  vertical-align: top;
}

.overview-cell {
  height: 120px;
  overflow: hidden;
  line-height: 1.5;
  word-break: keep-all;
  white-space: normal;
  position: relative;
}

.overview-cell::after {
  content: '';
  position: absolute;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 20px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.2));
}

/* 각 컬럼 너비 조정 */
th:nth-child(1), td:nth-child(1) { width: 80px; }  /* 포스터 */
th:nth-child(2), td:nth-child(2) { width: 100px; } /* 제목 */
th:nth-child(3), td:nth-child(3) { width: 500px; } /* 설명 */
th:nth-child(4), td:nth-child(4) { width: 100px; } /* 개봉일 */
th:nth-child(5), td:nth-child(5) { width: 80px; }  /* 평점 */
th:nth-child(6), td:nth-child(6) { width: 150px; } /* 장르 */

.poster-cell img {
  width: 70px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
}

.title-cell {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rating {
  background-color: #535bf2;
  padding: 4px 8px;
  border-radius: 4px;
}

.pagination {
  position: relative;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 15px 0;
  display: flex;
  justify-content: center;
  gap: 10px;
  z-index: 10;
}

.page-numbers {
  display: flex;
  gap: 5px;
}

.page-btn {
  padding: 8px 16px;
  background-color: rgba(0, 0, 0, 0.3);
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-btn.active {
  background-color: #535bf2;
}

/* 모바일 대응 */
@media (max-width: 768px) {
  table {
    table-layout: auto;
  }

  thead th:nth-child(n+3),
  tbody td:nth-child(n+3) {
    display: none; /* 포스터와 제목 외의 컬럼 숨김 */
  }

  th:nth-child(1),
  td:nth-child(1) {
    width: 50%; /* 포스터가 절반 너비 */
  }

  th:nth-child(2),
  td:nth-child(2) {
    width: 50%; /* 제목이 절반 너비 */
  }

  .poster-cell img {
    width: 60px; /* 모바일에서 더 작게 */
    height: 90px; /* 모일에서 더 작게 */
    object-fit: cover;
    border-radius: 4px;
  }

  .table-container {
    padding: 10px;
  }

  .pagination {
    padding: 10px 0;
  }

  .pagination button {
    padding: 6px 12px;
    font-size: 0.9em;
  }

  .movie-table td {
    max-width: 400px; /* 설명 텍스트 최대 너비 제한 */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap; /* 한 줄로 제한 */
}
}

@media (max-height: 500px) {
  .movie-table td {
    padding: 5px;
  }
  .movie-poster {
    width: 50px;
    height: 75px;
  }
}

@media (min-height: 501px) and (max-height: 760px) {
  .movie-table td {
    padding: 8px;
  }
  .movie-poster {
    width: 60px;
    height: 90px;
  }
}

</style>
