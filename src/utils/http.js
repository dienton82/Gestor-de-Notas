import axios from 'axios'

export function isCorsOrNetworkError(error) {
  return (
    axios.isAxiosError(error) &&
    (error.code === 'ERR_NETWORK' ||
      (!error.response && Boolean(error.request)))
  )
}

export function isUnauthorizedError(error) {
  return axios.isAxiosError(error) && error.response?.status === 401
}

export function normalizeAuthError(error) {
  if (isUnauthorizedError(error)) {
    return {
      code: 'AUTH_INVALID_CREDENTIALS',
      message: 'Email o contraseña inválidos',
      canRetry: false,
      isNetworkError: false
    }
  }

  if (isCorsOrNetworkError(error)) {
    return {
      code: 'AUTH_NETWORK_ERROR',
      message: 'No fue posible conectar con el servidor de autenticación.',
      canRetry: false,
      isNetworkError: true
    }
  }

  return {
    code: 'AUTH_REQUEST_FAILED',
    message: 'No fue posible iniciar sesion. Intenta de nuevo en unos momentos.',
    canRetry: false,
    isNetworkError: false
  }
}

export function normalizeNotesError(error) {
  if (isUnauthorizedError(error)) {
    return {
      code: 'AUTH_SESSION_EXPIRED',
      message: 'Tu sesión venció. Inicia sesión de nuevo.'
    }
  }

  if (isCorsOrNetworkError(error)) {
    return {
      code: 'NOTES_NETWORK_ERROR',
      message: 'No fue posible conectar con el servidor.'
    }
  }

  const serverMessage = error?.response?.data?.message

  return {
    code: 'NOTES_REQUEST_FAILED',
    message: serverMessage || 'No fue posible completar la operación. Intenta nuevamente.'
  }
}
