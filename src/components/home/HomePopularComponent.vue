<template>
  <div class="popular-container">
    <!-- View Toggle Buttons -->
    <div class="view-toggle" role="tablist">
      <button
        @click="setView('grid')"
        :class="{ active: currentView === 'grid' }"
        :aria-selected="currentView === 'grid'"
        aria-label="그리드 보기"
        role="tab"
      >
        <font-awesome-icon :icon="faTh" />
      </button>
      <button
        @click="setView('list')"
        :class="{ active: currentView === 'list' }"
        :aria-selected="currentView === 'list'"
        aria-label="리스트 보기"
        role="tab"
      >
        <font-awesome-icon :icon="faBars" />
      </button>
      <button
        @click="setView('table')"
        :class="{ active: currentView === 'table' }"
        :aria-selected="currentView === 'table'"
        aria-label="테이블 보기"
        role="tab"
      >
        <font-awesome-icon :icon="faTable" />
      </button>
    </div>

    <!-- Movie Views -->
    <MovieGrid v-if="currentView === 'grid'" :fetchUrl="fetchUrl" />
    <MovieInfiniteScroll
      v-else-if="currentView === 'list'"
      :apiKey="apiKey"
      :fetchUrl="fetchUrl"
      ref="infiniteScrollRef"
    />
    <MovieTableView
      v-if="currentView === 'table'"
      :fetchUrl="fetchUrl"
    />

    <!-- Top Button (list view에서만 표시) -->
    <button
      v-show="currentView === 'list' && showTopButton"
      @click="scrollToTop"
      class="top-button"
      aria-label="맨 위로"
    >
      <font-awesome-icon :icon="faArrowUp" />
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { faTh, faBars, faTable, faArrowUp } from '@fortawesome/free-solid-svg-icons'
import MovieGrid from '@/components/views/MovieGridComponent.vue'
import MovieInfiniteScroll from '@/components/views/MovieInfiniteScrollComponent.vue'
import MovieTableView from '@/components/views/MovieTableView.vue'
import URLService from '@/services/urlService'

const currentView = ref('grid')
const showTopButton = ref(false)
const infiniteScrollRef = ref(null)

const fetchUrl = computed(() => {
  return URLService.getURL4PopularMovies()
})

const handleScroll = () => {
  if (currentView.value === 'list') {
    showTopButton.value = window.scrollY > 500

    // 무한 스크롤 로직
    const scrollHeight = document.documentElement.scrollHeight
    const scrollTop = window.scrollY
    const clientHeight = document.documentElement.clientHeight

    if (scrollHeight - scrollTop <= clientHeight + 100) {
      infiniteScrollRef.value?.loadMore()
    }
  }
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

const setView = (view) => {
  currentView.value = view
  if (view === 'table') {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = 'auto'
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.body.style.overflow = 'auto'
})
</script>

<style scoped>
.popular-container {
  max-width: 100%;
  margin: 0 auto;
  padding: 20px 0;
}

.grid-view-container {
  width: 100%;
  margin-top: 20px;
}

.view-toggle {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
  padding-right: 20px;
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
  background-color: #535bf2;
}

.view-toggle button:focus {
  outline: 2px solid #fff;
  outline-offset: 2px;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .popular-container {
    padding: 10px;
  }

  .view-toggle {
    margin-top: 30px;
  }
}

.top-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  z-index: 1000;
  transition: opacity 0.3s ease;
}

.top-button:hover {
  background-color: rgba(0, 0, 0, 0.9);
}

</style>
