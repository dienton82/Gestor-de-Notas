import axios from 'axios'
import {
  PUBLIC_DEMO_AUTH_MESSAGE,
  allowPublicDemoMode
} from '../config/app'

export function isCorsOrNetworkError(error) {
  return (
    axios.isAxiosError(error) &&
    (error.code === 'ERR_NETWORK' ||
      (!error.response && Boolean(error.request)))
  )
}

export function normalizeAuthError(error) {
  if (isCorsOrNetworkError(error)) {
    return {
      code: 'PUBLIC_DEMO_CORS_RESTRICTION',
      message: PUBLIC_DEMO_AUTH_MESSAGE,
      canContinueInDemo: allowPublicDemoMode
    }
  }

  if (axios.isAxiosError(error) && error.response?.status === 401) {
    return {
      code: 'INVALID_CREDENTIALS',
      message: 'Email o contraseña inválidos',
      canContinueInDemo: false
    }
  }

  return {
    code: 'AUTH_REQUEST_FAILED',
    message: 'No fue posible iniciar sesion. Intenta de nuevo en unos momentos.',
    canContinueInDemo: false
  }
}
