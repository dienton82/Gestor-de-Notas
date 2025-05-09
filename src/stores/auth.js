import { defineStore } from 'pinia'
import apiClient from '../api/client'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('jwt') || ''
  }),
  getters: {
    isLoggedIn: state => Boolean(state.token)
  },
// src/stores/auth.js (sólo la parte relevante)
actions: {
  async login(email, password) {
    const { data } = await apiClient.post('/auth/signin', { email, password })
    const jwt = data.apiKey
    this.token = jwt
    localStorage.setItem('jwt', jwt)
    // Este seteo inicial asegura que después de login ya lo tengas disponible
    apiClient.defaults.headers.common.Authorization = `Bearer ${jwt}`
  },
  logout() {
    this.token = ''
    localStorage.removeItem('jwt')
    delete apiClient.defaults.headers.common.Authorization
  }
}
})