<template>
  <div :class="styles.card">
    <div v-if="showInlineHint" :class="styles.inlineHint">
      <PencilLine :size="14" :class="styles.inlineHintIcon" />
      <span>Haz doble clic para editar</span>
    </div>
    <h3 :class="styles.title">{{ title }}</h3>
    <p :class="styles.content">{{ excerpt }}</p>

    <!-- Vista previa de adjuntos -->
    <ul v-if="attachments.length" :class="styles.attachList">
      <li v-for="a in attachments" :key="a.url">
        <a
          :href="attachmentLink(a).href"
          :target="attachmentLink(a).target"
          :rel="attachmentLink(a).rel"
          :download="attachmentLink(a).download"
          :class="styles.attachLink"
        ><Paperclip :size="14" /> {{ a.name }}</a>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Paperclip, PencilLine } from 'lucide-vue-next'
import { getAttachmentLinkAttributes } from '../utils/attachments'
import styles from './NoteCard.module.css'

const props = defineProps({
  title: String,
  content: String,
  attachments: {
    type: Array,
    default: () => []
  },
  showInlineHint: {
    type: Boolean,
    default: false
  }
})

const excerpt = computed(() => {
  if (!props.content) return ''
  return props.content.length > 80
    ? props.content.slice(0, 80) + '…'
    : props.content
})

function attachmentLink(attachment) {
  return getAttachmentLinkAttributes(attachment)
}
</script>
