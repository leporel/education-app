<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { NDrawer, NDrawerContent, NButton, NIcon } from 'naive-ui'
import { Pin, PinOff, X } from 'lucide-vue-next'
import { useUi } from '@/stores/ui'
import { useContent } from '@/stores/content'
import NotesPanel from './NotesPanel.vue'

const props = defineProps<{ pinned: boolean }>()

const route = useRoute()
const ui = useUi()
const content = useContent()

const domain = computed(() => (route.params.domain as string | undefined) ?? '')
const headerTitle = computed(() => {
  const title =
    content.domainBySlug(domain.value)?.docs.find((d) => d.frontmatter.type === 'index')
      ?.frontmatter.title ?? domain.value
  return `Заметки — ${title || '—'}`
})

function onDrawerToggle(v: boolean) {
  if (!v) ui.closeNotes()
}
</script>

<template>
  <!-- Pinned: render as inline panel inside grid column -->
  <div v-if="props.pinned" class="pinned-panel">
    <div class="panel-hdr">
      <span class="hdr-title">{{ headerTitle }}</span>
      <div class="hdr-actions">
        <NButton
          size="tiny"
          quaternary
          circle
          title="Открепить"
          @click="ui.togglePin"
        >
          <template #icon><NIcon><PinOff :size="14" /></NIcon></template>
        </NButton>
        <NButton size="tiny" quaternary circle title="Закрыть" @click="ui.closeNotes">
          <template #icon><NIcon><X :size="14" /></NIcon></template>
        </NButton>
      </div>
    </div>
    <div class="panel-body">
      <NotesPanel />
    </div>
  </div>

  <!-- Unpinned: floating drawer -->
  <NDrawer
    v-else
    :show="ui.notesOpen"
    :width="420"
    placement="right"
    :mask-closable="false"
    :show-mask="false"
    :auto-focus="false"
    :trap-focus="false"
    @update:show="onDrawerToggle"
  >
    <NDrawerContent closable>
      <template #header>
        <div class="hdr">
          <span class="hdr-title">{{ headerTitle }}</span>
          <NButton
            size="tiny"
            quaternary
            circle
            title="Закрепить справа"
            @click="ui.togglePin"
          >
            <template #icon><NIcon><Pin :size="14" /></NIcon></template>
          </NButton>
        </div>
      </template>
      <NotesPanel />
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped>
.pinned-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--app-surface);
}

.panel-hdr {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--app-border);
  flex-shrink: 0;
}

.hdr-actions {
  display: flex;
  gap: 2px;
}

.panel-body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  padding: 12px 14px 0;
  display: flex;
  flex-direction: column;
}

.hdr {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  min-width: 0;
}

.hdr-title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  font-weight: 500;
}
</style>
