import cors from 'cors'
import express from 'express'
import crypto from 'crypto'
import fs from 'fs'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const publicDir = path.join(__dirname, 'public')
const seedNotesFile = path.join(__dirname, 'data', 'demo-notes.json')
const runtimeNotesFile = path.join(__dirname, 'data', 'runtime-notes.json')

const app = express()
const port = Number(process.env.PORT || 4000)
const cloudinaryCloudName = String(process.env.CLOUDINARY_CLOUD_NAME || '').trim()
const cloudinaryApiKey = String(process.env.CLOUDINARY_API_KEY || '').trim()
const cloudinaryApiSecret = String(process.env.CLOUDINARY_API_SECRET || '').trim()
const cloudinaryFolder = String(process.env.CLOUDINARY_UPLOAD_FOLDER || 'gestor-notas-demo').trim()
const cloudinaryUnsignedUploadPreset = String(
  process.env.CLOUDINARY_UNSIGNED_UPLOAD_PRESET || ''
).trim()
const allowedOrigins = new Set(
  String(process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(value => value.trim())
    .filter(Boolean)
)

app.set('trust proxy', true)

function loadSeedNotes() {
  const raw = fs.readFileSync(seedNotesFile, 'utf8')
  const parsed = JSON.parse(raw)

  return Array.isArray(parsed) ? parsed : []
}

function writeRuntimeNotes(nextNotes) {
  fs.writeFileSync(runtimeNotesFile, JSON.stringify(nextNotes, null, 2))
}

function loadNotes() {
  if (fs.existsSync(runtimeNotesFile)) {
    try {
      const raw = fs.readFileSync(runtimeNotesFile, 'utf8')
      const parsed = JSON.parse(raw)

      if (Array.isArray(parsed)) {
        return parsed
      }
    } catch {
      // Si el archivo runtime queda corrupto, se regenera desde la semilla.
    }
  }

  const seededNotes = loadSeedNotes()
  writeRuntimeNotes(seededNotes)
  return seededNotes
}

let notes = loadNotes()
const validTokens = new Set()

function useCloudinaryStorage() {
  return Boolean(
    cloudinaryCloudName &&
      (cloudinaryUnsignedUploadPreset || (cloudinaryApiKey && cloudinaryApiSecret))
  )
}

function useSignedCloudinaryStorage() {
  return Boolean(cloudinaryCloudName && cloudinaryApiKey && cloudinaryApiSecret)
}

function buildApiBaseUrl(req) {
  const explicitUrl = String(process.env.PUBLIC_API_URL || '').trim()

  if (explicitUrl) {
    return explicitUrl.replace(/\/+$/, '')
  }

  return `${req.protocol}://${req.get('host')}`
}

function buildAttachmentUrl(req, attachment) {
  if (!attachment) {
    return ''
  }

  if (attachment.storage === 'cloudinary' && attachment.url) {
    return String(attachment.url)
  }

  if (attachment.dataUrl && attachment.name && attachment.noteCode) {
    return `${buildApiBaseUrl(req)}/files/runtime/${attachment.noteCode}/${encodeURIComponent(attachment.name)}`
  }

  if (attachment.path) {
    return `${buildApiBaseUrl(req)}/files/${String(attachment.path).replace(/^\/+/, '')}`
  }

  if (attachment.url && /^https?:\/\//i.test(String(attachment.url))) {
    return String(attachment.url)
  }

  return ''
}

function serializeAttachment(req, attachment, noteCode) {
  const url = buildAttachmentUrl(req, {
    ...attachment,
    noteCode
  })

  return {
    name: attachment?.name || 'adjunto-demo',
    url
  }
}

function serializeNote(req, note) {
  return {
    ...note,
    attachments: Array.isArray(note.attachments)
      ? note.attachments.map(attachment => serializeAttachment(req, attachment, note.noteCode))
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

function buildCloudinaryPublicId(noteCode, filename) {
  const safeFilename = sanitizeFilename(filename || 'adjunto-demo.pdf')
  const baseName = path.basename(safeFilename)
  return `${noteCode}-${Date.now()}-${baseName}`
}

function signCloudinaryParams(params) {
  const serialized = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&')

  return crypto
    .createHash('sha1')
    .update(`${serialized}${cloudinaryApiSecret}`)
    .digest('hex')
}

async function uploadAttachmentToCloudinary(file, noteCode) {
  const mimeType = file.mimetype || 'application/pdf'
  const base64Uri = `data:${mimeType};base64,${file.buffer.toString('base64')}`

  console.log('[CLOUDINARY] Subiendo archivo:', file.originalname, '| tamaño:', file.buffer.length, '| tipo:', mimeType)

  const form = new FormData()
  form.append('file', base64Uri)

  const publicId = buildCloudinaryPublicId(noteCode, file.originalname)

  if (cloudinaryUnsignedUploadPreset) {
    form.append('upload_preset', cloudinaryUnsignedUploadPreset)
    form.append('public_id', publicId)
    form.append('access_mode', 'public')
    if (cloudinaryFolder) {
      form.append('folder', cloudinaryFolder)
    }
    console.log('[CLOUDINARY] Modo: unsigned preset =', cloudinaryUnsignedUploadPreset, '| public_id =', publicId, '| folder =', cloudinaryFolder, '| access_mode = public')
  } else {
    const timestamp = Math.floor(Date.now() / 1000)
    const signature = signCloudinaryParams({
      folder: cloudinaryFolder,
      public_id: publicId,
      timestamp
    })

    form.append('api_key', cloudinaryApiKey)
    form.append('timestamp', String(timestamp))
    form.append('folder', cloudinaryFolder)
    form.append('public_id', publicId)
    form.append('signature', signature)
  }

  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/raw/upload`
  console.log('[CLOUDINARY] POST →', uploadUrl)

  const response = await fetch(uploadUrl, {
    method: 'POST',
    body: form
  })

  const responseText = await response.text()
  console.log('[CLOUDINARY] Respuesta status:', response.status, '| body:', responseText.slice(0, 500))

  if (!response.ok) {
    throw createHttpError(502, `No fue posible subir el adjunto a Cloudinary: ${responseText}`)
  }

  const payload = JSON.parse(responseText)
  const finalUrl = payload.secure_url || payload.url

  if (!finalUrl) {
    console.error('[CLOUDINARY] Respuesta sin URL:', responseText.slice(0, 500))
    throw createHttpError(502, 'Cloudinary no devolvió URL del archivo subido')
  }

  console.log('[CLOUDINARY] Subida exitosa:', finalUrl)

  return {
    name: file.originalname || 'adjunto-demo.pdf',
    mimeType: resolveAttachmentMimeType(file.originalname, file.mimetype),
    storage: 'cloudinary',
    publicId: payload.public_id,
    url: finalUrl
  }
}

async function destroyCloudinaryAsset(publicId) {
  if (!useSignedCloudinaryStorage() || !publicId) {
    return
  }

  const timestamp = Math.floor(Date.now() / 1000)
  const signature = signCloudinaryParams({
    public_id: publicId,
    timestamp
  })

  const form = new FormData()
  form.append('api_key', cloudinaryApiKey)
  form.append('public_id', publicId)
  form.append('timestamp', String(timestamp))
  form.append('signature', signature)

  await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/raw/destroy`, {
    method: 'POST',
    body: form
  })
}

function resolveAttachmentMimeType(filename = '', mimeType = '') {
  const normalizedMimeType = String(mimeType || '').trim().toLowerCase()

  if (normalizedMimeType && normalizedMimeType !== 'application/octet-stream') {
    return normalizedMimeType
  }

  if (String(filename).toLowerCase().endsWith('.pdf')) {
    return 'application/pdf'
  }

  return normalizedMimeType || 'application/octet-stream'
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
  if (attachment?.storage === 'cloudinary') {
    void destroyCloudinaryAsset(attachment.publicId)
    return
  }

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

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  }
})

