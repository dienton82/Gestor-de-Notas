// src/api/client.js
import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'https://stg.prolibu.com/v2',
  headers: { 'Content-Type': 'application/json' }
})

// Si al iniciar ya hay token en localStorage, lo ponemos en los headers por defecto
const savedToken = localStorage.getItem('jwt')
if (savedToken) {
  apiClient.defaults.headers.common.Authorization = `Bearer ${savedToken}`
}

// Además, interceptor para cada petición (por si el token cambia en otra pestaña)
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('jwt')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default apiClient