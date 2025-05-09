<template>
  <div :class="styles.formContainer">
    <h1 :class="styles.heading">{{ isEdit ? 'Editar Nota' : 'Nueva Nota' }}</h1>
    <form @submit.prevent="onSubmit">
      <div :class="styles.field">
        <label for="content" :class="styles.label">Contenido</label>
        <textarea
          id="content"
          v-model="content"
          :class="styles.textarea"
          rows="5"
          required
        />
      </div>

      <div :class="styles.field">
        <label for="file" :class="styles.label">Adjunto</label>
        <input type="file" id="file" @change="onFileChange" :class="styles.fileInput" />
      </div>

      <button type="submit" :class="styles.button">
        {{ isEdit ? 'Actualizar' : 'Guardar' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import apiClient from '../api/client'
import { useNotesStore } from '../stores/notes'
import styles from './NoteForm.module.css'

const route = useRoute()
const router = useRouter()
const store = useNotesStore()

const content = ref('')
const file = ref(null)
const noteCode = route.params.noteCode
const isEdit = Boolean(noteCode)

onMounted(async () => {
  if (isEdit) {
    const { data } = await apiClient.get(`/note/${noteCode}`)
    content.value = data.contentText || data.content || ''
  }
})

function onFileChange(e) {
  file.value = e.target.files[0]
}

async function onSubmit() {
  if (isEdit) {
    await store.updateNote(noteCode, { content: content.value, file: file.value })
  } else {
    await store.createNote({ content: content.value, file: file.value })
  }
  router.push('/')
}
</script>
