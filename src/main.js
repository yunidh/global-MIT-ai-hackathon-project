import './assets/main.css'
import '@/registerServiceWorker'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'

import App from './App.vue'
import router from './router'

const i18n = createI18n({
  locale: 'en-US',
  fallbackLocale: 'en-US',
  messages: {
    en: {
      welcome: 'Welcome to Mediate',
      title: 'Mediate',
      chat: 'Chat',
      history: 'History',
    },
    np: {
      welcome: 'मीडिएटमा स्वागत छ',
      title: 'मीडिएट',
      chat: 'च्याट',
      history: 'इतिहास',
    },
  },
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)
app.mount('#app')
