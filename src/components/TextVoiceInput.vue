<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n({ useScope: 'global' })

const inputText = ref('')
const isRecording = ref(false)
let recognition = null

const toggleRecording = () => {
  if (!('webkitSpeechRecognition' in window)) {
    alert('Your browser does not support speech recognition.')
    return
  }

  if (!recognition) {
    recognition = new webkitSpeechRecognition()
    recognition.lang = t('locale') === 'np' ? 'ne-NP' : 'en-US'
    recognition.continuous = true
    recognition.interimResults = false

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript
      inputText.value += transcript + ' '
    }

    recognition.onerror = (e) => {
      console.error('Speech recognition error:', e)
    }
  }

  if (isRecording.value) {
    recognition.stop()
  } else {
    recognition.start()
  }

  isRecording.value = !isRecording.value
}
</script>

<template>
  <div class="input-box">
    <textarea v-model="inputText" placeholder="Enter scenario..."></textarea>

    <div class="button-row">
      <button class="mic-button" :class="{ recording: isRecording }" @click="toggleRecording">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24"
          viewBox="0 0 24 24"
          width="24"
          :fill="isRecording ? 'black' : 'white'"
        >
          <path d="M0 0h24v24H0z" fill="none" />
          <path
            d="M12 14a2 2 0 002-2V6a2 2 0 00-4 0v6a2 2 0 002 2zm5-2a5 5 0 01-10 0H5a7 7 0 0014 0h-2zM11 18h2v3h-2z"
          />
        </svg>
      </button>

      <button class="negotiate-button" @click="$emit('submit', inputText)">Negotiate</button>
    </div>
  </div>
</template>

<style scoped>
/* Add this media query to ensure behavior is consistent above 1024px */
@media (min-width: 1024px) {
  .input-box {
    width: 100%;
    max-width: 100%;
  }
}
.input-box {
  display: flex;
  width: 100%;
  max-width: 100%;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
}

textarea {
  min-height: 150px;
  padding: 20px;
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
}

.button-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.mic-button {
  padding: 10px;
  background-color: #3494fa;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.mic-button.recording {
  background-color: red;
}

.negotiate-button {
  padding: 10px 20px;
  background-color: #3494fa;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
</style>
