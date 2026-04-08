export function getPublicAssetUrl(path) {
  if (!path || typeof path !== 'string') {
    return ''
  }

  const normalizedPath = path.replace(/^\/+/, '')
  return `${import.meta.env.BASE_URL}${normalizedPath}`
}
