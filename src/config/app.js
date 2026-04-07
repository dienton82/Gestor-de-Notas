const DEFAULT_API_URL = 'https://stg.prolibu.com/v2'

const rawApiUrl = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).trim()

export const isProductionBuild = import.meta.env.PROD
export const useApiProxyInDev =
  import.meta.env.DEV && import.meta.env.VITE_USE_API_PROXY === 'true'
export const allowPublicDemoMode =
  isProductionBuild && import.meta.env.VITE_PUBLIC_DEMO_MODE !== 'false'

export const API_URL = useApiProxyInDev
  ? '/api'
  : rawApiUrl.replace(/\/+$/, '')

export const PUBLIC_DEMO_AUTH_MESSAGE =
  'La demo pública no puede autenticarse por restricciones CORS del servidor externo. El proyecto funciona correctamente en entorno local o con backend/proxy habilitado.'
