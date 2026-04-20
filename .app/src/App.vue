<script setup lang="ts">
import {
  NConfigProvider,
  NLayout,
  NLayoutHeader,
  NLayoutSider,
  NMenu,
  NIcon,
  NButton,
  NMessageProvider,
  NDialogProvider,
} from 'naive-ui'
import { RouterView, useRouter } from 'vue-router'
import { computed, h, onMounted, ref, watch } from 'vue'
import { Home, BookOpen, Brain, Sun, Moon, StickyNote } from 'lucide-vue-next'
import { useRoute } from 'vue-router'
import { type DomainTree } from '@/api'
import { useProgress } from '@/stores/progress'
import { useTheme } from '@/stores/theme'
import { useContent } from '@/stores/content'
import { useUi } from '@/stores/ui'
import SearchBar from '@/components/SearchBar.vue'
import NotesSidebar from '@/components/NotesSidebar.vue'

const router = useRouter()
const route = useRoute()
const progress = useProgress()
const theme = useTheme()
const content = useContent()
const ui = useUi()
const tree = ref<DomainTree[]>([])

const currentDomain = computed(() => (route.params.domain as string | undefined) ?? '')

watch(
  () => route.query.note,
  (v) => {
    const id = Array.isArray(v) ? v[0] : v
    if (id) ui.openNote(String(id))
  },
  { immediate: true },
)

onMounted(async () => {
  await content.load()
  tree.value = content.tree
  await progress.load()
})

const menuOptions = computed(() => {
  const base = [
    {
      label: 'Главная',
      key: 'home',
      icon: () => h(NIcon, null, () => h(Home, { size: 16 })),
    },
    {
      label: 'SRS на сегодня',
      key: 'srs',
      icon: () => h(NIcon, null, () => h(Brain, { size: 16 })),
    },
  ]
  const mapDomain = (d: DomainTree, suffix = '') => ({
    label: `${d.slug}${suffix}`,
    key: `domain:${d.slug}`,
    icon: () => h(NIcon, null, () => h(BookOpen, { size: 16 })),
    children: d.modules.map((m) => ({
      label: m.slug,
      key: `module:${d.slug}/${m.slug}`,
    })),
  })
  const domains = tree.value.filter((d) => !d.hidden).map((d) => mapDomain(d))
  const examples = tree.value.filter((d) => d.hidden).map((d) => mapDomain(d, ' (пример)'))
  return [...base, { type: 'divider', key: 'd1' }, ...domains, ...examples]
})

function onMenu(key: string) {
  if (key === 'home') router.push('/')
  else if (key === 'srs') router.push('/srs')
  else if (key.startsWith('domain:')) router.push(`/d/${key.slice('domain:'.length)}`)
  else if (key.startsWith('module:')) {
    const [domain, module] = key.slice('module:'.length).split('/')
    router.push(`/d/${domain}/m/${module}`)
  }
}
</script>

<template>
  <NConfigProvider :theme="theme.naive" :theme-overrides="theme.overrides">
    <NMessageProvider>
      <NDialogProvider>
        <NLayout has-sider style="height: 100vh" :class="`theme-${theme.mode}`">
          <NLayoutSider bordered :width="260" content-style="padding: 12px">
            <h3 style="margin: 0 0 12px 0; font-size: 14px; opacity: 0.7">Education</h3>
            <NMenu
              :options="(menuOptions as any)"
              :on-update:value="onMenu"
              :indent="14"
              :collapsed-width="0"
            />
          </NLayoutSider>
          <NLayout>
            <NLayoutHeader
              bordered
              class="header"
              :class="{ 'notes-pinned': ui.notesPinned && ui.notesOpen && currentDomain }"
            >
              <div class="path">{{ $route.fullPath }}</div>
              <SearchBar />
              <NButton
                v-if="currentDomain"
                size="small"
                quaternary
                circle
                :title="ui.notesOpen ? 'Скрыть заметки' : 'Показать заметки'"
                @click="ui.toggleNotes"
              >
                <template #icon>
                  <NIcon><StickyNote :size="16" /></NIcon>
                </template>
              </NButton>
              <NButton
                size="small"
                quaternary
                circle
                :title="theme.mode === 'dark' ? 'Светлая тема' : 'Тёмная тема'"
                @click="theme.toggle"
              >
                <template #icon>
                  <NIcon>
                    <Sun v-if="theme.mode === 'dark'" :size="16" />
                    <Moon v-else :size="16" />
                  </NIcon>
                </template>
              </NButton>
            </NLayoutHeader>
            <main
              class="content"
              :class="{ 'notes-pinned': ui.notesPinned && ui.notesOpen && currentDomain }"
            >
              <RouterView />
            </main>
          </NLayout>
        </NLayout>
        <NotesSidebar v-if="currentDomain" />
      </NDialogProvider>
    </NMessageProvider>
  </NConfigProvider>
</template>

<style>
/* global CSS vars driven by theme mode (class on NLayout root) */
.theme-light {
  --md-link: #2a8892;
  --md-link-hover: #3aa0ab;
}
.theme-dark {
  --md-link: #6ecbd4;
  --md-link-hover: #87d8e0;
}
</style>

<style scoped>
.header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 20px;
  font-size: 13px;
  transition: padding-right 0.18s ease;
}
.header.notes-pinned {
  padding-right: 440px;
}
.path {
  flex: 0 0 auto;
  opacity: 0.55;
  min-width: 0;
  max-width: 30vw;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.content {
  padding: 20px;
  overflow: auto;
  transition: padding-right 0.18s ease;
}
.content.notes-pinned {
  padding-right: 440px;
}
</style>
