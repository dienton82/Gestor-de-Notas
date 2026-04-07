const DEFAULT_API_URL = 'https://stg.prolibu.com/v2'
const rawApiUrl = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).trim()
const configuredApiMode = (import.meta.env.VITE_API_MODE || '').trim().toLowerCase()

export const isProductionBuild = import.meta.env.PROD
export const useApiProxyInDev =
  import.meta.env.DEV && import.meta.env.VITE_USE_API_PROXY === 'true'

export const useMockBackend = configuredApiMode
  ? configuredApiMode === 'mock'
  : isProductionBuild

export const API_URL = useApiProxyInDev
  ? '/api'
  : rawApiUrl.replace(/\/+$/, '')

export const MOCK_DEMO_MESSAGE =
  'La demo pública usa un backend mock local para mantener el flujo funcional en GitHub Pages.'
