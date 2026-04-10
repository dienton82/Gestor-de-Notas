import { cloneDemoNotes } from './demoNotes'
import { getPublicAssetUrl } from '../utils/assets'

const NOTES_STORAGE_KEY = 'mock-notes'
const TOKEN_STORAGE_KEY = 'jwt'
const DEMO_USER_STORAGE_KEY = 'mock-user-email'

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function normalizeAttachments(attachments = []) {
  return attachments.map(attachment => {
    if (attachment?.name === 'brief-demo.pdf') {
      return {
        ...attachment,
        url: getPublicAssetUrl('demo/brief-demo.pdf')
      }
    }

    return attachment
  })
}

function normalizeNotes(notes = []) {
  return notes.map(note => ({
    ...note,
    attachments: normalizeAttachments(note.attachments || [])
  }))
}

function readNotes() {
  const saved = localStorage.getItem(NOTES_STORAGE_KEY)

  if (!saved) {
    const initialNotes = normalizeNotes(cloneDemoNotes())
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(initialNotes))
    return initialNotes
  }

  try {
    const parsed = JSON.parse(saved)
    const normalized = Array.isArray(parsed) ? normalizeNotes(parsed) : normalizeNotes(cloneDemoNotes())
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(normalized))
    return normalized
  } catch {
    const fallback = normalizeNotes(cloneDemoNotes())
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(fallback))
    return fallback
  }
}

function writeNotes(notes) {
  localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes))
}

function makeAxiosError(message, status) {
  const error = new Error(message)
  error.name = 'AxiosError'
  error.isAxiosError = true
  error.response = {
    status,
    data: { message }
  }
  return error
}

function readFormDataValue(payload, key) {
  if (payload instanceof FormData) {
    return payload.get(key)
  }

  return payload?.[key]
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '')
    reader.onerror = () => reject(new Error('No fue posible leer el archivo adjunto'))
    reader.readAsDataURL(file)
  })
}

async function buildNotePayload(existing, payload) {
  const content = readFormDataValue(payload, 'content') || existing?.contentText || ''
  const title = readFormDataValue(payload, 'title') || existing?.title || existing?.noteCode || 'Sin titulo'
  const file = readFormDataValue(payload, 'attachment')
  const attachmentUrl = file ? await fileToDataUrl(file) : ''

  return {
    ...existing,
    title,
    content,
    contentText: content,
    attachments: file
      ? [
          {
            name: file.name || 'adjunto',
            url: attachmentUrl
          }
        ]
      : existing?.attachments || []
  }
}

function ensureAuthenticated(headers = {}) {
  const authHeader = headers.Authorization || headers.authorization
  const savedToken = localStorage.getItem(TOKEN_STORAGE_KEY)

  if (!authHeader || !savedToken || authHeader !== `Bearer ${savedToken}`) {
    throw makeAxiosError('No autorizado', 401)
  }
}

const mockApiClient = {
  defaults: {
    headers: {
      common: {}
    }
  },
  interceptors: {
    request: {
      use() {}
    }
  },
  async post(url, payload, config = {}) {
    if (url === '/auth/signin') {
      const email = (payload?.email || '').trim()
      const password = (payload?.password || '').trim()

      if (!email || !password) {
        throw makeAxiosError('Credenciales invalidas', 401)
      }

      const token = `mock-jwt-${Date.now()}`
      localStorage.setItem(TOKEN_STORAGE_KEY, token)
      localStorage.setItem(DEMO_USER_STORAGE_KEY, email)

      return {
        data: {
          apiKey: token,
          user: {
            email
          }
        }
      }
    }

    if (url === '/note/') {
      ensureAuthenticated(config.headers || this.defaults.headers.common)

      const notes = readNotes()
      const noteCode = `NOT-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`
      const created = {
        noteCode,
        createdAt: new Date().toISOString(),
        ...(await buildNotePayload(
          {
            noteCode,
            createdAt: new Date().toISOString(),
            attachments: []
          },
          payload
        ))
      }

      notes.unshift(created)
      writeNotes(notes)

      return { data: clone(created) }
    }

    throw makeAxiosError('Endpoint no soportado', 404)
  },
  async get(url, config = {}) {
    if (url === '/note/') {
      ensureAuthenticated(config.headers || this.defaults.headers.common)
      return {
        data: {
          data: clone(readNotes())
        }
      }
    }

    if (url.startsWith('/note/')) {
      ensureAuthenticated(config.headers || this.defaults.headers.common)
      const noteCode = url.replace('/note/', '').trim()
      const note = readNotes().find(item => item.noteCode === noteCode)

      if (!note) {
        throw makeAxiosError('Nota no encontrada', 404)
      }

      return { data: clone(note) }
    }

    throw makeAxiosError('Endpoint no soportado', 404)
  },
  async patch(url, payload, config = {}) {
    if (!url.startsWith('/note/')) {
      throw makeAxiosError('Endpoint no soportado', 404)
    }

    ensureAuthenticated(config.headers || this.defaults.headers.common)

    const noteCode = url.replace('/note/', '').trim()
    const notes = readNotes()
    const index = notes.findIndex(item => item.noteCode === noteCode)

    if (index === -1) {
      throw makeAxiosError('Nota no encontrada', 404)
    }

    const updated = {
      ...notes[index],
      ...(await buildNotePayload(notes[index], payload))
    }

    notes.splice(index, 1, updated)
    writeNotes(notes)

    return { data: clone(updated) }
  },
  async delete(url, config = {}) {
    if (!url.startsWith('/note/')) {
      throw makeAxiosError('Endpoint no soportado', 404)
    }

    ensureAuthenticated(config.headers || this.defaults.headers.common)

    const noteCode = url.replace('/note/', '').trim()
    const notes = readNotes().filter(item => item.noteCode !== noteCode)
    writeNotes(notes)

    return { data: { success: true } }
  }
}

export default mockApiClient
