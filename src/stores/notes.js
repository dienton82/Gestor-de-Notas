// src/stores/notes.js
import { defineStore } from 'pinia'
import apiClient from '../api/client'

export const useNotesStore = defineStore('notes', {
  state: () => ({
    list: []
  }),
  actions: {
    // TRAER TODAS LAS NOTAS (ajustado para usar el wrapper { data: [...] })
    async fetchNotes() {
      try {
        const response = await apiClient.get('/note/')
        console.log('📋 fetchNotes response.data:', response.data)
        // Extraemos el array real de notas
        const notesArray = Array.isArray(response.data.data)
          ? response.data.data
          : []
        this.list = notesArray
      } catch (error) {
        console.error('Error al cargar notas:', error)
      }
    },

    // CREAR NOTA
    async createNote({ title, content, file }) {
      try {
        const form = new FormData()
        form.append('title', title)
        form.append('content', content)
        if (file) form.append('attachment', file)

        const response = await apiClient.post('/note/', form)
        const note = response.data
        console.log('✅ createNote response.data:', note)

        // Si ya tenemos una lista de notas, insertamos la nueva al inicio
        if (Array.isArray(this.list)) {
          this.list.unshift(note)
        } else {
          // Si no, recargamos desde el servidor
          await this.fetchNotes()
        }

        return note
      } catch (error) {
        console.error('Error al crear nota:', error)
        throw error
      }
    },

    // ACTUALIZAR NOTA
    async updateNote(code, { title, content, file }) {
      try {
        const form = new FormData()
        form.append('title', title)
        form.append('content', content)
        if (file) form.append('attachment', file)

        const response = await apiClient.patch(`/note/${code}`, form)
        const updated = response.data
        console.log(`✏️ updateNote ${code} response.data:`, updated)

        const idx = this.list.findIndex(n => n.noteCode === code)
        if (idx !== -1) {
          this.list.splice(idx, 1, updated)
        } else {
          await this.fetchNotes()
        }

        return updated
      } catch (error) {
        console.error(`Error al actualizar nota ${code}:`, error)
        throw error
      }
    },

    // ELIMINAR NOTA
    async deleteNote(code) {
      try {
        await apiClient.delete(`/note/${code}`)
        console.log(`🗑️ deleteNote ${code} OK`)
        this.list = this.list.filter(n => n.noteCode !== code)
      } catch (error) {
        console.error(`Error al eliminar nota ${code}:`, error)
        throw error
      }
    }
  }
})
