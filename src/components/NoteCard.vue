<template>
    <div :class="styles.card" @click="$emit('click')">
        
      <h3 :class="styles.title">{{ title }}</h3>
      <p :class="styles.content">{{ excerpt }}</p>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  import styles from './NoteCard.module.css'
  
  const props = defineProps({
    title: {
      type: String,
      required: true
    },
    content: {
      type: String,
      default: ''
    }
  })
  
  const excerpt = computed(() => {
    if (!props.content) return ''
    return props.content.length > 80
      ? props.content.slice(0, 80) + '…'
      : props.content
  })
  </script>
  