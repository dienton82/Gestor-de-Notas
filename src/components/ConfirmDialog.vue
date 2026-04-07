<template>
  <div
    v-if="open"
    :class="styles.overlay"
    role="dialog"
    aria-modal="true"
    :aria-labelledby="titleId"
    :aria-describedby="descriptionId"
    @click.self="cancel"
  >
    <div :class="styles.dialog">
      <div :class="styles.header">
        <div :class="styles.iconWrap">
          <ShieldAlert :size="18" :class="styles.icon" />
        </div>
        <div :class="styles.copy">
          <h3 :id="titleId" :class="styles.title">{{ title }}</h3>
          <p :id="descriptionId" :class="styles.message">{{ message }}</p>
        </div>
      </div>

      <div :class="styles.actions">
        <button type="button" :class="styles.secondaryButton" @click="cancel">Cancelar</button>
        <button type="button" :class="styles.dangerButton" @click="confirm">Eliminar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ShieldAlert } from 'lucide-vue-next'
import styles from './ConfirmDialog.module.css'

const props = defineProps({
  open: Boolean,
  title: {
    type: String,
    default: 'Confirmar acción'
  },
  message: {
    type: String,
    default: 'Esta acción no se puede deshacer.'
  }
})

const emit = defineEmits(['cancel', 'confirm'])

const titleId = computed(() => 'confirm-dialog-title')
const descriptionId = computed(() => 'confirm-dialog-description')

function cancel() {
  emit('cancel')
}

function confirm() {
  emit('confirm')
}
</script>