function fileToDataUrl(file) {
  if (!file?.buffer) {
    return ''
  }

  const mimeType = resolveAttachmentMimeType(file.originalname, file.mimetype)
  return `data:${mimeType};base64,${file.buffer.toString('base64')}`
}

function parseDataUrl(dataUrl) {
  const match = String(dataUrl || '').match(/^data:([^;]+);base64,(.+)$/)

  if (!match) {
    return null
  }

  return {
    mimeType: match[1],
    buffer: Buffer.from(match[2], 'base64')
  }
}

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

app.get('/files/runtime/:noteCode/:fileName', (req, res, next) => {
  const note = notes.find(item => item.noteCode === req.params.noteCode)

  if (!note) {
    next(createHttpError(404, 'Archivo no encontrado'))
    return
  }

  const attachment = (note.attachments || []).find(item => item.name === req.params.fileName)

  if (!attachment?.dataUrl) {
    next(createHttpError(404, 'Archivo no encontrado'))
    return
  }

  const parsed = parseDataUrl(attachment.dataUrl)

  if (!parsed) {
    next(createHttpError(500, 'El archivo adjunto no tiene un formato válido'))
    return
  }

  res.setHeader(
    'Content-Type',
    resolveAttachmentMimeType(attachment.name, attachment.mimeType || parsed.mimeType)
  )
  res.setHeader(
    'Content-Disposition',
    `inline; filename="${sanitizeFilename(attachment.name || 'adjunto-demo.pdf')}"`
  )
  res.send(parsed.buffer)
})

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
  ;(async () => {
    const createdAt = new Date().toISOString()
    const content = getFormValue(req.body?.content)
    const title = getFormValue(req.body?.title) || 'Nota demo'
    const noteCode = createDemoNoteCode()
    const uploadedAttachment = req.file
      ? useCloudinaryStorage()
        ? await uploadAttachmentToCloudinary(req.file, noteCode)
        : {
            name: req.file.originalname || 'adjunto-demo.pdf',
            mimeType: resolveAttachmentMimeType(req.file.originalname, req.file.mimetype),
            dataUrl: fileToDataUrl(req.file)
          }
      : null

    const note = {
      noteCode,
      title,
      content,
      contentText: content,
      createdAt,
      attachments: uploadedAttachment ? [uploadedAttachment] : []
    }

    notes.unshift(note)
    writeRuntimeNotes(notes)
    res.status(201).json(serializeNote(req, note))
  })().catch(error => {
    next(error)
  })
})

