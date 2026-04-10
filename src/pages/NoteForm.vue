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
        <div :class="styles.fileUpload">
          <input
            ref="fileInputRef"
            type="file"
            id="file"
            @change="onFileChange"
            :class="styles.fileInput"
          />
          <button type="button" :class="styles.fileButton" @click="openFilePicker">
            <Paperclip :size="16" :class="styles.buttonIcon" />
            Seleccionar archivo
          </button>
          <span :class="styles.fileName">
            {{ selectedFileName || currentAttachment?.name || 'Ningún archivo seleccionado' }}
          </span>
          <p v-if="currentAttachment && currentAttachmentLink?.href" :class="styles.currentAttachment">
            Adjunto actual:
            <a
              :href="currentAttachmentLink.href"
              :target="currentAttachmentLink.target"
              :rel="currentAttachmentLink.rel"
              :download="currentAttachmentLink.download"
              :class="styles.currentAttachmentLink"
              @click="handleAttachmentClick($event, currentAttachment)"
            >
              {{ currentAttachment.name }}
            </a>
          </p>
        </div>
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
import { ref, onMounted, computed } from 'vue'
import { Paperclip, Save, X } from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useNotesStore } from '../stores/notes'
import apiClient from '../api/client'
import { getAttachmentLinkAttributes, openAttachment } from '../utils/attachments'
import { normalizeNotesError } from '../utils/http'
import styles from './NoteForm.module.css'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const store = useNotesStore()

const content = ref('')
const file = ref(null)
const fileInputRef = ref(null)
const error = ref('')
const currentAttachment = ref(null)
const noteCode = route.params.noteCode
const isEdit = Boolean(noteCode)
const selectedFileName = computed(() => file.value?.name || '')
const currentAttachmentLink = computed(() =>
  currentAttachment.value ? getAttachmentLinkAttributes(currentAttachment.value) : null
)

function handleAttachmentClick(event, attachment) {
  openAttachment(event, attachment)
}

onMounted(async () => {
  try {
    if (!isEdit) {
      return
    }

    const { data } = await apiClient.get(`/note/${noteCode}`)
    content.value = data.contentText || data.content || ''
    currentAttachment.value = data.attachments?.[0]?.url ? data.attachments[0] : null
  } catch (err) {
    const normalizedError = normalizeNotesError(err)
    error.value = normalizedError.message

    if (normalizedError.code === 'AUTH_SESSION_EXPIRED') {
      auth.logout()
      router.push('/login')
    }
  }
})

function onFileChange(e) {
  file.value = e.target.files[0]
}

function openFilePicker() {
  fileInputRef.value?.click()
}

async function onSubmit() {
  error.value = ''
  const normalizedContent = content.value.trim()

  if (!normalizedContent) {
    error.value = 'El contenido no puede estar vacío.'
    return
  }

  if (file.value && file.value.size > 10 * 1024 * 1024) {
    error.value = 'El archivo excede el tamaño máximo permitido (10 MB).'
    return
  }

  try {
    if (isEdit) {
      await store.updateNote(noteCode, { content: normalizedContent, file: file.value })
    } else {
      await store.createNote({ content: normalizedContent, file: file.value })
    }

    router.push('/')
  } catch (err) {
    const normalizedError = normalizeNotesError(err)
    error.value = normalizedError.message

    if (normalizedError.code === 'AUTH_SESSION_EXPIRED') {
      auth.logout()
      router.push('/login')
    }
  }
}

function cancel() {
  router.push('/')
}
</script>
