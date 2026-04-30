<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { NEmpty, NList, NListItem, NTag } from 'naive-ui'
import { useRecent } from '@/composables/useRecent'
import { useContent } from '@/stores/content'

const router = useRouter()
const content = useContent()
const { recent } = useRecent()

const recentDocs = computed(() => {
  const result: { id: string; title: string; domain: string; module: string; type: string }[] = []
  for (const id of recent.value) {
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

function open(item: (typeof recentDocs.value)[0]) {
  router.push(content.routeFor(item))
}
</script>

<template>
  <div class="recent-view">
    <h2 class="page-title">Последние</h2>

    <NEmpty v-if="!recentDocs.length" description="Нет недавно открытых материалов" style="padding: 48px 0" />

    <NList v-else hoverable clickable>
      <NListItem
        v-for="item in recentDocs"
        :key="item.id"
        @click="open(item)"
      >
        <div class="row">
          <div class="info">
            <span class="title">{{ item.title }}</span>
            <span class="path">{{ item.domain }} / {{ item.module }}</span>
          </div>
          <NTag size="small" :bordered="false">{{ item.type }}</NTag>
        </div>
      </NListItem>
    </NList>
  </div>
</template>

<style scoped>
.recent-view {
  padding-bottom: 24px;
}
.page-title {
  margin: 0 0 16px;
  font-size: 22px;
  font-weight: 700;
}
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
}
.info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.title {
  font-size: 14px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.path {
  font-size: 12px;
  opacity: 0.5;
}
</style>
