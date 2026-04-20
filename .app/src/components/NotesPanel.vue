<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  NButton,
  NList,
  NListItem,
  NInput,
  NIcon,
  NEmpty,
  NPopconfirm,
  NModal,
  NSpace,
  NTag,
  useDialog,
  useMessage,
} from 'naive-ui'
import { Plus, Save, Trash2, FilePlus, Eye, EyeOff } from 'lucide-vue-next'
import yaml from 'js-yaml'
import { api, type NoteMeta } from '@/api'
import { useContent } from '@/stores/content'
import { useUi } from '@/stores/ui'
import MdRender from './MdRender.vue'
import MiscTree from './MiscTree.vue'

const route = useRoute()
const content = useContent()
const ui = useUi()
const dialog = useDialog()
const message = useMessage()

const domain = computed(() => (route.params.domain as string | undefined) ?? '')
const notes = computed<NoteMeta[]>(() => (domain.value ? content.notesFor(domain.value) : []))
const misc = computed(() => (domain.value ? content.miscFor(domain.value) : []))

const selected = ref<NoteMeta | null>(null)
const title = ref('')
const body = ref('')
const dirty = ref(false)
const showPreview = ref(false)
const pickerOpen = ref(false)
const textareaRef = ref<InstanceType<typeof NInput> | null>(null)

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/

async function loadNote(n: NoteMeta) {
  try {
    const raw = await api.raw(n.path)
    const m = raw.match(FRONTMATTER_RE)
    body.value = m ? raw.slice(m[0].length) : raw
    title.value = String(n.frontmatter.title ?? n.id)
    selected.value = n
    ui.selectedNoteId = n.id
    dirty.value = false
  } catch (e) {
    message.error(`Не удалось загрузить заметку: ${(e as Error).message}`)
  }
}

function selectNote(n: NoteMeta) {
  if (dirty.value) {
    dialog.warning({
      title: 'Несохранённые изменения',
      content: 'Переключить заметку и потерять правки?',
      positiveText: 'Да',
      negativeText: 'Отмена',
      onPositiveClick: () => loadNote(n),
    })
    return
  }
  loadNote(n)
}

watch(
  () => ui.selectedNoteId,
  (id) => {
    if (!id) return
    const n = notes.value.find((x) => x.id === id)
    if (n && n.id !== selected.value?.id) loadNote(n)
  },
  { immediate: true },
)

watch(notes, (list) => {
  if (selected.value && !list.find((n) => n.id === selected.value!.id)) {
    selected.value = null
    body.value = ''
    title.value = ''
    dirty.value = false
  }
})

function openCreate() {
  const slug = window.prompt('slug (латиница, цифры, дефис):', '')
  if (!slug) return
  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
    message.error('slug: ^[a-z0-9][a-z0-9-]*$')
    return
  }
  const ttl = window.prompt('Заголовок:', slug)
  if (!ttl) return
  doCreate(slug, ttl)
}

async function doCreate(slug: string, ttl: string) {
  try {
    const res = await api.createNote(domain.value, slug, ttl, '')
    await content.load(true)
    const fresh = content.notesFor(domain.value).find((n) => n.id === res.id)
    if (fresh) await loadNote(fresh)
    message.success('Заметка создана')
  } catch (e) {
    message.error(`Создание не удалось: ${(e as Error).message}`)
  }
}

function buildFile(): string {
  const existingFm = (selected.value?.frontmatter ?? {}) as Record<string, unknown>
  const fm: Record<string, unknown> = {
    id: existingFm.id,
    type: 'note',
    title: title.value,
    tags: Array.isArray(existingFm.tags) ? existingFm.tags : [],
    updated: new Date().toISOString().slice(0, 10),
  }
  for (const [k, v] of Object.entries(existingFm)) {
    if (!(k in fm)) fm[k] = v
  }
  const yml = yaml.dump(fm, { lineWidth: 120 }).trimEnd()
  return `---\n${yml}\n---\n\n${body.value}`
}

async function save() {
  if (!selected.value) return
  try {
    await api.saveRaw(selected.value.path, buildFile())
    await content.load(true)
    const refreshed = content.notesFor(domain.value).find((n) => n.id === selected.value!.id)
    if (refreshed) selected.value = refreshed
    dirty.value = false
    message.success('Сохранено')
  } catch (e) {
    message.error(`Сохранение не удалось: ${(e as Error).message}`)
  }
}

async function remove() {
  if (!selected.value) return
  try {
    await api.deleteNote(selected.value.id)
    await content.load(true)
    selected.value = null
    ui.selectedNoteId = null
    body.value = ''
    title.value = ''
    dirty.value = false
    message.success('Удалено')
  } catch (e) {
    message.error(`Удаление не удалось: ${(e as Error).message}`)
  }
}

function onBodyInput(v: string) {
  body.value = v
  dirty.value = true
}
function onTitleInput(v: string) {
  title.value = v
  dirty.value = true
}

