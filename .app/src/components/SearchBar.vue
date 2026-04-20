<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { NAutoComplete, NInput, NIcon } from 'naive-ui'
import { Search } from 'lucide-vue-next'
import { useDebounceFn } from '@vueuse/core'
import { api, type SearchHit } from '@/api'

const router = useRouter()
const query = ref('')
const options = ref<Array<{ label: string; value: string; hit: SearchHit }>>([])

const run = useDebounceFn(async (q: string) => {
  if (!q.trim()) {
    options.value = []
    return
  }
  const hits = await api.search(q)
  options.value = hits.map((h) => ({
    label: `${h.title} — ${h.snippet}`,
    value: h.id,
    hit: h,
  }))
}, 200)

watch(query, (v) => run(v))

function onSelect(value: string | number) {
  const hit = options.value.find((o) => o.value === String(value))?.hit
  if (!hit) return
  const parts = hit.path.split('/')
  const domain = parts[0]
  if (parts[1] === 'modules' && parts[2]) {
    router.push(`/d/${domain}/m/${parts[2]}/doc/${encodeURIComponent(hit.id)}`)
  } else {
    router.push(`/d/${domain}`)
  }
  query.value = ''
}
</script>

<template>
  <NAutoComplete
    v-model:value="query"
    :options="options"
    :input-props="{ autocomplete: 'off' }"
    style="width: 420px"
    @select="onSelect"
  >
    <template #default="{ handleInput, handleBlur, handleFocus, value }">
      <NInput
        :value="value as string"
        placeholder="Поиск по всей базе"
        clearable
        @update:value="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
      >
        <template #prefix>
          <NIcon :size="16" :depth="3"><Search /></NIcon>
        </template>
      </NInput>
    </template>
  </NAutoComplete>
</template>
