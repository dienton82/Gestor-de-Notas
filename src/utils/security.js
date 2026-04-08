const SAFE_URL_PROTOCOLS = new Set(['http:', 'https:', 'blob:'])

function isSafeDataUrl(value) {
  return /^data:application\/pdf(;base64)?,/i.test(value)
}

export function sanitizeExternalUrl(value) {
  if (!value || typeof value !== 'string') {
    return ''
  }

  if (isSafeDataUrl(value)) {
    return value
  }

  try {
    const normalized = new URL(value, window.location.origin)
    return SAFE_URL_PROTOCOLS.has(normalized.protocol) ? normalized.toString() : ''
  } catch {
    return ''
  }
}
