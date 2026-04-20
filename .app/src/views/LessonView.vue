<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { NCard, NSpace, NTag, NButton, NSelect, NInput, useMessage } from 'naive-ui'
import { Pencil, Save, X } from 'lucide-vue-next'
import { api, type Doc } from '@/api'
import { useProgress } from '@/stores/progress'
import MdRender from '@/components/MdRender.vue'

const props = defineProps<{ domain: string; module: string; docId: string }>()

const progress = useProgress()
const message = useMessage()
const doc = ref<Doc | null>(null)
const moduleId = computed(() => `${props.domain}.${props.module}`)

const editing = ref(false)
const draft = ref('')
const saving = ref(false)

async function load() {
  doc.value = await api.doc(decodeURIComponent(props.docId))
  editing.value = false
  draft.value = ''
}

async function startEdit() {
  if (!doc.value) return
  draft.value = await api.raw(doc.value.path)
  editing.value = true
}

function cancelEdit() {
  editing.value = false
  draft.value = ''
}

async function save() {
  if (!doc.value) return
  saving.value = true
  try {
    await api.saveRaw(doc.value.path, draft.value)
    message.success('Сохранено')
    await load()
  } catch (e) {
    message.error(`Ошибка сохранения: ${(e as Error).message}`)
  } finally {
    saving.value = false
  }
}

onMounted(load)
watch(() => props.docId, load)

const statusOptions = [
  { label: 'todo', value: 'todo' },
  { label: 'learning', value: 'learning' },
  { label: 'known', value: 'known' },
]

const currentStatus = computed({
  get: () => (doc.value ? progress.get(doc.value.id, doc.value.frontmatter.status ?? 'todo') : 'todo'),
  set: (v: 'todo' | 'learning' | 'known') => {
    if (doc.value) progress.set(doc.value.id, v)
  },
})
</script>

<template>
  <div v-if="doc">
    <div style="font-size: 13px; opacity: 0.6; margin-bottom: 4px">
      <RouterLink :to="`/d/${props.domain}`" class="link">{{ props.domain }}</RouterLink>
      /
      <RouterLink :to="`/d/${props.domain}/m/${props.module}`" class="link">
        {{ props.module }}
      </RouterLink>
    </div>
    <h2 style="margin-bottom: 6px">{{ doc.frontmatter.title }}</h2>

    <NSpace align="center" style="margin-bottom: 16px">
      <NTag size="small">{{ doc.frontmatter.type }}</NTag>
      <NTag v-for="t in doc.frontmatter.tags" :key="t" size="small" type="info">{{ t }}</NTag>
      <span style="opacity: 0.6; font-size: 12px">обновлено {{ doc.frontmatter.updated }}</span>
      <NSelect
        v-model:value="currentStatus"
        :options="statusOptions"
        size="small"
        style="width: 130px; margin-left: auto"
      />
      <NButton v-if="!editing" size="small" @click="startEdit">
        <template #icon><Pencil :size="14" /></template>
        Править
      </NButton>
      <template v-else>
        <NButton size="small" type="primary" :loading="saving" @click="save">
          <template #icon><Save :size="14" /></template>
          Сохранить
        </NButton>
        <NButton size="small" @click="cancelEdit">
          <template #icon><X :size="14" /></template>
          Отмена
        </NButton>
      </template>
    </NSpace>

    <NCard v-if="!editing">
      <MdRender :body="doc.body" :module-id="moduleId" :doc-path="doc.path" />
    </NCard>
    <NCard v-else title="Редактирование (raw MD, включая frontmatter)">
      <NInput
        v-model:value="draft"
        type="textarea"
        :autosize="{ minRows: 20, maxRows: 60 }"
        placeholder="Markdown + frontmatter..."
        style="font-family: 'JetBrains Mono', Consolas, monospace; font-size: 13px"
      />
    </NCard>
  </div>
</template>

<style scoped>
.link {
  color: inherit;
  text-decoration: none;
}
.link:hover {
  text-decoration: underline;
}
</style>
