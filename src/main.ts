import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import { setupInterceptors } from './api/interceptors'
import App from './App.vue'
import './style.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Set up Axios interceptors after Pinia is ready (they use the auth store)
setupInterceptors()

app.mount('#app')
