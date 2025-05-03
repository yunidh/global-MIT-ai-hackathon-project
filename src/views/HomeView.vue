<script setup>
import { useRouter } from 'vue-router'

import { ref, computed } from 'vue'
import TextVoiceInput from '@/components/TextVoiceInput.vue'
import {
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionRoot,
  AccordionTrigger,
} from 'radix-vue'
import { Icon } from '@iconify/vue'
// import Accordion from '@/components/Accordion.vue'
import { Ollama } from 'ollama'

import { useI18n } from 'vue-i18n'
const router = useRouter()

function saveToHistory() {
  const entry = {
    prompt: history.value.at(-1)?.prompt,
    output: lastOutput.value,
    ts: Date.now(),
  }

  const prev = JSON.parse(localStorage.getItem('negotiationHistory') || '[]')
  prev.push(entry)
  localStorage.setItem('negotiationHistory', JSON.stringify(prev))
}
//Ollama client
const client = new Ollama({ host: 'http://127.0.0.1:11434' })

//STATES
const { t } = useI18n({ useScope: 'global' })
const inputText = ref('')
const lastOutput = ref(null) // holds the parsed JSON
const history = ref([]) // array of { prompt, output }
const isLoading = ref(false)

// 3️Column definitions for AG‑Grid
const islandOfAgreementsCols = [
  { field: 'contestedFacts', headerName: 'Contested Facts' },
  { field: 'agreedFacts', headerName: 'Agreed Facts' },
  { field: 'convergentNorms', headerName: 'Convergent Norms' },
  { field: 'divergentNorms', headerName: 'Divergent Norms' },
]
const prioritizeAvoidCols = [
  { field: 'text', headerName: 'Item' },
  { field: 'type', headerName: 'Type' }, // "Prioritize" or "Avoid"
]
const stakeholderMapsCols = [
  { field: 'actor', headerName: 'Actor' },
  { field: 'leveragePoint', headerName: 'Leverage Point' },
]

