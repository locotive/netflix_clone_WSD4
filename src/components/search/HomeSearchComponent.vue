<template>
  <div class="container-search">
    <MovieSearch @changeOptions="changeOptions" />
    <MovieInfiniteScroll
      :fetchUrl="getFilteredMoviesURL"
      :genreCode="genreId"
      :sortingOrder="sortId"
      :voteAverage="voteAverageId"
      :year="yearId"
      :runtime="runtimeId"
      :language="languageId"
      :adult="adultId"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import MovieSearch from './MovieSearchComponent.vue'
import MovieInfiniteScroll from '../views/MovieInfiniteScrollComponent.vue'
import urlService from '@/services/urlService'

const genreId = ref('0')
const voteAverageId = ref(-1)
const sortId = ref('popularity.desc')
const yearId = ref(null)
const runtimeId = ref(null)
const languageId = ref(null)
const adultId = ref(false)

// URL 생성을 computed로 변경
const getFilteredMoviesURL = computed(() => {
  return urlService.getFilteredMoviesURL({
    genre: genreId.value,
    rating: voteAverageId.value,
    language: languageId.value,
    year: yearId.value,
    sortBy: sortId.value,
    runtime: runtimeId.value,
    adult: adultId.value
  })
})

function changeOptions(options) {
  console.log('Before update - Current values:', {
    genre: genreId.value,
    rating: voteAverageId.value,
    sort: sortId.value,
    year: yearId.value,
    runtime: runtimeId.value,
    language: languageId.value,
    adult: adultId.value
  })

  // 장르 설정
  genreId.value = options.genre !== '장르 (전체)' ?
    urlService.genreCodes[options.genre] : '0'

  // 평점 설정
  const ratingRanges = {
    '평점 (전체)': -1,
    '9점 이상': 9,
    '8점 이상': 8,
    '7점 이상': 7,
    '6점 이상': 6,
    '5점 이상': 5,
    '4점 이상': 4,
    '3점 이상': 3
  }
  voteAverageId.value = ratingRanges[options.rating] || -1

  // 정렬 설정
  sortId.value = urlService.sortingCodes[options.sort] || 'popularity.desc'

  // 연도 설정
  yearId.value = options.year === '연도 (전체)' ? null : options.year

  // 상영시간 설정
  runtimeId.value = options.runtime === '상영시간 (전체)' ? null : options.runtime

  // 언어 설정
  languageId.value = urlService.languageCodes[options.language]

  // 성인물 포함 여부만 설정
  adultId.value = options.adult === '성인물 포함'

  console.log('After update - New values:', {
    genre: genreId.value,
    rating: voteAverageId.value,
    sort: sortId.value,
    year: yearId.value,
    runtime: runtimeId.value,
    language: languageId.value,
    adult: adultId.value
  })
}
</script>

<style scoped>
.container-search {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding: 20px 0;
}
</style>
