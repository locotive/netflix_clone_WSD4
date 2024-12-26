# API 문서

## TMDB API 연동 가이드

### 기본 설정
- Base URL: `https://api.themoviedb.org/3`
- 인증: 비밀번호로 입력한 TMDB API 키 사용
- 이미지 Base URL: `https://image.tmdb.org/t/p/`

### 주요 엔드포인트

#### 1. 인기 영화 목록
```
GET /movie/popular
```
- 설명: 현재 인기있는 영화 목록을 가져옵니다
- 파라미터:
  - page: 페이지 번호 (기본값: 1)
- 응답 예시:
```json
{
  "page": 1,
  "results": [
    {
      "id": 123,
      "title": "영화 제목",
      "poster_path": "/path/to/poster.jpg",
      "overview": "영화 설명",
      "release_date": "2024-01-01",
      "vote_average": 8.5
    }
  ],
  "total_pages": 500
}
```

#### 2. 영화 상세 정보
```
GET /movie/{movie_id}
```
- 설명: 특정 영화의 상세 정보를 가져옵니다
- 응답에 포함된 정보:
  - 제목, 설명, 개봉일
  - 평점, 장르
  - 포스터 및 배경 이미지

#### 3. 장르별 영화 목록
```
GET /discover/movie
```
- 파라미터:
  - with_genres: 장르 ID
  - sort_by: 정렬 기준
  - page: 페���지 번호

### 이미지 URL 구성
- 포스터 이미지: `https://image.tmdb.org/t/p/w500/{poster_path}`
- 배경 이미지: `https://image.tmdb.org/t/p/original/{backdrop_path}`
- 썸네일: `https://image.tmdb.org/t/p/w200/{poster_path}`
