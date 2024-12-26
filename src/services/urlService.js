import createAPI from './apiService'

export default {
  async fetchFeaturedMovie() {
    try {
      const api = createAPI()
      const response = await api.get('/movie/popular')
      return response.data.results[0]
    } catch (error) {
      console.error('Error fetching featured movie:', error)
    }
  },

  getURL4PopularMovies() {
    return '/movie/popular'
  },

  getURL4ReleaseMovies(page = 1) {
    return `/movie/now_playing?page=${page}`
  },

  getURL4GenreMovies(genre, page = 1) {
    return `/discover/movie?with_genres=${genre}&page=${page}`
  },

  getFilteredMoviesURL({
    page = 1,
    genre = null,
    rating = null,
    language = null,
    year = null,
    sortBy = null,
    runtime = null,
    adult = false
  }) {
    let url = '/discover/movie?'

    // 기본 필터: 한국 지역 기준
    url += 'region=KR'

    // 페이지 정보
    url += `&page=${page}`

    // 성인물 포함 여부
    url += `&include_adult=${adult}`

    // 장르 필터
    if (genre && genre !== '0') {
      url += `&with_genres=${genre}`
    }

    // 평점 필터
    if (rating > 0) {
      url += `&vote_average.gte=${rating}`
    }

    // 언어 필터
    if (language) {
      url += `&with_original_language=${language}`
    }

    // 연도 필터
    if (year) {
      url += `&primary_release_year=${year}`
    }

    // 정렬 필터
    if (sortBy) {
      url += `&sort_by=${sortBy}`
    }

    // 상영시간 필터
    if (runtime && this.runtimeRanges[runtime]) {
      const range = this.runtimeRanges[runtime]
      if (range.gte) url += `&with_runtime.gte=${range.gte}`
      if (range.lte) url += `&with_runtime.lte=${range.lte}`
    }

    console.log('Generated URL:', url)
    return url
  },

  // 장르 코드 매핑 (TMDb 공식 장르 ID)
  genreCodes: {
    '장르 (전체)': '0',
    '액션': '28',
    '모험': '12',
    '애니메이션': '16',
    '코미디': '35',
    '범죄': '80',
    '다큐멘터리': '99',
    '드라마': '18',
    '가족': '10751',
    '판타지': '14',
    '역사': '36',
    '공포': '27',
    '음악': '10402',
    '미스터리': '9648',
    '로맨스': '10749',
    'SF': '878',
    'TV 영화': '10770',
    '스릴러': '53',
    '전쟁': '10752',
    '서부': '37'
  },

  // 언어 코드 매핑 (ISO 639-1 표준)
  languageCodes: {
    '언어 (전체)': null,
    '한국어': 'ko',
    '영어': 'en',
    '일본어': 'ja',
    '중국어': 'zh',
    '프랑스어': 'fr',
    '독일어': 'de',
    '스페인어': 'es',
    '이탈리아어': 'it',
    '러시아어': 'ru'
  },

  // 정렬 코드 매핑
  sortingCodes: {
    '정렬 (기본)': 'popularity.desc',
    '인기도 높은순': 'popularity.desc',
    '인기도 낮은순': 'popularity.asc',
    '평점 높은순': 'vote_average.desc,vote_count.desc',
    '평점 낮은순': 'vote_average.asc,vote_count.desc',
    '최신순': 'primary_release_date.desc',
    '오래된순': 'primary_release_date.asc',
    '수익 높은순': 'revenue.desc',
    '수익 낮은순': 'revenue.asc',
    '제목 오름차순': 'original_title.asc',
    '제목 내림차순': 'original_title.desc'
  },

  // 연령 등급 매핑 수정
  certificationCodes: {
    'G (전체관람가)': 'G',
    'PG (12세 관람가)': 'PG',
    'PG-13 (15세 관람가)': 'PG-13',
    'R (청소년관람불가)': 'R',
    'NC-17 (성인전용)': 'NC-17'
  }
}