app.patch('/note/:noteCode', requireAuth, upload.single('attachment'), (req, res, next) => {
  ;(async () => {
    const index = notes.findIndex(item => item.noteCode === req.params.noteCode)

    if (index === -1) {
      throw createHttpError(404, 'Nota no encontrada')
    }

    const existing = notes[index]
    const content = getFormValue(req.body?.content, existing.contentText)
    const title = getFormValue(req.body?.title, existing.title || existing.noteCode)
    const attachments = req.file
      ? [
          useCloudinaryStorage()
            ? await uploadAttachmentToCloudinary(req.file, existing.noteCode)
            : {
                name: req.file.originalname || 'adjunto-demo.pdf',
                mimeType: resolveAttachmentMimeType(req.file.originalname, req.file.mimetype),
                dataUrl: fileToDataUrl(req.file)
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
    writeRuntimeNotes(notes)
    res.json(serializeNote(req, updated))
  })().catch(error => {
    next(error)
  })
})

app.delete('/note/:noteCode', requireAuth, (req, res, next) => {
  try {
    const index = notes.findIndex(item => item.noteCode === req.params.noteCode)

    if (index === -1) {
      throw createHttpError(404, 'Nota no encontrada')
    }

    const [removed] = notes.splice(index, 1)
    ;(removed.attachments || []).forEach(removeAttachmentFile)
    writeRuntimeNotes(notes)

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
