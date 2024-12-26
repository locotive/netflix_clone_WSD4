<template>
  <div class="search-container">
    <div class="filter-status" v-if="hasActiveFilters">
      <div class="active-filters">
        <span v-for="(value, key) in getActiveFilters"
              :key="key"
              class="filter-tag">
          {{ value }}
          <button @click="clearFilter(key)" class="clear-filter">×</button>
        </span>
      </div>
      <button @click="resetAllFilters" class="reset-button">
        필터 초기화
      </button>
    </div>

    <div class="dropdown-group">
      <div v-for="(options, key) in dropdowns" :key="key" class="dropdown">
        <button @click="toggleDropdown(key)" class="dropdown-button">
          {{ selectedOptions[key] || `Select ${key}` }}
        </button>
        <div v-if="activeDropdown === key" class="dropdown-content">
          <div
            v-for="option in options"
            :key="option"
            @click="selectOption(key, option)"
            class="dropdown-item"
          >
            {{ option }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import createAPI from '@/services/apiService'

const emit = defineEmits(['changeOptions'])
const activeDropdown = ref(null)

const genres = ref([])
const loading = ref(false)

const fetchGenres = async () => {
  try {
    loading.value = true
    const api = createAPI()
    const response = await api.get('/genre/movie/list')
    genres.value = response.data.genres
  } catch (error) {
    console.error('Error fetching genres:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchGenres()
})

const dropdowns = {
  genre: [
    '장르 (전체)',
    '액션',
    '모험',
    '애니메이션',
    '코미디',
    '범죄',
    '다큐멘터리',
    '드라마',
    '가족',
    '판타지',
    '역사',
    '공포',
    '음악',
    '미스터리',
    '로맨스',
    'SF',
    'TV 영화',
    '스릴러',
    '전쟁',
    '서부'
  ],
  rating: [
    '평점 (전체)',
    '9점 이상',
    '8점 이상',
    '7점 이상',
    '6점 이상',
    '5점 이상',
    '4점 이상',
    '3점 이상'
  ],
  language: [
    '언어 (전체)',
    '한국어',
    '영어',
    '일본어',
    '중국어',
    '프랑스어',
    '독일어',
    '스페인어',
    '이탈리아어',
    '러시아어'
  ],
  year: [
    '연도 (전체)',
    '2024',
    '2023',
    '2022',
    '2021',
    '2020',
    '2019',
    '2018',
    '2017',
    '2016',
    '2015'
  ],
  sort: [
    '정렬 (기본)',
    '인기도 높은순',
    '인기도 낮은순',
    '평점 높은순',
    '평점 낮은순',
    '최신순',
    '오래된순',
    '수익 높은순',
    '수익 낮은순',
    '제목 오름차순',
    '제목 내림차순'
  ],
  runtime: [
    '상영시간 (전체)',
    '60분 이하',
    '60-90분',
    '90-120분',
    '120-150분',
    '150분 이상'
  ],
  adult: [
    '성인물 제외',
    '성인물 포함'
  ]
}

const selectedOptions = reactive({
  genre: '장르 (전체)',
  rating: '평점 (전체)',
  language: '언어 (전체)',
  year: '연도 (전체)',
  sort: '정렬 (기본)',
  runtime: '상영시간 (전체)',
  adult: '성인물 제외'
})

function toggleDropdown(key) {
  activeDropdown.value = activeDropdown.value === key ? null : key
}

function selectOption(key, option) {
  selectedOptions[key] = option
  activeDropdown.value = null

  emit('changeOptions', {
    genre: selectedOptions.genre,
    rating: selectedOptions.rating,
    language: selectedOptions.language,
    year: selectedOptions.year,
    sort: selectedOptions.sort,
    runtime: selectedOptions.runtime,
    adult: selectedOptions.adult
  })
}

const initialFilters = {
  genre: '장르 (전체)',
  rating: '평점 (전체)',
  language: '언어 (전체)',
  year: '연도 (전체)',
  sort: '정렬 (기본)',
  runtime: '상영시간 (전체)',
  adult: '성인물 제외'
}

const hasActiveFilters = computed(() => {
  return Object.entries(selectedOptions).some(([key, value]) => {
    return value !== initialFilters[key]
  })
})

const getActiveFilters = computed(() => {
  return Object.entries(selectedOptions)
    .filter(([key, value]) => value !== initialFilters[key])
    .reduce((acc, [key, value]) => {
      acc[key] = value
      return acc
    }, {})
})

function clearFilter(key) {
  selectedOptions[key] = initialFilters[key]
  emit('changeOptions', selectedOptions)
}

function resetAllFilters() {
  Object.keys(selectedOptions).forEach(key => {
    selectedOptions[key] = initialFilters[key]
  })
  emit('changeOptions', selectedOptions)
}
</script>

<style scoped>
.search-container {
  width: 100%;
  max-width: 2000px;
  margin: 0 auto;
  padding: 20px;
}

.dropdown-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  width: 100%;
}

.dropdown {
  position: relative;
  width: 100%;
}

.dropdown-button {
  width: 100%;
  padding: 12px 15px;
  background: #333;
  border: 1px solid #555;
  border-radius: 4px;
  cursor: pointer;
  text-align: left;
  color: white;
  font-size: 1rem;
}

.dropdown-button:hover {
  background: #444;
}

.dropdown-content {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: #333;
  border: 1px solid #555;
  border-radius: 4px;
  z-index: 99;
  max-height: 300px;
  overflow-y: auto;
}

.dropdown-item {
  color: white;
  padding: 12px 15px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s ease;
}

.dropdown-item:hover {
  background-color: #444;
  color: #fff;
}

/* 스크롤바 스타일링 */
.dropdown-content::-webkit-scrollbar {
  width: 8px;
}

.dropdown-content::-webkit-scrollbar-track {
  background: #333;
}

.dropdown-content::-webkit-scrollbar-thumb {
  background: #666;
  border-radius: 4px;
}

.dropdown-content::-webkit-scrollbar-thumb:hover {
  background: #888;
}

/* 모바일 대응 */
@media (max-width: 768px) {
  .dropdown-group {
    grid-template-columns: 1fr;
  }

  .dropdown-button {
    padding: 15px;
    font-size: 1.1rem;
  }

  .dropdown-item {
    padding: 15px;
    font-size: 1.1rem;
  }
}

.filter-status {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.active-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-tag {
  background: #444;
  padding: 6px 12px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.clear-filter {
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  padding: 0 4px;
}

.reset-button {
  background: #535bf2;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.reset-button:hover {
  background: #4347d9;
}
</style>
