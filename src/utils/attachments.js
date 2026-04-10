import { sanitizeExternalUrl } from './security'

const LARGE_FILE_THRESHOLD = 2 * 1024 * 1024 // 2 MB

function isMobileDevice() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
}

function isLargeFile(attachment) {
  return typeof attachment?.size === 'number' && attachment.size >= LARGE_FILE_THRESHOLD
}

export function getAttachmentLinkAttributes(attachment) {
  const href = sanitizeExternalUrl(attachment?.url || '')

  if (!href) {
    return {
      href: '',
      target: undefined,
      rel: undefined,
      download: undefined
    }
  }

  const isDataOrBlob = href.startsWith('data:') || href.startsWith('blob:')

  if (isDataOrBlob) {
    return {
      href,
      target: undefined,
      rel: undefined,
      download: attachment?.name || 'adjunto'
    }
  }

  if (isLargeFile(attachment)) {
    return {
      href,
      target: '_blank',
      rel: 'noopener noreferrer',
      download: attachment?.name || 'adjunto.pdf'
    }
  }

  return {
    href,
    target: '_blank',
    rel: 'noopener noreferrer',
    download: undefined
  }
}

/**
 * Click handler para enlaces de adjuntos.
 *
 * - Archivos grandes (>= 2 MB): en cualquier dispositivo, descarga via
 *   fetch + blob para evitar que el visor integrado del navegador se cuelgue
 *   con PDFs pesados o no linearizados.
 * - Archivos normales en movil: usa window.open() programatico que funciona
 *   de forma confiable dentro del gesto del usuario.
 * - Archivos normales en desktop: no interviene, deja al <a> funcionar.
 */
export function openAttachment(event, attachment) {
  const href = sanitizeExternalUrl(attachment?.url || '')

  if (!href || href.startsWith('data:') || href.startsWith('blob:')) {
    return
  }

  if (isLargeFile(attachment)) {
    event.preventDefault()
    downloadFile(href, attachment?.name || 'adjunto.pdf')
    return
  }

  if (isMobileDevice()) {
    event.preventDefault()
    window.open(href, '_blank', 'noopener,noreferrer')
  }
}

async function downloadFile(href, filename) {
  try {
    const response = await fetch(href)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const blob = await response.blob()
    const blobUrl = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = blobUrl
    anchor.download = filename
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    setTimeout(() => URL.revokeObjectURL(blobUrl), 5000)
  } catch {
    window.open(href, '_blank', 'noopener,noreferrer')
  }
}
