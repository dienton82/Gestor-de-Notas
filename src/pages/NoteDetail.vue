<template>
  <div class="max-w-md mx-auto p-6">
    <h1 class="text-2xl font-bold mb-4">Detalle de Nota</h1>

    <div v-if="note">
      <h2 class="text-xl font-semibold mb-2">{{ note.noteCode }}</h2>
      <p class="mb-4">{{ note.contentText || note.content }}</p>

      <div v-if="note.attachments?.length">
        <h3 class="font-medium mb-2">Adjuntos:</h3>
        <ul class="list-disc list-inside">
          <li v-for="att in note.attachments" :key="att.id">
            <a :href="att.url" target="_blank" class="text-blue-600 underline">
              {{ att.name }}
            </a>
          </li>
        </ul>
      </div>
    </div>
    <div v-else class="text-gray-500">Cargando nota…</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import apiClient from '../api/client'

const route = useRoute()
const note = ref(null)

onMounted(async () => {
  try {
    const code = route.params.noteCode
    const { data } = await apiClient.get(`/note/${code}`)
    note.value = data
  } catch (err) {
    console.error('Error cargando detalle:', err)
  }
})
</script>
