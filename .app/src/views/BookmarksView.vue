<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { NEmpty, NList, NListItem, NTag, NButton } from 'naive-ui'
import { useStorage } from '@vueuse/core'
import { useContent } from '@/stores/content'

const router = useRouter()
const content = useContent()
const bookmarks = useStorage<string[]>('edu.bookmarks', [])

const bookmarkedDocs = computed(() => {
  const result: { id: string; title: string; domain: string; module: string; type: string }[] = []
  for (const id of bookmarks.value) {
    for (const domain of content.tree) {
      for (const mod of domain.modules) {
        const doc = mod.docs.find((d) => d.id === id)
        if (doc) {
          result.push({
            id: doc.id,
            title: doc.frontmatter.title || doc.id,
            domain: domain.slug,
            module: mod.slug,
            type: doc.frontmatter.type,
          })
        }
      }
    }
  }
  return result
})

function open(item: (typeof bookmarkedDocs.value)[0]) {
  router.push(content.routeFor(item))
}

function remove(id: string) {
  bookmarks.value = bookmarks.value.filter((b) => b !== id)
}
</script>

<template>
  <div class="bookmarks-view">
    <h2 class="page-title">Закладки</h2>

    <NEmpty v-if="!bookmarkedDocs.length" description="Нет сохранённых закладок" style="padding: 48px 0" />

    <NList v-else hoverable clickable>
      <NListItem
        v-for="item in bookmarkedDocs"
        :key="item.id"
        @click="open(item)"
      >
        <div class="bm-row">
          <div class="bm-info">
            <span class="bm-title">{{ item.title }}</span>
            <span class="bm-path">{{ item.domain }} / {{ item.module }}</span>
          </div>
          <div class="bm-actions">
            <NTag size="small" :bordered="false">{{ item.type }}</NTag>
            <NButton
              size="tiny"
              quaternary
              type="error"
              @click.stop="remove(item.id)"
            >
              ✕
            </NButton>
          </div>
        </div>
      </NListItem>
    </NList>
  </div>
</template>

<style scoped>
.bookmarks-view {
  padding-bottom: 24px;
}
.page-title {
  margin: 0 0 16px;
  font-size: 22px;
  font-weight: 700;
}
.bm-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
}
.bm-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.bm-title {
  font-size: 14px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.bm-path {
  font-size: 12px;
  opacity: 0.5;
}
.bm-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}
</style>
