<template>
  <div :class="styles.container">
    <header :class="styles.header">
      <h1 :class="styles.title">Mis Notas</h1>
      <div :class="styles.headerActions">
        <button :class="[styles.btn, styles.btnSecondary]" @click="logout">
          <LogOut :size="16" :class="styles.buttonIcon" />
          Cerrar sesión
        </button>
        <button :class="[styles.btn, styles.btnPrimary]" @click="goToNew">
          <Plus :size="16" :class="styles.buttonIcon" />
          Nueva Nota
        </button>
      </div>
    </header>

    <div :class="styles.filters">
      <div :class="styles.searchField">
        <Search :size="16" :class="styles.searchIcon" />
        <input
          v-model="searchTerm"
          :class="styles.searchInput"
          placeholder="Buscar por título o contenido"
        />
      </div>
      <div ref="sortMenuRef" :class="styles.selectField">
        <button
          type="button"
          :class="[styles.selectButton, isSortMenuOpen && styles.selectButtonOpen]"
          :aria-expanded="isSortMenuOpen"
          aria-haspopup="listbox"
          @click="toggleSortMenu"
        >
          <span :class="styles.selectButtonLabel">{{ currentSortLabel }}</span>
          <ChevronDown
            :size="16"
            :class="[styles.selectIcon, isSortMenuOpen && styles.selectIconOpen]"
          />
        </button>
        <div v-if="isSortMenuOpen" :class="styles.selectMenu" role="listbox" aria-label="Ordenar notas">
          <button
            v-for="option in sortOptions"
            :key="option.value"
            type="button"
            role="option"
            :aria-selected="sortKey === option.value"
            :class="[styles.selectOption, sortKey === option.value && styles.selectOptionActive]"
            @click="selectSortOption(option.value)"
          >
            <span>{{ option.label }}</span>
            <Check v-if="sortKey === option.value" :size="16" :class="styles.optionCheck" />
          </button>
        </div>
      </div>
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
        <h2 :class="styles.groupTitle">
          <CalendarDays :size="16" :class="styles.groupIcon" />
          {{ label }}
        </h2>
        <ul :class="styles.list">
          <li v-for="nota in group" :key="nota.noteCode" :class="styles.item">
            <div v-if="editingCode === nota.noteCode" :class="styles.inlineEditor">
              <textarea
                v-model="editingContent"
                :class="styles.editTextarea"
                rows="3"
              ></textarea>

              <div :class="styles.inlineButtons">
                <button :class="[styles.btn, styles.btnPrimary]" @click="saveInline(nota.noteCode)">
                  <Save :size="16" :class="styles.buttonIcon" />
                  Guardar
                </button>
                <button :class="[styles.btn, styles.btnSecondary]" @click="cancelInline">
                  <X :size="16" :class="styles.buttonIcon" />
                  Cancelar
                </button>
              </div>
            </div>

            <div v-else :class="styles.itemContent" @dblclick="handleCardDblClick(nota)">
              <NoteCard
                :title="nota.noteCode"
                :content="nota.contentText"
                :attachments="nota.attachments || []"
                :show-inline-hint="true"
              />
              <div :class="styles.meta">
                <span :class="styles.metaItem">
                  <CalendarDays :size="16" :class="styles.metaIcon" />
                  {{ formatDate(nota.createdAt) }}
                </span>
                <span v-if="nota.attachments?.length && attachmentLink(nota.attachments[0]).href">
                  <Paperclip :size="16" :class="styles.metaIcon" />
                  <a
                    :href="attachmentLink(nota.attachments[0]).href"
                    :target="attachmentLink(nota.attachments[0]).target"
                    :rel="attachmentLink(nota.attachments[0]).rel"
                    :download="attachmentLink(nota.attachments[0]).download"
                  >
                    {{ nota.attachments[0].name || 'Ver archivo' }}
                  </a>
                </span>
              </div>
              <div :class="styles.actions">
                <button :class="styles.linkEdit" @click.stop="editNote(nota)">
                  <Pencil :size="16" :class="styles.buttonIcon" />
                  Editar
                </button>
                <button :class="styles.linkDelete" @click.stop="confirmAndDelete(nota.noteCode)">
                  <Trash2 :size="16" :class="styles.buttonIcon" />
                  Eliminar
                </button>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <nav v-if="pageCount > 1" :class="styles.pagination">
      <button :disabled="page === 1" @click="page--">
        <ChevronLeft :size="16" :class="styles.buttonIcon" />
        Anterior
      </button>
      <span>Página {{ page }} de {{ pageCount }}</span>
      <button :disabled="page === pageCount" @click="page++">
        Siguiente
        <ChevronRight :size="16" :class="styles.buttonIcon" />
      </button>
    </nav>
  </div>
  <ConfirmDialog
    :open="isDeleteDialogOpen"
    title="Eliminar nota"
    message="Esta nota se eliminará de forma permanente. Puedes cancelar si todavía quieres conservarla."
    @cancel="closeDeleteDialog"
    @confirm="deleteSelectedNote"
  />
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Paperclip,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
  X
} from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useNotesStore } from '../stores/notes'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import NoteCard from '../components/NoteCard.vue'
import { getAttachmentLinkAttributes } from '../utils/attachments'
import { normalizeNotesError } from '../utils/http'
import styles from './NotesList.module.css'

