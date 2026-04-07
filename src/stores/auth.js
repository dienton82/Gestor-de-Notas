import { defineStore } from 'pinia'
import apiClient from '../api/client'
import { normalizeAuthError } from '../utils/http'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('jwt') || '',
    publicDemoMode: localStorage.getItem('publicDemoMode') === 'true'
  }),
  getters: {
    isLoggedIn: state => Boolean(state.token),
    canAccessProtectedRoutes: state =>
      Boolean(state.token || state.publicDemoMode)
  },
  actions: {
    async login(email, password) {
      try {
        const { data } = await apiClient.post('/auth/signin', { email, password })
        const jwt = data.apiKey

        this.token = jwt
        this.publicDemoMode = false

        localStorage.setItem('jwt', jwt)
        localStorage.removeItem('publicDemoMode')
        apiClient.defaults.headers.common.Authorization = `Bearer ${jwt}`

        return { mode: 'authenticated' }
      } catch (error) {
        const authError = normalizeAuthError(error)
        const wrappedError = new Error(authError.message)

        wrappedError.code = authError.code
        wrappedError.canContinueInDemo = authError.canContinueInDemo
        throw wrappedError
      }
    },
    enablePublicDemoMode() {
      this.token = ''
      this.publicDemoMode = true

      localStorage.removeItem('jwt')
      localStorage.setItem('publicDemoMode', 'true')
      delete apiClient.defaults.headers.common.Authorization
    },
    logout() {
      this.token = ''
      this.publicDemoMode = false

      localStorage.removeItem('jwt')
      localStorage.removeItem('publicDemoMode')
      delete apiClient.defaults.headers.common.Authorization
    }
  }
})
