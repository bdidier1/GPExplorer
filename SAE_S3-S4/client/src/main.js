import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './assets/fonts.css'
import './assets/global.css'
import { initEmailJS } from './services/email.service.js'
import { useTheme } from './composables/useTheme.js'

initEmailJS()

const { initTheme } = useTheme()
initTheme()

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