const router = useRouter()
const auth = useAuthStore()
const notesStore = useNotesStore()

const loading = ref(true)
const loadError = ref('')
const searchTerm = ref('')
const sortKey = ref('createdAt')
const page = ref(1)
const pageSize = ref(5)
const isSortMenuOpen = ref(false)
const sortMenuRef = ref(null)
const isDeleteDialogOpen = ref(false)
const noteCodeToDelete = ref(null)
const isMobileViewport = ref(false)

const sortOptions = [
  { value: 'createdAt', label: 'Ordenar por fecha' },
  { value: 'noteCode', label: 'Ordenar por código' },
  { value: 'contentText', label: 'Ordenar por contenido' }
]

const currentSortLabel = computed(() =>
  sortOptions.find(option => option.value === sortKey.value)?.label || 'Ordenar por fecha'
)

onMounted(async () => {
  syncViewportMode()

  try {
    await notesStore.fetchNotes()
  } catch (err) {
    handleNotesError(err)
  } finally {
    loading.value = false
  }

  document.addEventListener('pointerdown', handlePointerDown)
  window.addEventListener('resize', syncViewportMode)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handlePointerDown)
  window.removeEventListener('resize', syncViewportMode)
})

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

function toggleSortMenu() {
  isSortMenuOpen.value = !isSortMenuOpen.value
}

function selectSortOption(value) {
  sortKey.value = value
  page.value = 1
  isSortMenuOpen.value = false
}

function handlePointerDown(event) {
  if (!sortMenuRef.value?.contains(event.target)) {
    isSortMenuOpen.value = false
  }
}

function editNote(nota) {
  if (isMobileViewport.value) {
    startInline(nota)
    return
  }

  router.push(`/notes/${nota.noteCode}/edit`)
}

async function confirmAndDelete(code) {
  noteCodeToDelete.value = code
  isDeleteDialogOpen.value = true
}

function closeDeleteDialog() {
  isDeleteDialogOpen.value = false
  noteCodeToDelete.value = null
}

async function deleteSelectedNote() {
  if (!noteCodeToDelete.value) {
    closeDeleteDialog()
    return
  }

  try {
    await notesStore.deleteNote(noteCodeToDelete.value)
    closeDeleteDialog()
  } catch (err) {
    closeDeleteDialog()
    handleNotesError(err)
  }
}

const editingCode = ref(null)
const editingContent = ref('')

function startInline(nota) {
  editingCode.value = nota.noteCode
  editingContent.value = nota.contentText || ''
}

function handleCardDblClick(nota) {
  if (isMobileViewport.value) {
    return
  }

  startInline(nota)
}

function cancelInline() {
  editingCode.value = null
  editingContent.value = ''
}

async function saveInline(code) {
  try {
    const normalizedContent = editingContent.value.trim()

    if (!normalizedContent) {
      loadError.value = 'El contenido no puede estar vacío.'
      return
    }

    await notesStore.updateNote(code, { content: normalizedContent, file: null })
    cancelInline()
  } catch (err) {
    handleNotesError(err)
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

function handleNotesError(err) {
  const normalizedError = normalizeNotesError(err)
  loadError.value = normalizedError.message

  if (normalizedError.code === 'AUTH_SESSION_EXPIRED') {
    auth.logout()
    router.push('/login')
  }
}

function attachmentLink(attachment) {
  return getAttachmentLinkAttributes(attachment)
}

function syncViewportMode() {
  isMobileViewport.value = window.innerWidth <= 860
}
</script>
