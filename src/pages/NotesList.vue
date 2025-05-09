<template>
  <div :class="styles.container">
    <header :class="styles.header">
      <h1 :class="styles.title">Mis Notas</h1>
     
    </header>
    <button :class="[styles.btn, styles.btnDanger]" @click="logout">
        Cerrar sesión
      </button>
    <button :class="[styles.btn, styles.btnNew]" @click="goToNew">
      + Nueva Nota
    </button>

    <div v-if="loading" :class="styles.spinner">
      <svg class="spin" viewBox="0 0 50 50" width="40" height="40">
        <circle cx="25" cy="25" r="20" fill="none" stroke="#fff" stroke-width="5"/>
      </svg>
    </div>

    <!-- Mensaje si no hay notas -->
    <div v-else-if="!notes.length" :class="styles.empty">
      No hay notas para mostrar.
    </div>

    <!-- Listado con inline-edit -->
    <ul v-else :class="styles.list">
      <li v-for="nota in notes" :key="nota.noteCode" :class="styles.item">
        <!-- modo edición inline -->
        <div v-if="editingCode === nota.noteCode" :class="styles.inlineEditor">
          <textarea
            v-model="editingContent"
            :class="styles.editTextarea"
            rows="3"
            style="width: 191px; height: 49px;">
          ></textarea>
          <div :class="styles.inlineButtons"> 
            <button :class="[styles.btn, styles.btnPrimary]" @click="saveInline(nota.noteCode)">Guardar</button>
            <button :class="[styles.btn, styles.btnSecondary]" @click="cancelInline">Cancelar</button>
          </div>
        </div>

        <!-- modo visual -->
        <div v-else :class="styles.itemContent" @dblclick="startInline(nota)">
          <NoteCard
            :title="nota.noteCode"
            :content="nota.contentText"
          />
          <div :class="styles.actions">
            <button :class="styles.linkEdit" @click.stop="editNote(nota.noteCode)">Editar</button>
            <button :class="styles.linkDelete" @click.stop="confirmAndDelete(nota.noteCode)">Eliminar</button>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>


<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useNotesStore } from '../stores/notes'
import NoteCard from '../components/NoteCard.vue'
import styles from './NotesList.module.css'

const router = useRouter()
const auth = useAuthStore()
const notesStore = useNotesStore()

const loading = ref(true)
const notes = computed(() => notesStore.list)

// Estado para edición inline
const editingCode = ref(null)
const editingContent = ref('')

onMounted(async () => {
  await notesStore.fetchNotes()
  loading.value = false
})

function logout() {
  auth.logout()
  router.push('/login')
}

function goToNew() {
  router.push('/notes/new')
}

function viewDetail(code) {
  router.push(`/notes/${code}`)
}

function editNote(code) {
  router.push(`/notes/${code}/edit`)
}

async function confirmAndDelete(code) {
  if (confirm('¿Estás seguro de eliminar esta nota?')) {
    await notesStore.deleteNote(code)
  }
}

function startInline(nota) {
  editingCode.value = nota.noteCode
  editingContent.value = nota.contentText || nota.content
}

function cancelInline() {
  editingCode.value = null
  editingContent.value = ''
}

async function saveInline(code) {
  try {
    await notesStore.updateNote(code, { content: editingContent.value, file: null })
    cancelInline()
  } catch (err) {
    console.error('Error al guardar inline:', err)
    alert('No se pudo actualizar la nota.')
  }
}
</script>