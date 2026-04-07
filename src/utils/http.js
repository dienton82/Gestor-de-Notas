import axios from 'axios'

export function isCorsOrNetworkError(error) {
  return (
    axios.isAxiosError(error) &&
    (error.code === 'ERR_NETWORK' ||
      (!error.response && Boolean(error.request)))
  )
}

export function normalizeAuthError(error) {
  if (axios.isAxiosError(error) && error.response?.status === 401) {
    return {
      code: 'AUTH_INVALID_CREDENTIALS',
      message: 'Email o contraseña inválidos',
      canContinueInDemo: false,
      isNetworkError: false
    }
  }

  if (isCorsOrNetworkError(error)) {
    return {
      code: 'AUTH_NETWORK_ERROR',
      message: 'No fue posible conectar con el servidor de autenticación.',
      canContinueInDemo: false,
      isNetworkError: true
    }
  }

  return {
    code: 'AUTH_REQUEST_FAILED',
    message: 'No fue posible iniciar sesion. Intenta de nuevo en unos momentos.',
    canContinueInDemo: false,
    isNetworkError: false
  }
}
