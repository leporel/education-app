<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { NCard, NButton, NSpace, NEmpty, NProgress, NTag } from 'naive-ui'
import { api, type Card } from '@/api'

type DueCard = Card & { srs: { due: number; interval: number; reps: number } }

const queue = ref<DueCard[]>([])
const idx = ref(0)
const revealed = ref(false)
const done = ref(0)
const total = ref(0)

onMounted(async () => {
  queue.value = await api.due()
  total.value = queue.value.length
})

const current = computed<DueCard | null>(() => queue.value[idx.value] ?? null)

async function grade(g: number) {
  if (!current.value) return
  await api.review(current.value.id, g)
  done.value += 1
  idx.value += 1
  revealed.value = false
}
</script>

<template>
  <h2>SRS на сегодня</h2>
  <div style="opacity: 0.7; margin-bottom: 16px">
    {{ done }} / {{ total }}
  </div>
  <NProgress
    v-if="total"
    type="line"
    :percentage="total ? Math.round((done / total) * 100) : 0"
    :height="6"
    style="margin-bottom: 20px; max-width: 520px"
  />

  <NEmpty v-if="!current && total === 0" description="На сегодня карточек нет — всё повторено." />
  <NEmpty v-else-if="!current" description="Готово. Возвращайся завтра." />

  <NCard v-else style="max-width: 520px" size="large">
    <template #header>
      <NSpace>
        <NTag size="small">{{ current.moduleId }}</NTag>
        <NTag size="small" type="info">повтор #{{ current.srs.reps + 1 }}</NTag>
      </NSpace>
    </template>
    <div class="front">{{ current.front }}</div>
    <div v-if="revealed" class="back">{{ current.back }}</div>
    <div v-if="current.hint && !revealed" class="hint">подсказка: {{ current.hint }}</div>

    <NSpace v-if="!revealed" style="margin-top: 18px">
      <NButton type="primary" @click="revealed = true">Показать ответ</NButton>
    </NSpace>
    <NSpace v-else style="margin-top: 18px" :size="8">
      <NButton size="small" type="error" @click="grade(1)">Забыл (1)</NButton>
      <NButton size="small" @click="grade(3)">С трудом (3)</NButton>
      <NButton size="small" type="warning" @click="grade(4)">Хорошо (4)</NButton>
      <NButton size="small" type="success" @click="grade(5)">Легко (5)</NButton>
    </NSpace>
  </NCard>
</template>

<style scoped>
.front {
  font-size: 48px;
  font-weight: 600;
  text-align: center;
  padding: 24px 0;
}
.back {
  font-size: 22px;
  text-align: center;
  opacity: 0.85;
  padding-bottom: 12px;
}
.hint {
  text-align: center;
  opacity: 0.6;
  font-size: 13px;
}
</style>
