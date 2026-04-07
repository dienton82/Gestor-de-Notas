// src/api/client.js
import axios from 'axios'
import { API_URL, useMockBackend } from '../config/app'
import mockApiClient from '../mocks/mockBackend'

const apiClient = useMockBackend
  ? mockApiClient
  : axios.create({
      baseURL: API_URL,
      headers: { 'Content-Type': 'application/json' }
    })

const savedToken = localStorage.getItem('jwt')
if (savedToken) {
  apiClient.defaults.headers.common.Authorization = `Bearer ${savedToken}`
}

apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('jwt')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  } else if (config.headers?.Authorization) {
    delete config.headers.Authorization
  }
  return config
})

export default apiClient
