<script setup lang="ts">
import { computed, ref, h } from 'vue'
import { NTree, NModal, NIcon, NEmpty } from 'naive-ui'
import type { TreeOption } from 'naive-ui'
import { File, Folder, FileText, FileImage, FileCode } from 'lucide-vue-next'
import { api, type MiscEntry } from '@/api'

const props = defineProps<{
  misc: MiscEntry[]
  domain: string
  mode?: 'view' | 'picker'
}>()
const emit = defineEmits<{ pick: [path: string] }>()

function iconFor(entry: MiscEntry) {
  if (entry.type === 'dir') return Folder
  const mime = entry.mime ?? ''
  if (mime.startsWith('image/')) return FileImage
  if (mime.startsWith('text/') || mime === 'application/json') return FileText
  if (mime === 'application/pdf') return FileCode
  return File
}

function toOptions(entries: MiscEntry[]): TreeOption[] {
  return entries.map((e) => ({
    key: e.path,
    label: e.name,
    isLeaf: e.type === 'file',
    children: e.children ? toOptions(e.children) : undefined,
    prefix: () => h(NIcon, { size: 14 }, () => h(iconFor(e))),
    entry: e,
  })) as unknown as TreeOption[]
}

const treeData = computed(() => toOptions(props.misc))

const previewOpen = ref(false)
const previewSrc = ref('')
const previewName = ref('')

function onSelect(_keys: string[], opts: TreeOption[]) {
  const opt = opts[0] as (TreeOption & { entry?: MiscEntry }) | undefined
  const entry = opt?.entry
  if (!entry || entry.type !== 'file') return
  if (props.mode === 'picker') {
    emit('pick', entry.path)
    return
  }
  const mime = entry.mime ?? ''
  const url = api.rawUrl(entry.path)
  if (mime.startsWith('image/')) {
    previewSrc.value = url
    previewName.value = entry.name
    previewOpen.value = true
  } else {
    window.open(url, '_blank', 'noopener')
  }
}
</script>

<template>
  <div class="misc-tree">
    <NEmpty v-if="!misc.length" description="Папка misc/ пуста" />
    <NTree
      v-else
      :data="treeData"
      block-line
      expand-on-click
      :selectable="true"
      @update:selected-keys="onSelect as any"
    />

    <NModal v-model:show="previewOpen" preset="card" :title="previewName" style="max-width: 90vw">
      <div style="display: flex; justify-content: center">
        <img :src="previewSrc" :alt="previewName" style="max-width: 100%; max-height: 70vh" />
      </div>
    </NModal>
  </div>
</template>

<style scoped>
.misc-tree {
  min-height: 80px;
}
</style>
