import { defineStore } from 'pinia'
import apiClient from '../api/client'
import { cloneDemoNotes } from '../mocks/demoNotes'
import { useAuthStore } from './auth'

export const useNotesStore = defineStore('notes', {
  state: () => ({
    list: []
  }),
  actions: {
    ensureDemoNotes() {
      if (!this.list.length) {
        this.list = cloneDemoNotes()
      }

      return this.list
    },
    async fetchNotes() {
      const authStore = useAuthStore()

      if (authStore.publicDemoMode) {
        return this.ensureDemoNotes()
      }

      const response = await apiClient.get('/note/')
      const notesArray = Array.isArray(response.data.data)
        ? response.data.data
        : []

      this.list = notesArray
      return this.list
    },
    async createNote({ title, content, file }) {
      const authStore = useAuthStore()

      if (authStore.publicDemoMode) {
        const demoNote = {
          noteCode: `DEMO-${Date.now().toString().slice(-6)}`,
          title: title || 'Nota demo',
          contentText: content,
          content,
          createdAt: new Date().toISOString(),
          attachments: file
            ? [
                {
                  name: file.name,
                  url: '#'
                }
              ]
            : []
        }

        this.list.unshift(demoNote)
        return demoNote
      }

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
      const authStore = useAuthStore()

      if (authStore.publicDemoMode) {
        const idx = this.list.findIndex(n => n.noteCode === code)

        if (idx === -1) {
          throw new Error('La nota demo no existe.')
        }

        const current = this.list[idx]
        const updated = {
          ...current,
          title: title || current.title,
          contentText: content,
          content
        }

        if (file) {
          updated.attachments = [
            {
              name: file.name,
              url: '#'
            }
          ]
        }

        this.list.splice(idx, 1, updated)
        return updated
      }

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
      const authStore = useAuthStore()

      if (authStore.publicDemoMode) {
        this.list = this.list.filter(n => n.noteCode !== code)
        return
      }

      await apiClient.delete(`/note/${code}`)
      this.list = this.list.filter(n => n.noteCode !== code)
    }
  }
})
