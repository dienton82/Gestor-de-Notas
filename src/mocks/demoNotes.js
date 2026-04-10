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
    'NOT-2026-001',
    'Revision de avances del proyecto y asignacion de tareas pendientes para el proximo sprint. Se acordaron fechas de entrega y responsables por modulo.',
    '2026-04-07T08:30:00.000Z',
    'brief-demo.pdf'
  ),
  buildNote(
    'NOT-2026-002',
    'Configurar variables de entorno en el servidor de produccion. Revisar integracion con el servicio de almacenamiento externo y validar permisos de CORS.',
    '2026-04-05T14:15:00.000Z'
  ),
  buildNote(
    'NOT-2026-003',
    'Se aprobo la arquitectura propuesta para el flujo de adjuntos. El equipo de backend se encargara de la integracion con Cloudinary y el frontend ajustara la visualizacion de PDFs.',
    '2026-04-03T18:00:00.000Z'
  )
]

export function cloneDemoNotes() {
  return demoNotes.map(note => ({
    ...note,
    attachments: note.attachments.map(attachment => ({ ...attachment }))
  }))
}
