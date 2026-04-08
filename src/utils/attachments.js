import { sanitizeExternalUrl } from './security'

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

  const shouldDownload = href.startsWith('data:') || href.startsWith('blob:')

  return {
    href,
    target: shouldDownload ? undefined : '_blank',
    rel: shouldDownload ? undefined : 'noopener noreferrer',
    download: shouldDownload ? attachment?.name || 'adjunto' : undefined
  }
}
