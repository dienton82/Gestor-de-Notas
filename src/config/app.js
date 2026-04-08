const DEFAULT_REAL_API_URL = 'https://stg.prolibu.com/v2'
const DEFAULT_DEMO_API_URL = 'http://localhost:4000'
const configuredApiMode = (import.meta.env.VITE_API_MODE || '').trim().toLowerCase()
const rawRealApiUrl = (import.meta.env.VITE_API_URL || DEFAULT_REAL_API_URL).trim()
const rawDemoApiUrl = (import.meta.env.VITE_DEMO_API_URL || DEFAULT_DEMO_API_URL).trim()

export const isProductionBuild = import.meta.env.PROD
export const apiMode = configuredApiMode || (isProductionBuild ? 'demo' : 'real')
export const useApiProxyInDev =
  import.meta.env.DEV && apiMode === 'real' && import.meta.env.VITE_USE_API_PROXY === 'true'

export const useMockBackend = apiMode === 'mock'
export const useDemoBackend = apiMode === 'demo'

export const API_URL = useApiProxyInDev
  ? '/api'
  : (useDemoBackend ? rawDemoApiUrl : rawRealApiUrl).replace(/\/+$/, '')

export const MOCK_DEMO_MESSAGE =
  'La demo pública usa un backend demo dedicado para mantener el flujo funcional sin depender de la API externa.'
