<script setup lang="ts">
import { NSpace } from 'naive-ui'
import type { Frontmatter } from '@/api'

defineProps<{
  frontmatter: Frontmatter
  id: string
}>()
</script>

<template>
  <NSpace align="center" size="small" style="margin-bottom: 14px; flex-wrap: wrap">
    <span v-if="frontmatter.type" class="pill pill-type">
      {{ frontmatter.type }}
    </span>
    <span
      v-if="frontmatter.status"
      class="pill"
      :class="`pill-${frontmatter.status}`"
    >
      {{ frontmatter.status }}
    </span>
    <span v-if="frontmatter.updated" class="meta">
      Обновлено: {{ frontmatter.updated }}
    </span>
    <span class="meta meta-id">ID: {{ id }}</span>
  </NSpace>
</template>

<style scoped>
.pill {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.02em;
  line-height: 1;
  white-space: nowrap;
}
.pill-type {
  background: var(--app-info-soft);
  color: var(--app-info);
}
.pill-learning {
  background: var(--app-warning-soft);
  color: var(--app-warning);
}
.pill-known {
  background: var(--app-success-soft);
  color: var(--app-success);
}
.pill-todo {
  background: var(--app-hover);
  color: var(--app-muted);
}
.meta {
  font-size: 12px;
  color: var(--app-muted);
}
.meta-id {
  font-family: 'JetBrains Mono', Consolas, monospace;
  opacity: 0.85;
}
</style>
