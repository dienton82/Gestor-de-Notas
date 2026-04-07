import { defineStore } from 'pinia'
import apiClient from '../api/client'
import { normalizeAuthError } from '../utils/http'
import { useMockBackend } from '../config/app'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('jwt') || ''
  }),
  getters: {
    isLoggedIn: state => Boolean(state.token),
    canAccessProtectedRoutes: state => Boolean(state.token)
  },
  actions: {
    async login(email, password) {
      try {
        const { data } = await apiClient.post('/auth/signin', { email, password })
        const jwt = data.apiKey

        this.token = jwt

        localStorage.setItem('jwt', jwt)
        apiClient.defaults.headers.common.Authorization = `Bearer ${jwt}`

        return { mode: useMockBackend ? 'mock' : 'authenticated' }
      } catch (error) {
        const authError = normalizeAuthError(error)
        const wrappedError = new Error(authError.message)

        wrappedError.code = authError.code
        throw wrappedError
      }
    },
    logout() {
      this.token = ''

      localStorage.removeItem('jwt')
      delete apiClient.defaults.headers.common.Authorization
    }
  }
})
