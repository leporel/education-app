<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { NDrawer, NDrawerContent, NButton, NIcon } from 'naive-ui'
import { Pin, PinOff } from 'lucide-vue-next'
import { useUi } from '@/stores/ui'
import NotesPanel from './NotesPanel.vue'

const route = useRoute()
const ui = useUi()

const domain = computed(() => (route.params.domain as string | undefined) ?? '')
const headerTitle = computed(() => `Заметки — ${domain.value || '—'}`)

function onDrawerToggle(v: boolean) {
  if (!v) ui.closeNotes()
}
</script>

<template>
  <NDrawer
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
            :title="ui.notesPinned ? 'Открепить' : 'Закрепить справа'"
            @click="ui.togglePin"
          >
            <template #icon>
              <NIcon>
                <PinOff v-if="ui.notesPinned" :size="14" />
                <Pin v-else :size="14" />
              </NIcon>
            </template>
          </NButton>
        </div>
      </template>
      <NotesPanel />
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped>
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
}
</style>
