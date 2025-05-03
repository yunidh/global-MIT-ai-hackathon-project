import './assets/pico.jade.min.css'
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
      Contested_Facts: 'Contested Facts',
      Agreed_Facts: 'Agreed Facts',
      Convergent_Norms: 'Convergent Facts',
      Divergent_Norms: 'Divergent Facts',
      Island_of_Agreement: 'Island of Agreement',
      Prioritize_Avoid: 'Prioritize / Avoid',
      Prioritize: 'Prioritize',
      Avoid: 'Avoid',
      Stakeholder_Influence_Map: 'Stakeholder Influence Map',
      Actor: 'Actors',
      Leverage_Point: 'Leverage Points',
    },
    np: {
      welcome: 'मीडिएटमा स्वागत छ',
      title: 'मीडिएट',
      chat: 'च्याट',
      history: 'इतिहास',
      Contested_Facts: 'विवादित तथ्य',
      Agreed_Facts: 'सहमत तथ्य',
      Convergent_Norms: 'सहमत तथ्य',
      Divergent_Norms: 'विभाजन तथ्य',
      Island_of_Agreement: 'सहमतिको टापु',
      Prioritize_Avoid: 'प्राथमिकता दिनुहोस् / टाढा गर्नुहोस्',
      Prioritize: 'प्राथमिकता दिनुहोस्',
      Avoid: 'टाढा गर्नुहोस्',
      Stakeholder_Influence_Map: 'हितधारक प्रभाव नक्सा',
      Actor: 'अभिनेता',
      Leverage_Point: 'लिभरेज बिन्दु',
    },
  },
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)
app.mount('#app')
