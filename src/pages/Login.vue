<template>
  <div :class="styles.container">
    <h2 :class="styles.heading">Iniciar sesión</h2>
    <form @submit.prevent="onSubmit" :class="styles.form">
      <div :class="styles.field">
        <label for="email" :class="styles.label">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          :class="styles.input"
          placeholder="test.user4@prolibu.com"
          required
        />
      </div>
      <div :class="styles.field">
        <label for="password" :class="styles.label">Contraseña</label>
        <input
          id="password"
          v-model="password"
          type="password"
          :class="styles.input"
          placeholder="••••••••"
          required
        />
      </div>
      <button
        type="submit"
        :disabled="loading"
        :class="[styles.button, loading && styles.buttonDisabled]"
      >
        {{ loading ? 'Ingresando...' : 'Ingresar' }}
      </button>
      <p v-if="error" :class="styles.error">{{ error }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import styles from './Login.module.css'

const email = ref('test.user4@prolibu.com')
const password = ref('Prolibu2025!')
const loading = ref(false)
const error = ref('')

const router = useRouter()
const auth = useAuthStore()

async function onSubmit() {
  loading.value = true
  error.value = ''
  try {
    await auth.login(email.value, password.value)
    router.push('/')
  } catch {
    error.value = 'Email o contraseña inválidos'
  } finally {
    loading.value = false
  }
}
</script>