// ─── Helper: Strip ```json fences ─────────────────────────────
function unwrapFences(text) {
  return (
    text
      // remove starting ```json or ```
      .replace(/^```(?:json)?\r?\n/, '')
      // remove trailing ```
      .replace(/\r?\n```$/, '')
      .trim()
  )
}

// ─── Helper: Grab the first { … } block ────────────────────────
function extractJSON(text) {
  const match = text.match(/\{[\s\S]*\}$/)
  if (!match) {
    throw new Error('No JSON object found in Ollama response')
  }
  return match[0]
}

// ─── queryOllama with fence‑stripping and robust parsing ───────
const queryOllama = async (payload, refine = false) => {
  // 1) build the prompt
  const prompt = refine
    ? `Given this previous analysis JSON:\n\n${JSON.stringify(
        payload.output,
      )}\n\nRefine it with these new instructions:\n\n${payload.prompt}, then output a only this JSON object:{
  "islandOfAgreement": {
    "contestedFacts": [],
    "agreedFacts": [],
    "convergentNorms": [],
    "divergentNorms": []
  },
  "prioritize": [],
  "avoid": [],
  "stakeholderMap": [
    { "actor": "", "leveragePoint": "" }
  ]
}`
    : `You are a negotiation expert. Even if the user’s scenario is short, invent a plausible context and then return only this JSON object:

{
  "islandOfAgreement": {
    "contestedFacts": [],
    "agreedFacts": [],
    "convergentNorms": [],
    "divergentNorms": []
  },
  "prioritize": [],
  "avoid": [],
  "stakeholderMap": [
    { "actor": "", "leveragePoint": "" }
  ]
}

The scenario is:
"""${payload}"""`

  // 2) call the local Ollama Gemma 3 4B model
  const result = await client.generate({
    model: 'gemma3:4b',
    prompt,
    stream: false,
  })

  // 3) inspect raw response
  console.log('🔍 raw model response:', result.response)

  // 4) strip any ``` fences
  const noFences = unwrapFences(result.response)
  console.log('▶️ after unwrapping fences:', noFences)

  // 5) extract the {...} JSON block
  const jsonString = extractJSON(noFences)
  console.log('▶️ JSON to parse:', jsonString)

  // 6) parse it safely
  try {
    return JSON.parse(jsonString)
  } catch (err) {
    console.error('❌ Failed to parse JSON:', jsonString, err)
    throw err
  }
}

// Handle “Negotiate” & refinement
const handleNegotiation = async (rawText) => {
  const isRefine = lastOutput.value !== null
  const payload = isRefine ? { output: lastOutput.value, prompt: rawText } : rawText

  // 1) Start loading indicator
  isLoading.value = true

  try {
    // 2) Call Ollama
    const parsed = await queryOllama(payload, isRefine)

    // 3) Save state
    lastOutput.value = parsed
    history.value.push({ prompt: rawText, output: parsed, ts: Date.now() })

    // 4) Clear input for next refine
    inputText.value = ''
  } catch (err) {
    console.error('Negotiation error:', err)
  } finally {
    // 5) Stop loading indicator
    isLoading.value = false
  }
}

function splitIntoItems(items) {
  if (!items || !Array.isArray(items)) return []

  // Join all items, then split by comma
  const allText = items.join(', ')
  return allText
    .split(', ')
    .map((item) => ({
      value: item.trim(),
    }))
    .filter((item) => item.value)
}
// Compute rows for each table
const ioaRows = computed(() => {
  if (!lastOutput.value) return []
  const ioa = lastOutput.value.islandOfAgreement
  const processedData = {
    // join arrays so AG‑Grid shows text in cells
    contestedFacts: splitIntoItems(ioa.contestedFacts),
    agreedFacts: splitIntoItems(ioa.agreedFacts),
    convergentNorms: splitIntoItems(ioa.convergentNorms),
    divergentNorms: splitIntoItems(ioa.divergentNorms),
  }
  return [processedData]

  // return [
  //   {
  //     contestedFacts: ioa.contestedFacts.join('; '),
  //     agreedFacts: ioa.agreedFacts.join('; '),
  //     convergentNorms: ioa.convergentNorms.join('; '),
  //     divergentNorms: ioa.divergentNorms.join('; '),
  //   },
  // ]
})

const paRows = computed(() => {
  if (!lastOutput.value) return []
  return [
    ...lastOutput.value.prioritize.map((t) => ({ text: t, type: 'Prioritize' })),
    ...lastOutput.value.avoid.map((t) => ({ text: t, type: 'Avoid' })),
  ]
})

const smRows = computed(() => {
  return lastOutput.value?.stakeholderMap || []
})
</script>

<!-- TEMPLATE -->
<template>
  <main>
    <div class="text-input">
      <TextVoiceInput v-model="inputText" @submit="handleNegotiation" />
    </div>
    <div class="output-box">
      <h2>AI Output</h2>
      <p v-if="isLoading" class="loader">Analyzing<span class="dots"></span></p>

      <!-- Only show when we have parsed output -->

      <AccordionRoot
        v-if="lastOutput"
        class="AccordionRoot"
        :collapsible="true"
        :default-value="['ioa']"
      >
        <!-- 1. Island of Agreement -->
        <AccordionItem class="AccordionItem" value="ioa">
          <AccordionHeader class="AccordionHeader">
            <AccordionTrigger class="AccordionTrigger">
              {{ t('Island_of_Agreement') }}
              <Icon icon="radix-icons:chevron-down" class="AccordionChevron" />
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionContent class="AccordionContent">
            <table class="ioa-table">
              <thead>
                <tr>
                  <th>{{ t('Contested_Facts') }}</th>
                  <th>{{ t('Agreed_Facts') }}</th>
                  <th>{{ t('Convergent_Norms') }}</th>
                  <th>{{ t('Divergent_Norms') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div
                      v-for="(item, idx) in lastOutput.islandOfAgreement.contestedFacts"
                      :key="'cf-' + idx"
                    >
                      {{ idx + 1 }}. {{ item }}<br />
                    </div>
                  </td>
                  <td>
                    <div
                      v-for="(item, idx) in lastOutput.islandOfAgreement.agreedFacts"
                      :key="'af-' + idx"
                    >
                      {{ idx + 1 }}. {{ item }}<br />
                    </div>
                  </td>
                  <td>
                    <div
                      v-for="(item, idx) in lastOutput.islandOfAgreement.convergentNorms"
                      :key="'cn-' + idx"
                    >
                      {{ idx + 1 }}. {{ item }}<br />
                    </div>
                  </td>
                  <td>
                    <div
                      v-for="(item, idx) in lastOutput.islandOfAgreement.divergentNorms"
                      :key="'dn-' + idx"
                    >
                      {{ idx + 1 }}. {{ item }}<br />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </AccordionContent>
        </AccordionItem>

        <!-- 2. Prioritize / Avoid -->
        <AccordionItem class="AccordionItem" value="pa">
          <AccordionHeader class="AccordionHeader">
            <AccordionTrigger class="AccordionTrigger">
              {{ t('Prioritize_Avoid') }}
              <Icon icon="radix-icons:chevron-down" class="AccordionChevron" />
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionContent class="AccordionContent">
            <div class="pa-list" style="color: black">
              <strong>{{ t('Prioritize') }}</strong>
              <ul>
                <li style="color: black" v-for="(item, i) in lastOutput.prioritize" :key="`p-${i}`">
                  {{ item }}
                </li>
              </ul>
              <strong>{{ t('Avoid') }}</strong>
              <ul>
                <li style="color: black" v-for="(item, i) in lastOutput.avoid" :key="`a-${i}`">
                  {{ item }}
                </li>
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>

        <!-- 3. Stakeholder Influence Map -->
        <AccordionItem class="AccordionItem" value="sm">
          <AccordionHeader class="AccordionHeader">
            <AccordionTrigger class="AccordionTrigger">
              {{ t('Stakeholder_Influence_Map') }}
              <Icon icon="radix-icons:chevron-down" class="AccordionChevron" />
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionContent class="AccordionContent">
            <table class="sm-table">
              <thead>
                <tr>
                  <th>{{ t('Actor') }}</th>
                  <th>{{ t('Leverage_Point') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(s, idx) in lastOutput.stakeholderMap" :key="`s-${idx}`">
                  <td>{{ s.actor }}</td>
                  <td>{{ s.leveragePoint }}</td>
                </tr>
              </tbody>
            </table>
          </AccordionContent>
        </AccordionItem>
      </AccordionRoot>
      <button class="save-btn" @click="saveToHistory">Save to History</button>
    </div>
  </main>
</template>

<style scoped>
.text-input {
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

.pa_list {
  color: black;
}

.output-box p {
  white-space: pre-wrap;
  color: #444;
  font-size: 1rem;
}
.loader {
  font-size: 1.2rem;
  font-weight: bold;
}
.dots::after {
  content: '';
  display: inline-block;
  width: 1em;
  text-align: left;
  animation: dots 1s steps(3, end) infinite;
}
@keyframes dots {
  0%,
  20% {
    content: '';
  }
  40% {
    content: '.';
  }
  60% {
    content: '..';
  }
  80%,
  100% {
    content: '...';
  }
}
</style>
