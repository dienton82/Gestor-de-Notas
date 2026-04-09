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

  // En Android, target=_blank puede fallar; abrir en misma pestaña
  if (isMobileDevice()) {
    return {
      href,
      target: '_self',
      rel: undefined,
      download: undefined
    }
  }

  return {
    href,
    target: '_blank',
    rel: 'noopener noreferrer',
    download: undefined
  }
}
