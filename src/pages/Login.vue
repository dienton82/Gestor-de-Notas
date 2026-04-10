<template>
  <div :class="styles.container">
    <div :class="styles.hero">
      <p :class="styles.eyebrow">Acceso seguro</p>
      <h2 :class="styles.heading">Iniciar sesión</h2>
      <p :class="styles.subheading">
        Entra a la experiencia completa de notas con el mismo flujo visual de la app.
      </p>
    </div>

    <div :class="styles.notice">
      <div :class="styles.noticeIconWrap">
        <Info :size="16" :class="styles.noticeIcon" />
      </div>
      <div :class="styles.noticeBody">
        <p :class="styles.noticeTitle">Acceso rapido</p>
        <p :class="styles.noticeText">
          Las credenciales estan precargadas para facilitar el ingreso.
          Puedes usar cualquier correo y contrasena validos.
        </p>
      </div>
    </div>

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
import { Info, LogIn } from 'lucide-vue-next'
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
