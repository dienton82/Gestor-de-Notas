<template>
  <div :class="styles.card">
    <h3 :class="styles.title">{{ title }}</h3>
    <p :class="styles.content">{{ excerpt }}</p>

    <!-- Vista previa de adjuntos -->
    <ul v-if="attachments.length" :class="styles.attachList">
      <li v-for="a in attachments" :key="a.url">
        <a
          :href="safeAttachmentUrl(a.url)"
          target="_blank"
          rel="noopener noreferrer"
          :class="styles.attachLink"
        ><Paperclip :size="14" /> {{ a.name }}</a>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Paperclip } from 'lucide-vue-next'
import { sanitizeExternalUrl } from '../utils/security'
import styles from './NoteCard.module.css'

const props = defineProps({
  title: String,
  content: String,
  attachments: {
    type: Array,
    default: () => []
  }
})

const excerpt = computed(() => {
  if (!props.content) return ''
  return props.content.length > 80
    ? props.content.slice(0, 80) + '…'
    : props.content
})

function safeAttachmentUrl(url) {
  return sanitizeExternalUrl(url)
}
</script>
