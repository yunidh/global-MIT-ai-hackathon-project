<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import TextVoiceInput from './components/TextVoiceInput.vue'
import ChatIcon from 'vue-material-design-icons/Chat.vue'
import HistoryIcon from 'vue-material-design-icons/History.vue'

const { t, locale } = useI18n({ useScope: 'global' })
const language = ref(locale.value === 'np' ? 'English' : 'नेपाली')

const toggleLanguage = () => {
  const newLocale = locale.value === 'en' ? 'np' : 'en'
  locale.value = newLocale
  language.value = newLocale === 'en' ? 'नेपाली' : 'English'
}
</script>

<template>
  <div class="navbar">
    <nav class="nav-links">
      <RouterLink to="/">
        <chat-icon />
        <span style="font-weight: bold">{{ t('chat') }}</span>
      </RouterLink>
      <RouterLink to="/history">
        <history-icon />
        <span style="font-weight: bold">{{ t('history') }}</span>
      </RouterLink>
    </nav>
    <h1 class="title">{{ t('title') }}</h1>
    <button class="language-toggle" @click="toggleLanguage">
      {{ language }}
    </button>
  </div>

  <RouterView />
</template>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #3e3d3d;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  box-sizing: border-box;
}

.nav-links {
  display: flex;
  gap: 20px;
}

.nav-links a {
  font-size: 0.9rem;
  text-decoration: none;
  color: #3494fa;
}

.nav-links a:hover {
  text-decoration: underline;
}

.title {
  margin: 0;
  font-size: 1.5rem;
  text-align: center;
  flex-grow: 1;
}

.language-toggle {
  background-color: #3494fa;
  color: white;
  border: none;
  padding: 5px 5px;
  border-radius: 50px;
  cursor: pointer;
  padding: 10px;
}

.language-toggle:hover {
  background-color: #3494fa;
}
</style>
