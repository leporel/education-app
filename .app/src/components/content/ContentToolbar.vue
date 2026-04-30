<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NIcon, NTooltip, useMessage } from 'naive-ui'
import { Bookmark, BookmarkCheck, Pencil, Link, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { useStorage } from '@vueuse/core'
import { useContent } from '@/stores/content'

const props = defineProps<{
  docId: string
  domain: string
  module: string
}>()

const emit = defineEmits<{ edit: [] }>()

const router = useRouter()
const message = useMessage()
const content = useContent()

const bookmarks = useStorage<string[]>('edu.bookmarks', [])
const isBookmarked = computed(() => bookmarks.value.includes(props.docId))

function toggleBookmark() {
  if (isBookmarked.value) {
    bookmarks.value = bookmarks.value.filter((id) => id !== props.docId)
  } else {
    bookmarks.value = [...bookmarks.value, props.docId]
  }
}

function copyLink() {
  navigator.clipboard.writeText(window.location.href).then(() => {
    message.success('Ссылка скопирована')
  })
}

const siblings = computed(() => content.siblingDocs(props.domain, props.module))

const currentIndex = computed(() => siblings.value.findIndex((d) => d.id === props.docId))

const prevDoc = computed(() => {
  const i = currentIndex.value
  return i > 0 ? siblings.value[i - 1] : null
})

const nextDoc = computed(() => {
  const i = currentIndex.value
  return i >= 0 && i < siblings.value.length - 1 ? siblings.value[i + 1] : null
})

function navigate(doc: { id: string; frontmatter: { type: string } } | null | undefined) {
  if (!doc) return
  router.push(
    content.routeFor({
      id: doc.id,
      domain: props.domain,
      module: props.module,
      type: doc.frontmatter.type,
    }),
  )
}
</script>

<template>
  <div class="toolbar">
    <NButton
      text
      size="small"
      :disabled="!prevDoc"
      @click="navigate(prevDoc)"
    >
      <template #icon><NIcon><ChevronLeft :size="16" /></NIcon></template>
      Назад
    </NButton>

    <div class="toolbar-actions">
      <NTooltip :delay="400">
        <template #trigger>
          <NButton
            quaternary
            circle
            size="small"
            :type="isBookmarked ? 'primary' : 'default'"
            @click="toggleBookmark"
          >
            <template #icon>
              <NIcon>
                <BookmarkCheck v-if="isBookmarked" :size="16" />
                <Bookmark v-else :size="16" />
              </NIcon>
            </template>
          </NButton>
        </template>
        {{ isBookmarked ? 'Убрать из закладок' : 'В закладки' }}
      </NTooltip>

      <NTooltip :delay="400">
        <template #trigger>
          <NButton quaternary circle size="small" @click="emit('edit')">
            <template #icon><NIcon><Pencil :size="16" /></NIcon></template>
          </NButton>
        </template>
        Редактировать
      </NTooltip>

      <NTooltip :delay="400">
        <template #trigger>
          <NButton quaternary circle size="small" @click="copyLink">
            <template #icon><NIcon><Link :size="16" /></NIcon></template>
          </NButton>
        </template>
        Скопировать ссылку
      </NTooltip>
    </div>

    <NButton
      text
      size="small"
      type="primary"
      icon-placement="right"
      :disabled="!nextDoc"
      @click="navigate(nextDoc)"
    >
      Далее
      <template #icon><NIcon><ChevronRight :size="16" /></NIcon></template>
    </NButton>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  height: 49px;
  border-top: 1px solid var(--app-border);
  flex-shrink: 0;
  background: var(--app-bg);
}
.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}
.toolbar :deep(.n-button.n-button--quaternary-type:hover) {
  background-color: var(--app-hover);
}
</style>
