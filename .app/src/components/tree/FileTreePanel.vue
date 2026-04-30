<script setup lang="ts">
import { computed, h, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  NButton,
  NEmpty,
  NIcon,
  NInput,
  NModal,
  NTree,
} from 'naive-ui'
import type { TreeOption } from 'naive-ui'
import { Check, Folder } from 'lucide-vue-next'
import { useContent } from '@/stores/content'
import { useProgress } from '@/stores/progress'
import { useUi } from '@/stores/ui'
import { api } from '@/api'
import { buildTreeData, type DocTreeOption } from './buildTreeData'

const route = useRoute()
const router = useRouter()
const content = useContent()
const progress = useProgress()
const ui = useUi()

const searchQuery = ref('')

const previewOpen = ref(false)
const previewSrc = ref('')
const previewName = ref('')

const domainSlug = computed(() => route.params.domain as string | undefined)

const domain = computed(() =>
  domainSlug.value ? content.domainBySlug(domainSlug.value) : undefined,
)

const treeData = computed(() => {
  if (!domain.value) return []
  return buildTreeData(domain.value, progress.statuses)
})

const activeKey = computed(() => {
  const docId = route.params.docId as string | undefined
  return docId ? [decodeURIComponent(docId)] : []
})

// Keys that should be expanded based on the current route
function routeExpandedKeys(): string[] {
  const slug = domainSlug.value
  if (!slug) return []
  const mod = route.params.module as string | undefined
  const docId = route.params.docId as string | undefined
  const keys: string[] = []
  if (mod) keys.push(`${slug}/${mod}`)
  if (docId) {
    const decoded = decodeURIComponent(docId)
    for (const m of domain.value?.modules ?? []) {
      if (m.docs.some((d) => d.id === decoded)) {
        const k = `${slug}/${m.slug}`
        if (!keys.includes(k)) keys.push(k)
        break
      }
    }
  }
  return keys
}

// Controlled expanded keys (used when not searching)
const expandedKeys = ref<string[]>(routeExpandedKeys())
// Snapshot saved when search begins, restored when search clears
const expandedBackup = ref<string[] | null>(null)

// Update expanded keys when domain/route changes (but not while searching)
watch(
  [domainSlug, () => route.params.module, () => route.params.docId],
  () => {
    if (!searchQuery.value) {
      expandedKeys.value = routeExpandedKeys()
    }
  },
)

watch(searchQuery, (next, prev) => {
  if (next && !prev) {
    // Search started — save current expanded state
    expandedBackup.value = [...expandedKeys.value]
  } else if (!next && prev) {
    // Search cleared — restore saved state
    if (expandedBackup.value !== null) {
      expandedKeys.value = expandedBackup.value
      expandedBackup.value = null
    }
  }
})

function onExpandedUpdate(keys: Array<string | number>) {
  expandedKeys.value = keys as string[]
}

// Filter: match only on label, case-insensitive
function treeFilter(pattern: string, option: TreeOption): boolean {
  return String(option.label ?? '').toLowerCase().includes(pattern.toLowerCase())
}

function onSelect(_keys: string[], _opts: TreeOption[], { node }: { node: TreeOption }) {
  const opt = node as DocTreeOption

  if (opt.noteMeta) {
    ui.openNote(opt.noteMeta.id)
    return
  }

  if (opt.miscEntry) {
    const entry = opt.miscEntry
    if (entry.type !== 'file') return
    const url = api.rawUrl(entry.path)
    const mime = entry.mime ?? ''
    if (mime.startsWith('image/')) {
      previewSrc.value = url
      previewName.value = entry.name
      previewOpen.value = true
    } else {
      window.open(url, '_blank', 'noopener')
    }
    return
  }

  if (!opt.docMeta || !opt.domainSlug) return
  router.push(content.routeFor({
    id: opt.docMeta.id,
    domain: opt.domainSlug,
    module: opt.moduleSlug,
    type: opt.docMeta.frontmatter.type,
  }))
}

function renderSuffix({ option }: { option: TreeOption }) {
  const opt = option as DocTreeOption
  if (!opt.docMeta) return null
  if (progress.statuses[opt.docMeta.id] === 'known') {
    return h(NIcon, { size: 12, style: 'color: var(--app-success)' }, () => h(Check))
  }
  return null
}

function openDomain() {
  if (domainSlug.value) router.push(`/d/${domainSlug.value}`)
}

function openInExplorer() {
  if (domainSlug.value) api.openInExplorer(domainSlug.value).catch(() => {})
}
</script>

<template>
  <div class="file-tree-panel">
    <template v-if="domain">
      <div class="panel-header">
        <div class="domain-name">
          <span class="domain-icon">{{ domain.docs[0]?.frontmatter.tags?.[0] ?? '📚' }}</span>
          <span class="domain-title">{{ domain.docs.find(d => d.frontmatter.type === 'index')?.frontmatter.title ?? domain.slug }}</span>
        </div>
        <NButton size="tiny" secondary @click="openDomain">
          Открыть обзор
        </NButton>
      </div>

      <div class="panel-search">
        <NInput
          v-model:value="searchQuery"
          size="small"
          placeholder="Поиск в домене..."
          clearable
        />
      </div>

      <div class="tree-scroll">
        <!-- Search mode: NTree manages expansion internally -->
        <NTree
          v-if="searchQuery"
          :data="treeData"
          :pattern="searchQuery"
          :filter="treeFilter"
          :selected-keys="activeKey"
          :render-suffix="renderSuffix"
          block-line
          expand-on-click
          :selectable="true"
          style="font-size: 13px; padding: 4px 4px 8px"
          @update:selected-keys="onSelect as any"
        />
        <!-- Normal mode: we control expanded keys -->
        <NTree
          v-else
          :data="treeData"
          :expanded-keys="expandedKeys"
          :selected-keys="activeKey"
          :render-suffix="renderSuffix"
          block-line
          expand-on-click
          :selectable="true"
          style="font-size: 13px; padding: 4px 4px 8px"
          @update:selected-keys="onSelect as any"
          @update:expanded-keys="onExpandedUpdate"
        />
      </div>
    </template>

    <NEmpty v-else description="Выберите домен" style="padding: 40px 0" />

    <NModal v-model:show="previewOpen" preset="card" :title="previewName" style="max-width: 90vw">
      <div style="display: flex; justify-content: center">
        <img :src="previewSrc" :alt="previewName" style="max-width: 100%; max-height: 70vh" />
      </div>
    </NModal>

    <div v-if="domain" class="panel-footer">
      <NButton secondary size="small" class="footer-btn" @click="openInExplorer">
        <template #icon><NIcon><Folder :size="14" /></NIcon></template>
        Открыть в проводнике
      </NButton>
    </div>
  </div>
</template>

<style scoped>
.file-tree-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}
.panel-header {
  padding: 12px 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-bottom: 1px solid var(--app-border);
  flex-shrink: 0;
}
.domain-name {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
}
.domain-icon {
  font-size: 18px;
  line-height: 1;
}
.domain-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.panel-search {
  padding: 8px 12px;
  flex-shrink: 0;
}
.tree-scroll {
  flex: 1;
  overflow: auto;
  min-height: 0;
}
.panel-footer {
  flex-shrink: 0;
  padding: 8px 12px;
  border-top: 1px solid var(--app-border);
  height: 49px;
  display: flex;
  align-items: center;
}
.footer-btn {
  width: 100%;
  justify-content: flex-start;
  font-size: 12px;
}
</style>
