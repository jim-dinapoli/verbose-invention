<template>
  <div class="upload-tab">
    <h2>Upload & Convert</h2>
    
    <input type="file" multiple @change="handleFileSelect" accept=".edi,.txt,.x12" class="file-input" />

    <div v-if="files.length" class="controls">
      <div class="options">
        <label>
          <input type="checkbox" v-model="saveMapping" />
          Save mapping for this partner
        </label>
        <input v-model="webhookUrl" placeholder="Webhook URL (optional)" class="webhook-input" />
      </div>

      <!-- START BUTTON -->
      <button 
        v-if="!processing && !cancelled" 
        @click="startProcessing" 
        class="start-btn"
      >
        Start Processing {{ files.length }} file{{ files.length === 1 ? '' : 's' }}
      </button>

      <!-- CANCEL BUTTON -->
      <button 
        v-if="processing" 
        @click="cancelProcessing" 
        class="cancel-btn"
      >
        Cancel Processing
      </button>

      <!-- PROGRESS -->
      <div v-if="processing || cancelled" class="progress-section">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progress + '%' }"></div>
        </div>
        <p class="status">{{ status }}</p>
      </div>

      <!-- RESULTS -->
      <div v-if="results.length && !processing" class="results">
        <button @click="downloadAll" class="download-all-btn">
          Download All as ZIP
        </button>
        <ul>
          <li v-for="r in results" :key="r.name" :class="{ error: r.error }">
            {{ r.name }} → {{ r.error ? 'Failed' : 'Success' }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import JSZip from 'jszip'

// === STATE ===
const files = ref<File[]>([])
const saveMapping = ref(true)
const webhookUrl = ref('')
const processing = ref(false)
const cancelled = ref(false)
const results = ref<any[]>([])
const progress = ref(17)
const status = ref('')

const callGrok = async (payload: string): Promise<string> => {
  const apiKey = import.meta.env.VITE_XAI_API_KEY
  if (!apiKey) throw new Error("Missing XAI key")

  const response = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",  // ← MUST be POST
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "grok-3",
      messages: [
        { role: "system", content: "You are an expert X12 EDI parser. Return ONLY valid JSON." },
        { role: "user", content: payload }
      ],
      response_format: { type: "json_object" },
      temperature: 0,
      max_tokens: 3000
    })
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Grok error: ${err}`)
  }

  const data = await response.json()
  return data.choices[0].message.content.trim()
}

// === FILE HANDLING ===
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    files.value = Array.from(target.files)
    processing.value = false
    cancelled.value = false
    results.value = []
    progress.value = 17
    status.value = ''
  }
}

// === MAIN PROCESSING ===
const startProcessing = () => {
  processing.value = true
  cancelled.value = false
  results.value = []
  progress.value = 17
  status.value = 'Converting with Grok-3...'

  const steps = [34, 51, 68, 85, 100]
  let stepIndex = 0
  const total = files.value.length

  const processFile = async (index: number) => {
    if (index >= total || cancelled.value) {
      if (cancelled.value) {
        status.value = 'Cancelled by user'
      } else {
        progress.value = 100
        status.value = `Success! Processed ${results.value.length} files`
      }
      processing.value = false
      return
    }

    const file = files.value[index]
    if (!file) return
    try {
      const raw = await file.text()
      const segments = raw.split('~').filter(s => s.trim()).map(s => s.trim() + '~').slice(0, 150).join('\n')
      const payload = `File: ${file.name}\n\n${segments}`

      const jsonStr = await callGrok(payload)
      const data = JSON.parse(jsonStr)

      results.value.push({ name: file.name, data })

      if (saveMapping.value) {
        const partner = data.ShipTo?.name || data.BillTo?.name || 'unknown'
        localStorage.setItem(`mapping_${partner}`, jsonStr)
      }

      if (webhookUrl.value) {
        fetch(webhookUrl.value, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
      }
    } catch (err: any) {
      results.value.push({ name: file.name, error: err.message })
    }

    // Update progress
    const ratio = (index + 1) / total
    while (stepIndex < steps.length && ratio >= (stepIndex + 1) / steps.length) {
      const nextProgress = steps[stepIndex]
      if (nextProgress !== undefined) {
        progress.value = nextProgress
      }
      stepIndex++
    }

    // Next file
    setTimeout(() => processFile(index + 1), 300)
  }

  processFile(0)
}

const cancelProcessing = () => {
  cancelled.value = true
}

// === DOWNLOAD ALL ===
const downloadAll = async () => {
  const zip = new JSZip()
  results.value.forEach(r => {
    if (!r.error) {
      zip.file(`${r.name}.json`, JSON.stringify(r.data, null, 2))
    }
  })
  const blob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'EDI_Converted_Files.zip'
  a.click()
}
</script>

<style scoped>
.upload-tab {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

.file-input {
  display: block;
  margin: 20px 0;
  padding: 15px;
  background: rgba(30,30,60,0.8);
  border: 2px dashed #4444aa;
  border-radius: 12px;
  width: 100%;
  color: #e0e0ff;
}

.options {
  display: flex;
  gap: 20px;
  margin: 20px 0;
  flex-wrap: wrap;
}

.start-btn, .cancel-btn, .download-all-btn {
  padding: 14px 28px;
  border: none;
  border-radius: 12px;
  font-size: 1.1em;
  font-weight: 600;
  cursor: pointer;
  margin: 20px 0;
  width: 100%;
}

.start-btn    { background: linear-gradient(90deg, #0066ff, #00d4ff); color: white; }
.cancel-btn   { background: #dc35495e; color: #ff6a6a; }
.download-all-btn { background: linear-gradient(90deg, #00d4ff, #ff6a00); color: white; }

.progress-section {
  margin: 30px 0;
}

.progress-bar {
  height: 16px;
  background: #222244;
  border-radius: 8px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00d4ff, #ff6a00);
  width: 17%;
  transition: width 0.8s ease;
}

.status {
  text-align: center;
  margin: 15px 0;
  font-size: 1.2em;
  color: #00ffaa;
}
</style>