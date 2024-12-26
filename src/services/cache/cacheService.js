const CACHE_DURATION = 30 * 60 * 1000 // 30분

export const cacheService = {
  set(key, data) {
    const cacheData = {
      data,
      timestamp: Date.now()
    }
    localStorage.setItem(key, JSON.stringify(cacheData))
  },

  get(key) {
    const cached = localStorage.getItem(key)
    if (!cached) return null

    const { data, timestamp } = JSON.parse(cached)
    const isExpired = Date.now() - timestamp > CACHE_DURATION

    if (isExpired) {
      localStorage.removeItem(key)
      return null
    }

    return data
  },

  clear() {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('movie_cache_')) {
        localStorage.removeItem(key)
      }
    })
  }
}
