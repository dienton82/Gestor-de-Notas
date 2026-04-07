import { defineStore } from 'pinia'
import apiClient from '../api/client'

export const useNotesStore = defineStore('notes', {
  state: () => ({
    list: []
  }),
  actions: {
    async fetchNotes() {
      const response = await apiClient.get('/note/')
      const notesArray = Array.isArray(response.data.data)
        ? response.data.data
        : []

      this.list = notesArray
      return this.list
    },
    async createNote({ title, content, file }) {
      const form = new FormData()
      form.append('title', title || '')
      form.append('content', content)
      if (file) form.append('attachment', file)

      const response = await apiClient.post('/note/', form)
      const note = response.data

      if (Array.isArray(this.list)) {
        this.list.unshift(note)
      } else {
        await this.fetchNotes()
      }

      return note
    },
    async updateNote(code, { title, content, file }) {
      const form = new FormData()
      form.append('title', title || '')
      form.append('content', content)
      if (file) form.append('attachment', file)

      const response = await apiClient.patch(`/note/${code}`, form)
      const updated = response.data

      const idx = this.list.findIndex(n => n.noteCode === code)
      if (idx !== -1) {
        this.list.splice(idx, 1, updated)
      } else {
        await this.fetchNotes()
      }

      return updated
    },
    async deleteNote(code) {
      await apiClient.delete(`/note/${code}`)
      this.list = this.list.filter(n => n.noteCode !== code)
    }
  }
})
