const SAFE_URL_PROTOCOLS = new Set(['http:', 'https:'])

export function sanitizeExternalUrl(value) {
  if (!value || typeof value !== 'string') {
    return ''
  }

  try {
    const normalized = new URL(value, window.location.origin)
    return SAFE_URL_PROTOCOLS.has(normalized.protocol) ? normalized.toString() : ''
  } catch {
    return ''
  }
}
