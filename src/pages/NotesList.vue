<template>
  <div :class="styles.container">
    <header :class="styles.header">
      <h1 :class="styles.title">Mis Notas</h1>
      <div>
        <button :class="[styles.btn, styles.btnDanger]" @click="logout">Cerrar sesión</button>
        <button :class="[styles.btn, styles.btnNew]" @click="goToNew">+ Nueva Nota</button>
      </div>
    </header>

    <div :class="styles.filters">
      <input
        v-model="searchTerm"
        :class="styles.searchInput"
        placeholder="🔍 Buscar por título o contenido…"
      />
      <select v-model="sortKey" :class="styles.select">
        <option value="createdAt">Ordenar por fecha</option>
        <option value="noteCode">Ordenar por código</option>
        <option value="contentText">Ordenar por contenido</option>
      </select>
    </div>

    <div v-if="loading" :class="styles.spinner">
      <svg class="spin" viewBox="0 0 50 50" width="40" height="40">
        <circle cx="25" cy="25" r="20" fill="none" stroke="#fff" stroke-width="5" />
      </svg>
    </div>

    <div v-else-if="loadError" :class="styles.empty">
      {{ loadError }}
    </div>

    <div
      v-else-if="!groupedPaginatedNotes || Object.keys(groupedPaginatedNotes).length === 0"
      :class="styles.empty"
    >
      No hay notas para mostrar.
    </div>

    <div v-else>
      <div v-for="(group, label) in groupedPaginatedNotes" :key="label" :class="styles.group">
        <h2 :class="styles.groupTitle">🗓 {{ label }}</h2>
        <ul :class="styles.list">
          <li v-for="nota in group" :key="nota.noteCode" :class="styles.item">
            <div v-if="editingCode === nota.noteCode" :class="styles.inlineEditor">
              <textarea
                v-model="editingContent"
                :class="styles.editTextarea"
                rows="3"
                style="width: 191px; height: 51px;"
              ></textarea>

              <div :class="styles.inlineButtons">
                <button :class="[styles.btn, styles.btnPrimary]" @click="saveInline(nota.noteCode)">Guardar</button>
                <button :class="[styles.btn, styles.btnSecondary]" @click="cancelInline">Cancelar</button>
              </div>
            </div>

            <div v-else :class="styles.itemContent" @dblclick="startInline(nota)">
              <NoteCard :title="nota.noteCode" :content="nota.contentText" />
              <div :class="styles.meta">
                <span>📅 {{ formatDate(nota.createdAt) }}</span>
                <span v-if="nota.attachments?.length && nota.attachments[0].url">
                  📌
                  <a :href="nota.attachments[0].url" target="_blank" rel="noopener noreferrer">
                    {{ nota.attachments[0].name || 'Ver archivo' }}
                  </a>
                </span>
              </div>
              <div :class="styles.actions">
                <button :class="styles.linkEdit" @click.stop="editNote(nota.noteCode)">Editar</button>
                <button :class="styles.linkDelete" @click.stop="confirmAndDelete(nota.noteCode)">Eliminar</button>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <nav v-if="pageCount > 1" :class="styles.pagination">
      <button :disabled="page === 1" @click="page--">« Anterior</button>
      <span>Página {{ page }} de {{ pageCount }}</span>
      <button :disabled="page === pageCount" @click="page++">Siguiente »</button>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useNotesStore } from '../stores/notes'
import NoteCard from '../components/NoteCard.vue'
import styles from './NotesList.module.css'

const router = useRouter()
const auth = useAuthStore()
const notesStore = useNotesStore()

const loading = ref(true)
const loadError = ref('')

onMounted(async () => {
  try {
    await notesStore.fetchNotes()
  } catch {
    loadError.value = 'No fue posible cargar las notas desde el servidor.'
  } finally {
    loading.value = false
  }
})

const searchTerm = ref('')
const sortKey = ref('createdAt')
const page = ref(1)
const pageSize = ref(5)

const filteredNotes = computed(() => {
  const term = searchTerm.value.toLowerCase().trim()
  if (!term) return notesStore.list
  return notesStore.list.filter(n =>
    n.noteCode.toLowerCase().includes(term) ||
    (n.contentText || '').toLowerCase().includes(term)
  )
})

const sortedNotes = computed(() => {
  return [...filteredNotes.value].sort((a, b) => {
    if (sortKey.value === 'createdAt') {
      return new Date(b.createdAt) - new Date(a.createdAt)
    }
    const aVal = (a[sortKey.value] || '').toLowerCase()
    const bVal = (b[sortKey.value] || '').toLowerCase()
    return aVal.localeCompare(bVal)
  })
})

const pageCount = computed(() =>
  Math.ceil(sortedNotes.value.length / pageSize.value) || 1
)

const paginatedNotes = computed(() =>
  sortedNotes.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value)
)

function groupLabel(dateStr) {
  const today = new Date()
  const target = new Date(dateStr)

  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const targetDate = new Date(target.getFullYear(), target.getMonth(), target.getDate())

  const diff = (todayDate - targetDate) / (1000 * 60 * 60 * 24)

  if (diff === 0) return 'Hoy'
  if (diff === 1) return 'Ayer'
  if (diff < 7) return 'Esta semana'
  return formatDate(dateStr)
}

const groupedPaginatedNotes = computed(() => {
  const groups = {}
  for (const nota of paginatedNotes.value) {
    const label = groupLabel(nota.createdAt)
    if (!groups[label]) groups[label] = []
    groups[label].push(nota)
  }
  return groups
})

function logout() {
  auth.logout()
  router.push('/login')
}

function goToNew() {
  router.push('/notes/new')
}

function editNote(code) {
  router.push(`/notes/${code}/edit`)
}

async function confirmAndDelete(code) {
  if (confirm('¿Estás seguro de eliminar esta nota?')) {
    await notesStore.deleteNote(code)
  }
}

const editingCode = ref(null)
const editingContent = ref('')

function startInline(nota) {
  editingCode.value = nota.noteCode
  editingContent.value = nota.contentText || ''
}

function cancelInline() {
  editingCode.value = null
  editingContent.value = ''
}

async function saveInline(code) {
  try {
    await notesStore.updateNote(code, { content: editingContent.value, file: null })
    cancelInline()
  } catch {
    loadError.value = 'No se pudo actualizar la nota.'
  }
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>
