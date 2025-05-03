<script setup>
import { ref } from 'vue'
import TextVoiceInput from '@/components/TextVoiceInput.vue'
import { Ollama } from 'ollama'

const client = new Ollama({ host: 'http://127.0.0.1:11434' })
const aiOutput = ref('') // Store AI result here

const queryOllama = async (text) => {
  const response = await client.generate({
    model: 'gemma3:4b',
    prompt: `Analyze the following negotiation scenario:\n\n${text}\n\nReturn:
1. A 4-column Island of Agreement table.
2. A Prioritize/Avoid list.
3. An Iceberg Table comparing negotiator & counterpart.
4. A Stakeholder Influence Map.`,
    stream: false,
  })
  return response
}

const handleNegotiation = async (inputText) => {
  try {
    aiOutput.value = 'Analyzing...'
    aiOutput.value = await queryOllama(inputText)
  } catch (error) {
    console.error('Error:', error)
    aiOutput.value = 'Failed to fetch analysis.'
  }
}
</script>

<template>
  <main>
    <div class="home">
      <TextVoiceInput @submit="handleNegotiation" />
    </div>
    <div v-if="aiOutput" class="output-box">
      <h2>AI Output</h2>
      <p>{{ aiOutput }}</p>
    </div>
  </main>
</template>

<style scoped>
.home {
  margin: 10vh 10vw;
}
.output-box {
  margin: 0 10vw;
  padding: 20px;
  background-color: #f4f6f8;
  border-radius: 10px;
  border: 1px solid #ddd;
}

.output-box h2 {
  margin-bottom: 10px;
  color: #333;
}

.output-box p {
  white-space: pre-wrap;
  color: #444;
  font-size: 1rem;
}
</style>