function miscRelFromNote(miscPath: string): string {
  const parts = miscPath.split('/')
  const idx = parts.indexOf('misc')
  if (idx < 0) return miscPath
  return `../${parts.slice(idx).join('/')}`
}

function isImage(path: string): boolean {
  return /\.(png|jpg|jpeg|webp|gif|svg|bmp)$/i.test(path)
}

async function onPickMisc(path: string) {
  pickerOpen.value = false
  const rel = miscRelFromNote(path)
  const name = path.split('/').pop() ?? 'file'
  const snippet = `${isImage(path) ? '!' : ''}[${name}](${rel})`
  const el = (textareaRef.value?.$el as HTMLElement | null)?.querySelector('textarea') as
    | HTMLTextAreaElement
    | null
  if (el) {
    const start = el.selectionStart ?? body.value.length
    const end = el.selectionEnd ?? start
    body.value = body.value.slice(0, start) + snippet + body.value.slice(end)
    dirty.value = true
    await nextTick()
    el.focus()
    const pos = start + snippet.length
    el.setSelectionRange(pos, pos)
  } else {
    body.value += snippet
    dirty.value = true
  }
}

const previewDocPath = computed(() => selected.value?.path ?? '')
</script>

<template>
  <div class="notes-panel">
    <div v-if="!domain" style="padding: 12px">
      <NEmpty description="Выберите домен — заметки привязаны к домену" />
    </div>
    <template v-else>
      <NSpace justify="space-between" align="center" style="margin-bottom: 8px">
        <NTag size="small">{{ notes.length }} шт.</NTag>
        <NButton size="small" @click="openCreate">
          <template #icon><NIcon><Plus :size="14" /></NIcon></template>
          новая
        </NButton>
      </NSpace>

      <NList v-if="notes.length" hoverable clickable style="margin-bottom: 12px">
        <NListItem
          v-for="n in notes"
          :key="n.id"
          :class="{ 'note-active': selected?.id === n.id }"
          @click="selectNote(n)"
        >
          <div style="min-width: 0">
            <div class="note-title">{{ n.frontmatter.title || n.id }}</div>
            <div class="note-meta">{{ n.frontmatter.updated ?? '' }}</div>
          </div>
        </NListItem>
      </NList>
      <NEmpty v-else description="Заметок пока нет" style="margin-bottom: 12px" />

      <div v-if="selected" class="editor">
        <NInput :value="title" placeholder="Заголовок" size="small" @update:value="onTitleInput" />

        <NSpace size="small" style="flex-wrap: wrap" align="center">
          <NButton size="small" type="primary" :disabled="!dirty || showPreview" @click="save">
            <template #icon><NIcon><Save :size="14" /></NIcon></template>
            сохранить
          </NButton>
          <NButton
            size="small"
            :type="showPreview ? 'primary' : 'default'"
            :secondary="showPreview"
            @click="showPreview = !showPreview"
          >
            <template #icon>
              <NIcon>
                <EyeOff v-if="showPreview" :size="14" />
                <Eye v-else :size="14" />
              </NIcon>
            </template>
            {{ showPreview ? 'редактор' : 'превью' }}
          </NButton>
          <NButton
            size="small"
            :disabled="!misc.length || showPreview"
            @click="pickerOpen = true"
          >
            <template #icon><NIcon><FilePlus :size="14" /></NIcon></template>
            вставить файл
          </NButton>
          <NPopconfirm @positive-click="remove">
            <template #trigger>
              <NButton size="small" quaternary type="error">
                <template #icon><NIcon><Trash2 :size="14" /></NIcon></template>
                удалить
              </NButton>
            </template>
            Удалить заметку?
          </NPopconfirm>
        </NSpace>

        <div v-if="showPreview" class="preview">
          <MdRender :body="body" :doc-path="previewDocPath" />
        </div>
        <NInput
          v-else
          ref="textareaRef"
          :value="body"
          type="textarea"
          placeholder="Текст заметки (markdown)…"
          :autosize="{ minRows: 12, maxRows: 26 }"
          @update:value="onBodyInput"
        />
      </div>
    </template>

    <NModal v-model:show="pickerOpen" preset="card" title="Вставить ссылку на файл" style="max-width: 560px">
      <MiscTree :misc="misc" :domain="domain" mode="picker" @pick="onPickMisc" />
    </NModal>
  </div>
</template>

<style scoped>
.notes-panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.editor {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.note-title {
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.note-meta {
  font-size: 11px;
  opacity: 0.55;
}
.note-active {
  background: var(--n-color-hover, rgba(127, 127, 127, 0.12));
}
.preview {
  border: 1px solid rgba(127, 127, 127, 0.2);
  border-radius: 4px;
  padding: 10px 12px;
  max-height: calc(100vh - 320px);
  overflow: auto;
}
</style>
