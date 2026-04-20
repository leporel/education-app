<script setup lang="ts">
import { computed } from 'vue'
import { VueFlow, type Node, type Edge } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import type { DomainTree, DocMeta } from '@/api'
import { useRouter } from 'vue-router'
import { useProgress } from '@/stores/progress'
import { useTheme } from '@/stores/theme'

const props = defineProps<{ domain: DomainTree }>()
const router = useRouter()
const progress = useProgress()
const theme = useTheme()

// Aggregate module status: known if all content docs known, learning if any learning, else todo.
function moduleState(docs: DocMeta[]): 'todo' | 'learning' | 'known' {
  const content = docs.filter((d) =>
    ['theory', 'cards', 'drills', 'lesson'].includes(d.frontmatter.type),
  )
  if (!content.length) return 'todo'
  let allKnown = true
  let anyLearning = false
  for (const d of content) {
    const s = progress.get(d.id, d.frontmatter.status ?? 'todo')
    if (s !== 'known') allKnown = false
    if (s === 'learning') anyLearning = true
  }
  if (allKnown) return 'known'
  if (anyLearning) return 'learning'
  return 'todo'
}

const palettes = {
  dark: {
    todo: { bg: '#2f2f37', border: '#55555f', fg: '#c9c6bf' },
    learning: { bg: '#3a3224', border: '#c49a3a', fg: '#e8d89c' },
    known: { bg: '#263022', border: '#8fb07a', fg: '#c7dcb8' },
  },
  light: {
    todo: { bg: '#ece8df', border: '#b8b3a8', fg: '#3d3d44' },
    learning: { bg: '#f6e7bf', border: '#b8873a', fg: '#5a4418' },
    known: { bg: '#d8e5c8', border: '#6b8e5a', fg: '#34502a' },
  },
} as const

const nodes = computed<Node[]>(() => {
  const pal = palettes[theme.mode as 'dark' | 'light']
  return props.domain.modules.map((m, i) => {
    const state = moduleState(m.docs)
    const p = pal[state]
    return {
      id: m.slug,
      position: { x: i * 220, y: 0 },
      data: { label: m.slug, state },
      type: 'default',
      style: {
        background: p.bg,
        border: `1.5px solid ${p.border}`,
        color: p.fg,
        borderRadius: '8px',
        padding: '10px 14px',
        fontSize: '13px',
        fontWeight: '500',
        width: '180px',
      },
    }
  })
})

const edges = computed<Edge[]>(() =>
  props.domain.modules.slice(0, -1).map((m, i) => ({
    id: `e-${m.slug}`,
    source: m.slug,
    target: props.domain.modules[i + 1].slug,
    animated: false,
  })),
)

function onNodeClick(ev: { node: Node }) {
  router.push(`/d/${props.domain.slug}/m/${ev.node.id}`)
}
</script>

<template>
  <div class="graph" :class="`vf-theme-${theme.mode}`">
    <VueFlow
      :nodes="nodes"
      :edges="edges"
      :default-viewport="{ zoom: 0.9, x: 20, y: 80 }"
      :nodes-draggable="false"
      :nodes-connectable="false"
      :edges-updatable="false"
      @node-click="onNodeClick"
    >
      <Background :pattern-color="theme.mode === 'dark' ? '#40404a' : '#c8c3b8'" :gap="18" />
      <Controls />
    </VueFlow>
  </div>
</template>

<style scoped>
.graph {
  height: 360px;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
}
.vf-theme-dark :deep(.vue-flow__edge-path) {
  stroke: #6b6b72;
  stroke-width: 1.5;
}
.vf-theme-light :deep(.vue-flow__edge-path) {
  stroke: #9a958a;
  stroke-width: 1.5;
}
.vf-theme-dark :deep(.vue-flow__controls button) {
  background: #2b2b33;
  border-color: #3a3a42;
  color: #d6d4ce;
  fill: #d6d4ce;
}
.vf-theme-dark :deep(.vue-flow__controls button:hover) {
  background: #34343d;
}
.vf-theme-light :deep(.vue-flow__controls button) {
  background: #fffdf9;
  border-color: #d8d3c8;
  color: #2a2a2e;
  fill: #2a2a2e;
}
.graph :deep(.vue-flow__node.selected) {
  box-shadow: 0 0 0 2px var(--md-link, #6ecbd4);
}
</style>
