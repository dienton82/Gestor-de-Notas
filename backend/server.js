import cors from 'cors'
import express from 'express'
import fs from 'fs'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const publicDir = path.join(__dirname, 'public')
const uploadsDir = path.join(publicDir, 'uploads')
const notesFile = path.join(__dirname, 'data', 'demo-notes.json')

fs.mkdirSync(uploadsDir, { recursive: true })

const app = express()
const port = Number(process.env.PORT || 4000)
const allowedOrigins = new Set(
  String(process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(value => value.trim())
    .filter(Boolean)
)

app.set('trust proxy', true)

function loadSeedNotes() {
  const raw = fs.readFileSync(notesFile, 'utf8')
  const parsed = JSON.parse(raw)

  return Array.isArray(parsed) ? parsed : []
}

let notes = loadSeedNotes()
const validTokens = new Set()

function buildApiBaseUrl(req) {
  const explicitUrl = String(process.env.PUBLIC_API_URL || '').trim()

  if (explicitUrl) {
    return explicitUrl.replace(/\/+$/, '')
  }

  return `${req.protocol}://${req.get('host')}`
}

function buildAttachmentUrl(req, attachment) {
  if (!attachment?.path) {
    return ''
  }

  return `${buildApiBaseUrl(req)}/files/${String(attachment.path).replace(/^\/+/, '')}`
}

function serializeAttachment(req, attachment) {
  return {
    name: attachment?.name || 'adjunto-demo',
    url: buildAttachmentUrl(req, attachment)
  }
}

function serializeNote(req, note) {
  return {
    ...note,
    attachments: Array.isArray(note.attachments)
      ? note.attachments.map(attachment => serializeAttachment(req, attachment))
      : []
  }
}

function createHttpError(status, message) {
  const error = new Error(message)
  error.status = status
  return error
}

function sanitizeFilename(filename = 'adjunto-demo') {
  const ext = path.extname(filename)
  const baseName = path.basename(filename, ext)
  const normalizedBase = baseName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)

  return `${normalizedBase || 'adjunto-demo'}${ext.toLowerCase()}`
}

function createDemoNoteCode() {
  const maxNumber = notes.reduce((currentMax, note) => {
    const match = String(note.noteCode || '').match(/^DEMO-(\d+)$/)
    const numericCode = match ? Number(match[1]) : 0
    return Math.max(currentMax, numericCode)
  }, 0)

  return `DEMO-${String(maxNumber + 1).padStart(3, '0')}`
}

function getFormValue(value, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback
}

function removeAttachmentFile(attachment) {
  if (!attachment?.path || !String(attachment.path).startsWith('uploads/')) {
    return
  }

  const absolutePath = path.join(publicDir, attachment.path)

  if (fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath)
  }
}

function requireAuth(req, _res, next) {
  const authHeader = req.get('authorization') || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : ''

  if (!token || !validTokens.has(token)) {
    next(createHttpError(401, 'No autorizado'))
    return
  }

  req.token = token
  next()
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (_req, file, cb) => {
    const timestamp = Date.now()
    const filename = `${timestamp}-${sanitizeFilename(file.originalname)}`
    cb(null, filename)
  }
})

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
})

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.size === 0 || allowedOrigins.has(origin)) {
        callback(null, true)
        return
      }

      callback(createHttpError(403, 'Origen no permitido por CORS'))
    }
  })
)

app.use(express.json())
app.use('/files', express.static(publicDir, { maxAge: '1d' }))

app.get('/health', (_req, res) => {
  res.json({ ok: true })
})

app.post('/auth/signin', (req, res, next) => {
  try {
    const email = getFormValue(req.body?.email)
    const password = getFormValue(req.body?.password)

    if (!email || !password) {
      throw createHttpError(401, 'Ingresa tu correo y contraseña.')
    }

    const token = `demo-jwt-${Date.now()}`
    validTokens.add(token)

    res.json({
      apiKey: token,
      user: {
        email,
        demo: true
      }
    })
  } catch (error) {
    next(error)
  }
})

app.get('/note/', requireAuth, (req, res) => {
  res.json({
    data: notes.map(note => serializeNote(req, note))
  })
})

app.get('/note/:noteCode', requireAuth, (req, res, next) => {
  const note = notes.find(item => item.noteCode === req.params.noteCode)

  if (!note) {
    next(createHttpError(404, 'Nota no encontrada'))
    return
  }

  res.json(serializeNote(req, note))
})

app.post('/note/', requireAuth, upload.single('attachment'), (req, res, next) => {
  try {
    const createdAt = new Date().toISOString()
    const content = getFormValue(req.body?.content)
    const title = getFormValue(req.body?.title) || 'Nota demo'
    const noteCode = createDemoNoteCode()

    const note = {
      noteCode,
      title,
      content,
      contentText: content,
      createdAt,
      attachments: req.file
        ? [
            {
              name: req.file.originalname || req.file.filename,
              path: `uploads/${req.file.filename}`
            }
          ]
        : []
    }

    notes.unshift(note)
    res.status(201).json(serializeNote(req, note))
  } catch (error) {
    next(error)
  }
})

app.patch('/note/:noteCode', requireAuth, upload.single('attachment'), (req, res, next) => {
  try {
    const index = notes.findIndex(item => item.noteCode === req.params.noteCode)

    if (index === -1) {
      throw createHttpError(404, 'Nota no encontrada')
    }

    const existing = notes[index]
    const content = getFormValue(req.body?.content, existing.contentText)
    const title = getFormValue(req.body?.title, existing.title || existing.noteCode)
    const attachments = req.file
      ? [
          {
            name: req.file.originalname || req.file.filename,
            path: `uploads/${req.file.filename}`
          }
        ]
      : existing.attachments || []

    if (req.file) {
      ;(existing.attachments || []).forEach(removeAttachmentFile)
    }

    const updated = {
      ...existing,
      title,
      content,
      contentText: content,
      attachments
    }

    notes.splice(index, 1, updated)
    res.json(serializeNote(req, updated))
  } catch (error) {
    next(error)
  }
})

app.delete('/note/:noteCode', requireAuth, (req, res, next) => {
  try {
    const index = notes.findIndex(item => item.noteCode === req.params.noteCode)

    if (index === -1) {
      throw createHttpError(404, 'Nota no encontrada')
    }

    const [removed] = notes.splice(index, 1)
    ;(removed.attachments || []).forEach(removeAttachmentFile)

    res.json({ success: true })
  } catch (error) {
    next(error)
  }
})

app.use((error, _req, res, _next) => {
  const status = Number(error?.status || 500)
  const message = error?.message || 'Error interno del servidor'

  res.status(status).json({
    message
  })
})

app.listen(port, () => {
  console.log(`Demo API lista en http://localhost:${port}`)
})
