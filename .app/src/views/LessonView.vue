<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { NCard, NInput, NButton, NIcon, useMessage } from 'naive-ui'
import { Save, X } from 'lucide-vue-next'
import { api, type Doc } from '@/api'
import MdRender from '@/components/MdRender.vue'
import FrontmatterBadges from '@/components/content/FrontmatterBadges.vue'
import SummaryBox from '@/components/content/SummaryBox.vue'
import ContentToolbar from '@/components/content/ContentToolbar.vue'

const props = defineProps<{ domain: string; module: string; docId: string }>()

const message = useMessage()
const doc = ref<Doc | null>(null)
const moduleId = computed(() => `${props.domain}.${props.module}`)

const editing = ref(false)
const draft = ref('')
const saving = ref(false)

const summary = computed(() => (doc.value?.frontmatter.summary as string | undefined) ?? '')

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
</script>

<template>
  <div v-if="doc" class="lesson-view">
    <div class="lesson-body">
      <div class="doc-path">
        <RouterLink :to="`/d/${props.domain}`" class="path-link">{{ props.domain }}</RouterLink>
        <span class="path-sep"> › </span>
        <RouterLink :to="`/d/${props.domain}/m/${props.module}`" class="path-link">{{ props.module }}</RouterLink>
        <span class="path-sep"> › </span>
        <span>{{ doc.path.split('/').pop() }}</span>
      </div>
      <h2 class="doc-title">{{ doc.frontmatter.title }}</h2>

      <FrontmatterBadges :frontmatter="doc.frontmatter" :id="doc.id" />
      <SummaryBox :text="summary" />

      <NCard v-if="!editing">
        <MdRender :body="doc.body" :module-id="moduleId" :doc-path="doc.path" />
      </NCard>

      <NCard v-else title="Редактирование (raw MD)">
        <div class="edit-actions">
          <NButton size="small" type="primary" :loading="saving" @click="save">
            <template #icon><NIcon><Save :size="14" /></NIcon></template>
            Сохранить
          </NButton>
          <NButton size="small" @click="cancelEdit">
            <template #icon><NIcon><X :size="14" /></NIcon></template>
            Отмена
          </NButton>
        </div>
        <NInput
          v-model:value="draft"
          type="textarea"
          :autosize="{ minRows: 20, maxRows: 60 }"
          placeholder="Markdown + frontmatter..."
          style="font-family: 'JetBrains Mono', Consolas, monospace; font-size: 13px"
        />
      </NCard>
    </div>

    <ContentToolbar
      :doc-id="doc.id"
      :domain="props.domain"
      :module="props.module"
      @edit="startEdit"
    />
  </div>
</template>

<style scoped>
.lesson-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.lesson-body {
  flex: 1;
  overflow: auto;
  padding: 24px 28px;
  min-height: 0;
}

.doc-title {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.25;
}

.edit-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.doc-path {
  font-size: 12px;
  opacity: 0.5;
  margin-bottom: 6px;
}

.path-link {
  color: inherit;
  text-decoration: none;
}

.path-link:hover {
  text-decoration: underline;
}

.path-sep {
  opacity: 0.6;
}
</style>
