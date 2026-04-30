<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NBadge, NIcon } from 'naive-ui'
import { BookOpen, Brain, Bookmark, Clock, Map, Menu } from 'lucide-vue-next'
import { useContent } from '@/stores/content'
import { useSrs } from '@/stores/srs'
import { useUi } from '@/stores/ui'

const route = useRoute()
const router = useRouter()
const content = useContent()
const srs = useSrs()
const ui = useUi()

const domains = computed(() => content.tree)

function domainProgress(domain: (typeof domains.value)[0]): number {
  if (!domain.summary.total) return 0
  return Math.round((domain.summary.known / domain.summary.total) * 100)
}

function domainTitle(domain: (typeof domains.value)[0]): string {
  return (
    domain.docs.find((d) => d.frontmatter.type === 'index')?.frontmatter.title ?? domain.slug
  )
}

function domainInitial(domain: (typeof domains.value)[0]): string {
  const t = domainTitle(domain).trim()
  return t ? t.charAt(0).toUpperCase() : '?'
}

function isDomainActive(slug: string): boolean {
  return route.params.domain === slug
}
</script>

<template>
  <div class="left-sidebar" :class="{ collapsed: ui.leftCollapsed }">
    <div class="logo">
      <button
        class="hamburger"
        :title="ui.leftCollapsed ? 'Развернуть меню' : 'Свернуть меню'"
        :aria-label="ui.leftCollapsed ? 'Развернуть меню' : 'Свернуть меню'"
        @click="ui.toggleLeftCollapsed"
      >
        <NIcon :size="18"><Menu /></NIcon>
      </button>
      <NIcon v-if="!ui.leftCollapsed" :size="20" class="logo-icon">
        <BookOpen />
      </NIcon>
      <span v-if="!ui.leftCollapsed" class="logo-text">Education Workspace</span>
    </div>

    <div class="section">
      <div v-if="!ui.leftCollapsed" class="section-header">
        <span class="section-label">ДОМЕНЫ</span>
      </div>

      <div
        v-for="domain in domains"
        :key="domain.slug"
        class="domain-item"
        :class="{ active: isDomainActive(domain.slug) }"
        :title="ui.leftCollapsed ? `${domainTitle(domain)} — ${domainProgress(domain)}%` : undefined"
        @click="router.push(`/d/${domain.slug}`)"
      >
        <span v-if="ui.leftCollapsed" class="domain-initial">{{ domainInitial(domain) }}</span>
        <template v-else>
          <span class="domain-name">{{ domainTitle(domain) }}</span>
          <span class="domain-pct">{{ domainProgress(domain) }}%</span>
        </template>
      </div>
    </div>

    <div class="section">
      <div v-if="!ui.leftCollapsed" class="section-header">
        <span class="section-label">БЫСТРЫЙ ДОСТУП</span>
      </div>

      <div
        class="quick-item"
        :title="ui.leftCollapsed ? 'SRS на сегодня' : undefined"
        @click="router.push('/srs')"
      >
        <NIcon :size="15"><Brain /></NIcon>
        <span v-if="!ui.leftCollapsed" class="quick-label">SRS на сегодня</span>
        <NBadge v-if="srs.dueCount > 0 && !ui.leftCollapsed" :value="srs.dueCount" :max="99" />
      </div>

      <div
        class="quick-item"
        :title="ui.leftCollapsed ? 'План обучения' : undefined"
        @click="router.push('/')"
      >
        <NIcon :size="15"><Map /></NIcon>
        <span v-if="!ui.leftCollapsed" class="quick-label">План обучения</span>
      </div>

      <div
        class="quick-item"
        :title="ui.leftCollapsed ? 'Закладки' : undefined"
        @click="router.push('/bookmarks')"
      >
        <NIcon :size="15"><Bookmark /></NIcon>
        <span v-if="!ui.leftCollapsed" class="quick-label">Закладки</span>
      </div>

      <div
        class="quick-item"
        :title="ui.leftCollapsed ? 'Последние' : undefined"
        @click="router.push('/recent')"
      >
        <NIcon :size="15"><Clock /></NIcon>
        <span v-if="!ui.leftCollapsed" class="quick-label">Последние</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.left-sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden auto;
  padding-bottom: 12px;
}
.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px 10px;
  font-weight: 600;
  font-size: 14px;
  border-bottom: 1px solid var(--app-border);
  flex-shrink: 0;
  min-height: 48px;
}
.left-sidebar.collapsed .logo {
  padding: 10px 0;
  justify-content: center;
}
.hamburger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  border-radius: 4px;
  flex-shrink: 0;
  transition: background 0.12s;
}
.hamburger:hover {
  background: var(--app-hover);
}
.logo-icon {
  color: var(--app-primary);
  flex-shrink: 0;
}
.logo-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.section {
  padding: 10px 0 4px;
  flex-shrink: 0;
}
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px 14px 6px;
}
.section-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  opacity: 0.45;
  text-transform: uppercase;
}
.domain-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  cursor: pointer;
  font-size: 13px;
  border-left: 2px solid transparent;
  transition: background 0.12s, border-color 0.12s;
}
.domain-item:hover {
  background: var(--app-hover);
}
.domain-item.active {
  border-left-color: var(--app-primary);
  color: var(--app-primary);
  background: var(--app-hover);
}
.domain-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.domain-pct {
  font-size: 12px;
  opacity: 0.55;
  flex-shrink: 0;
}
.domain-initial {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--app-hover);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}
.left-sidebar.collapsed .domain-item {
  justify-content: center;
  padding: 6px 0;
  border-left: 0;
}
.left-sidebar.collapsed .domain-item.active .domain-initial {
  background: var(--app-primary);
  color: var(--app-bg);
}
.quick-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 14px;
  cursor: pointer;
  font-size: 13px;
  opacity: 0.75;
  transition: opacity 0.12s, background 0.12s;
}
.quick-item:hover {
  opacity: 1;
  background: var(--app-hover);
}
.quick-label {
  flex: 1;
}
.left-sidebar.collapsed .quick-item {
  justify-content: center;
  padding: 9px 0;
}
.left-sidebar.collapsed .section {
  padding: 8px 0 4px;
}
</style>
