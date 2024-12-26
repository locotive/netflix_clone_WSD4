<template>
  <div class="home">
    <Banner v-if="featuredMovie" :movie="featuredMovie" />

    <MovieRow title="인기 영화" :fetchUrl="popularMoviesUrl" />
    <MovieRow title="최신 영화" :fetchUrl="newReleasesUrl" />
    <MovieRow title="로맨스 영화" :fetchUrl="romanceMoviesUrl" />
    <MovieRow title="평점 높은 영화" :fetchUrl="topRatedMoviesUrl" />
    <MovieRow title="개봉 예정작" :fetchUrl="upcomingMoviesUrl" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import createAPI from '@/services/apiService'
import Banner from '@/components/home/BannerComponent.vue'
import MovieRow from '@/components/home/MovieRowComponent.vue'

const featuredMovie = ref(null)
const loading = ref(false)
const error = ref(null)
const popularMoviesUrl = ref('/movie/popular')
const newReleasesUrl = ref('/movie/now_playing')
const romanceMoviesUrl = ref('/discover/movie?with_genres=10749')
const topRatedMoviesUrl = '/movie/top_rated'
const upcomingMoviesUrl = '/movie/upcoming'

const loadFeaturedAndPopular = async () => {
  try {
    loading.value = true
    const api = createAPI()
    console.log('Loading featured movies with API key:', api.defaults.params.api_key)

    const response = await api.get('/movie/popular')
    featuredMovie.value = response.data.results[0]
  } catch (err) {
    console.error('Error loading movies:', err)
    error.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadFeaturedAndPopular()
})
</script>

<style scoped>
.home {
  display: block;
}

html,
body {
  overflow-y: scroll !important;
  background-color: #141414 !important;
}
</style>
