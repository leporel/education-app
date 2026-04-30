<script setup lang="ts">
import { NAlert } from 'naive-ui'

defineProps<{ text: string }>()
</script>

<template>
  <NAlert v-if="text" type="info" :show-icon="true" style="margin-bottom: 16px">
    {{ text }}
  </NAlert>
</template>
