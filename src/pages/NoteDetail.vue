<template>
  <div v-if="loading">Cargando nota...</div>
  <div v-else-if="error">{{ error }}</div>
  <div v-else-if="note">
    <h1>{{ note.noteCode }}</h1>
    <p>{{ note.contentText }}</p>

    <div v-if="note.attachments?.length" class="mt-4">
      <h3>Adjuntos:</h3>
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
