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
            :href="a.url"
            target="_blank"
            rel="noopener noreferrer"
          >
            📎 {{ a.name }}
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import apiClient from '../api/client'

const route = useRoute()
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
  } catch {
    error.value = 'No fue posible cargar el detalle de la nota.'
  } finally {
    loading.value = false
  }
})
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
