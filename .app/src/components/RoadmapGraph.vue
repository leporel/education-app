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

const states = computed(() => {
  const p = theme.palette
  return {
    todo: { bg: p.surfaceAlt, border: p.border, fg: p.text2 },
    learning: { bg: p.warningSoft, border: p.warning, fg: p.warning },
    known: { bg: p.successSoft, border: p.success, fg: p.success },
  }
})

const nodes = computed<Node[]>(() => {
  const pal = states.value
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
      <Background :pattern-color="theme.palette.border" :gap="18" />
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
.graph :deep(.vue-flow__edge-path) {
  stroke: var(--app-muted);
  stroke-width: 1.5;
}
.graph :deep(.vue-flow__controls button) {
  background: var(--app-surface);
  border-color: var(--app-border);
  color: var(--app-text);
  fill: var(--app-text);
}
.graph :deep(.vue-flow__controls button:hover) {
  background: var(--app-hover);
}
.graph :deep(.vue-flow__node.selected) {
  box-shadow: 0 0 0 2px var(--app-primary);
}
</style>
