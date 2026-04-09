import { sanitizeExternalUrl } from './security'

function isMobileDevice() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
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

  return {
    href,
    target: '_blank',
    rel: 'noopener noreferrer',
    download: undefined
  }
}

/**
 * Click handler para enlaces de adjuntos.
 * En movil, intercepta el tap y usa window.open() programatico
 * que funciona de forma confiable dentro del gesto del usuario.
 * En desktop no hace nada y deja al <a> funcionar normalmente.
 */
export function openAttachment(event, attachment) {
  if (!isMobileDevice()) {
    return
  }

  const href = sanitizeExternalUrl(attachment?.url || '')

  if (!href || href.startsWith('data:') || href.startsWith('blob:')) {
    return
  }

  event.preventDefault()
  window.open(href, '_blank', 'noopener,noreferrer')
}
