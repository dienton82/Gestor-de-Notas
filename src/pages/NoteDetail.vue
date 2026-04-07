<template>
  <div v-if="loading" class="detailShell">Cargando nota...</div>
  <div v-else-if="error" class="detailShell">{{ error }}</div>
  <div v-else-if="note" class="detailShell">
    <p class="eyebrow">Detalle de nota</p>
    <h1 class="title">{{ note.noteCode }}</h1>
    <p class="content">{{ note.contentText }}</p>

    <div v-if="note.attachments?.length" class="attachments">
      <h3>Adjuntos</h3>
      <ul>
        <li v-for="a in note.attachments" :key="a.url">
          <a
            :href="safeAttachmentUrl(a.url)"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Paperclip :size="14" /> {{ a.name }}
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Paperclip } from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import apiClient from '../api/client'
import { normalizeNotesError } from '../utils/http'
import { sanitizeExternalUrl } from '../utils/security'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const note = ref(null)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const { data } = await apiClient.get(`/note/${route.params.noteCode}`)
    note.value = data

    if (!note.value) {
      error.value = 'No se encontro la nota solicitada.'
    }
  } catch (err) {
    const normalizedError = normalizeNotesError(err)
    error.value = normalizedError.message

    if (normalizedError.code === 'AUTH_SESSION_EXPIRED') {
      auth.logout()
      router.push('/login')
    }
  } finally {
    loading.value = false
  }
})

function safeAttachmentUrl(url) {
  return sanitizeExternalUrl(url)
}
</script>

<style scoped>
.detailShell {
  width: min(92%, 760px);
  margin: 84px auto 0;
  padding: 1.75rem;
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-lg);
  background: var(--app-surface);
  box-shadow: var(--app-shadow);
  color: var(--app-text);
}

.eyebrow {
  margin: 0 0 0.35rem;
  color: var(--app-primary);
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.title {
  margin: 0 0 1rem;
  font-size: clamp(1.65rem, 2vw, 2.15rem);
  font-weight: 700;
  letter-spacing: -0.04em;
}

.content {
  margin: 0;
  color: var(--app-text-soft);
  line-height: 1.7;
  white-space: pre-wrap;
}

.attachments {
  margin-top: 1.5rem;
}

.attachments h3 {
  margin: 0 0 0.65rem;
  font-size: 1rem;
}

.attachments ul {
  margin: 0;
  padding-left: 1rem;
}

.attachments a {
  color: var(--app-primary);
  text-decoration: none;
}

@media (max-width: 640px) {
  .detailShell {
    margin: 1.5rem auto;
    padding: 1.15rem;
  }
}
</style>
