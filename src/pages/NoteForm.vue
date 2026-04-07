<template>
  <div :class="styles.formContainer">
    <h1 :class="styles.heading">{{ isEdit ? 'Editar Nota' : 'Nueva Nota' }}</h1>
    <p v-if="error" :class="styles.error">{{ error }}</p>
    <form @submit.prevent="onSubmit" :class="styles.form">
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
        <input
          type="file"
          id="file"
          @change="onFileChange"
          :class="styles.fileInput"
        />
      </div>

      <div :class="styles.buttons">
        <button type="submit" :class="styles.submitBtn">
          <Save :size="16" :class="styles.buttonIcon" />
          {{ isEdit ? 'Actualizar' : 'Guardar' }}
        </button>
        <button type="button" @click="cancel" :class="styles.cancelBtn">
          <X :size="16" :class="styles.buttonIcon" />
          Cancelar
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Save, X } from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'
import { useNotesStore } from '../stores/notes'
import apiClient from '../api/client'
import styles from './NoteForm.module.css'

const route = useRoute()
const router = useRouter()
const store = useNotesStore()

const content = ref('')
const file = ref(null)
const error = ref('')
const noteCode = route.params.noteCode
const isEdit = Boolean(noteCode)

onMounted(async () => {
  try {
    if (!isEdit) {
      return
    }

    const { data } = await apiClient.get(`/note/${noteCode}`)
    content.value = data.contentText || data.content || ''
  } catch {
    error.value = 'No fue posible cargar la nota.'
  }
})

function onFileChange(e) {
  file.value = e.target.files[0]
}

async function onSubmit() {
  error.value = ''

  try {
    if (isEdit) {
      await store.updateNote(noteCode, { content: content.value, file: file.value })
    } else {
      await store.createNote({ content: content.value, file: file.value })
    }

    router.push('/')
  } catch {
    error.value = 'No fue posible guardar la nota.'
  }
}

function cancel() {
  router.push('/')
}
</script>
