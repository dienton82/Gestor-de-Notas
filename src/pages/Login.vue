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
        <LogIn :size="16" :class="styles.buttonIcon" />
        {{ loading ? 'Ingresando...' : 'Ingresar' }}
      </button>
      <p v-if="error" :class="styles.error">{{ error }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { LogIn } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import styles from './Login.module.css'

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const router = useRouter()
const auth = useAuthStore()

async function onSubmit() {
  loading.value = true
  error.value = ''

  const normalizedEmail = email.value.trim()
  const normalizedPassword = password.value.trim()

  if (!normalizedEmail || !normalizedPassword) {
    error.value = 'Ingresa tu correo y contraseña.'
    loading.value = false
    return
  }

  try {
    await auth.login(normalizedEmail, normalizedPassword)
    router.push('/')
  } catch (err) {
    error.value = err?.message || 'No fue posible iniciar sesion.'
  } finally {
    loading.value = false
  }
}
</script>
