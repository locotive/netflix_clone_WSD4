import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import Toast from "vue-toastification"
import "vue-toastification/dist/index.css"

// FontAwesome 설정
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faSearch, faUser, faTicket, faBars, faTimes } from '@fortawesome/free-solid-svg-icons'
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons'
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons'

// FontAwesome 아이콘 라이브러리에 추가
library.add(faSearch, faUser, faTicket, faBars, faTimes, regularHeart, solidHeart)

// Vue 애플리케이션 생성
const app = createApp(App)
const pinia = createPinia()

// Pinia 및 라우터 사용
app.use(pinia)
app.use(router)

// FontAwesomeIcon 컴포넌트를 글로벌 등록
app.component('font-awesome-icon', FontAwesomeIcon)

// Toast 설정
const toastOptions = {
    position: "bottom-right",
    timeout: 3000,
    closeOnClick: true,
    pauseOnHover: true
}

// Toast 사용
app.use(Toast, toastOptions)

// 애플리케이션 마운트
app.mount('#app')
