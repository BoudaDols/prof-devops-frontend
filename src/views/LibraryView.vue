<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { pdfService, type Pdf } from '../api/services'

const pdfs = ref<Pdf[]>([])
const loading = ref(true)
const error = ref('')

// Reading session state
const activeSession = ref<{ pdfId: number; sessionId: string; url: string } | null>(null)
const sessionError = ref('')
const opening = ref<number | null>(null)
const closing = ref(false)

onMounted(async () => {
  try {
    const { data } = await pdfService.listPdfs()
    // Handle response shape: direct array or wrapped
    pdfs.value = Array.isArray(data) ? data : ((data as any).data ?? [])
  } catch (e: any) {
    error.value = 'Failed to load PDF library.'
  } finally {
    loading.value = false
  }
})

async function openPdf(pdf: Pdf) {
  opening.value = pdf.id
  sessionError.value = ''

  try {
    const { data } = await pdfService.openSession(pdf.id)
    activeSession.value = {
      pdfId: pdf.id,
      sessionId: data.session_id,
      url: data.url,
    }
    // Open the pre-signed URL in a new tab so the user can read
    window.open(data.url, '_blank')
  } catch (e: any) {
    const message = e.response?.data?.detail || e.response?.data?.message || 'Cannot open PDF.'
    sessionError.value = `${pdf.title}: ${message}`
  } finally {
    opening.value = null
  }
}

async function closeSession() {
  if (!activeSession.value) return

  closing.value = true
  sessionError.value = ''

  try {
    const { data } = await pdfService.closeSession(activeSession.value.pdfId)
    const minutes = Math.floor(data.duration_seconds / 60)
    const seconds = data.duration_seconds % 60
    sessionError.value = '' // Clear any previous error
    alert(`Reading session ended. Duration: ${minutes}m ${seconds}s`)
    activeSession.value = null
  } catch (e: any) {
    sessionError.value = e.response?.data?.detail || 'Failed to close session.'
  } finally {
    closing.value = false
  }
}
</script>

<template>
  <div class="p-8 max-w-4xl">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">PDF Library</h1>
        <p class="mt-1 text-gray-600">Browse and read your PDFs. Limits depend on your plan.</p>
      </div>
    </div>

    <!-- Active session banner -->
    <div v-if="activeSession" class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
      <div>
        <p class="text-sm font-medium text-blue-900">Reading session active</p>
        <p class="text-xs text-blue-700 mt-0.5">
          PDF #{{ activeSession.pdfId }} — Session: {{ activeSession.sessionId.slice(0, 8) }}...
        </p>
      </div>
      <button
        @click="closeSession"
        :disabled="closing"
        class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer"
      >
        {{ closing ? 'Closing...' : 'End Session' }}
      </button>
    </div>

    <!-- Plan limits info -->
    <div class="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600">
      <span class="font-medium">Access limits:</span>
      Free = 1 PDF/day, 30 min max &bull;
      Basic = 1 PDF/day, unlimited time &bull;
      Premium = unlimited
    </div>

    <!-- Session error -->
    <div v-if="sessionError" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
      {{ sessionError }}
    </div>

    <!-- Loading -->
    <div v-if="loading" class="mt-8 text-center text-gray-500">Loading library...</div>

    <!-- Error -->
    <div v-if="error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
      {{ error }}
    </div>

    <!-- PDF grid -->
    <div v-if="!loading && pdfs.length > 0" class="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="pdf in pdfs"
        :key="pdf.id"
        class="bg-white rounded-xl border border-gray-200 p-5 flex flex-col"
      >
        <!-- PDF icon + title -->
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
            <span class="text-lg">📄</span>
          </div>
          <div class="min-w-0">
            <h3 class="text-sm font-semibold text-gray-900 truncate">{{ pdf.title }}</h3>
            <p class="text-xs text-gray-500 truncate">{{ pdf.filename }}</p>
          </div>
        </div>

        <!-- Description -->
        <p v-if="pdf.description" class="mt-3 text-xs text-gray-600 line-clamp-2 flex-1">
          {{ pdf.description }}
        </p>
        <div v-else class="flex-1"></div>

        <!-- Metadata -->
        <p class="mt-3 text-xs text-gray-400">
          Added {{ pdf.created_at ? new Date(pdf.created_at).toLocaleDateString() : '—' }}
        </p>

        <!-- Open button -->
        <button
          @click="openPdf(pdf)"
          :disabled="opening === pdf.id || (activeSession !== null && activeSession.pdfId !== pdf.id)"
          class="mt-3 w-full py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer"
          :class="activeSession?.pdfId === pdf.id
            ? 'bg-green-100 text-green-700 border border-green-200'
            : 'bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed'"
        >
          <template v-if="opening === pdf.id">Opening...</template>
          <template v-else-if="activeSession?.pdfId === pdf.id">Currently Reading</template>
          <template v-else>Read PDF</template>
        </button>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="!loading && pdfs.length === 0 && !error" class="mt-8 bg-white rounded-xl border border-gray-200 p-8 text-center">
      <div class="text-4xl mb-4">📚</div>
      <h2 class="text-lg font-semibold text-gray-900">No PDFs available</h2>
      <p class="mt-2 text-sm text-gray-600">The library is empty. PDFs will appear here once they're added to the system.</p>
    </div>
  </div>
</template>
