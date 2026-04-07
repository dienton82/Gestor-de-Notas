<template>
  <div :class="styles.container">
    <h2 :class="styles.heading">Iniciar sesión</h2>
    <p v-if="showPublicDemoHint" :class="styles.notice">
      Si el backend externo bloquea el acceso desde esta demo pública, podrás continuar en modo demo sin romper la interfaz.
    </p>
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
      <button
        v-if="canContinueInDemo"
        type="button"
        :class="[styles.button, styles.secondaryButton]"
        @click="continueInDemo"
      >
        Continuar en modo demo
      </button>
    </form>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { allowPublicDemoMode } from '../config/app'
import styles from './Login.module.css'

const email = ref('test.user4@prolibu.com')
const password = ref('Prolibu2025!')
const loading = ref(false)
const error = ref('')
const canContinueInDemo = ref(false)

const router = useRouter()
const auth = useAuthStore()
const showPublicDemoHint = computed(() => allowPublicDemoMode)

async function onSubmit() {
  loading.value = true
  error.value = ''
  canContinueInDemo.value = false

  try {
    await auth.login(email.value, password.value)
    router.push('/')
  } catch (err) {
    error.value = err?.message || 'No fue posible iniciar sesion.'
    canContinueInDemo.value = Boolean(err?.canContinueInDemo)
  } finally {
    loading.value = false
  }
}

function continueInDemo() {
  auth.enablePublicDemoMode()
  router.push('/')
}
</script>
