// SearchOptions 인터페이스 정의
export const SearchOptions = {
  originalLanguage: '',
  translationLanguage: '',
  sorting: '',
}

// Movie 인터페이스 정의
export class Movie {
  constructor(id, title, poster_path, original_language, vote_average, backdrop_path, overview) {
    this.id = id
    this.title = title
    this.poster_path = poster_path
    this.original_language = original_language
    this.vote_average = vote_average
    this.backdrop_path = backdrop_path || null
    this.overview = overview || null
  }
}

// APIResponse 인터페이스 정의
export const APIResponse = {
  results: [],
  page: 0,
  total_pages: 0,
  total_results: 0,
}
