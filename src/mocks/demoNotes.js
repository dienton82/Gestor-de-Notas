import { getPublicAssetUrl } from '../utils/assets'

function buildNote(noteCode, contentText, createdAt, attachmentName) {
  return {
    noteCode,
    title: noteCode,
    contentText,
    content: contentText,
    createdAt,
    attachments: attachmentName
        ? [
          {
            name: attachmentName,
            url: getPublicAssetUrl(`demo/${attachmentName}`)
          }
        ]
      : []
  }
}

const demoNotes = [
  buildNote(
    'DEMO-001',
    'Seguimiento del despliegue en GitHub Pages. Esta nota demuestra la navegacion y el layout cuando la API real no esta disponible en la demo publica.',
    '2026-04-07T08:30:00.000Z',
    'brief-demo.pdf'
  ),
  buildNote(
    'DEMO-002',
    'Pendiente: habilitar proxy en desarrollo local si se quiere evitar bloqueo del navegador al apuntar al backend externo desde otra URL.',
    '2026-04-05T14:15:00.000Z'
  ),
  buildNote(
    'DEMO-003',
    'La UI sigue operativa en modo demo: puedes crear, editar y eliminar notas de ejemplo sin depender del backend remoto.',
    '2026-04-03T18:00:00.000Z'
  )
]

export function cloneDemoNotes() {
  return demoNotes.map(note => ({
    ...note,
    attachments: note.attachments.map(attachment => ({ ...attachment }))
  }))
}
