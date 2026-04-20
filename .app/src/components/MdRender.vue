<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'
import { NCard, NTag } from 'naive-ui'
import { parseBlocks } from '@/lib/parse'
import type { Card, Drill } from '@/api'
import { useContent } from '@/stores/content'
import DrillRunner from './DrillRunner.vue'

const props = defineProps<{
  body: string
  moduleId?: string
  docPath?: string
}>()

const router = useRouter()
const content = useContent()

function onClick(e: MouseEvent) {
  const target = (e.target as HTMLElement | null)?.closest('a') as HTMLAnchorElement | null
  if (!target) return
  const href = target.getAttribute('href') ?? ''
  if (!href) return
  if (/^(https?:|mailto:|tel:|#)/i.test(href)) return
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
  if (!props.docPath) return
  const resolved = content.resolveLink(props.docPath, href)
  if (resolved) {
    e.preventDefault()
    router.push(content.routeFor(resolved))
    return
  }
  // Unresolved relative/.md link — try opening the raw MD in a new tab as a fallback.
  if (/\.md(?:[#?]|$)/i.test(href) || !/^\//.test(href)) {
    try {
      const base = new URL(`/${props.docPath}`, window.location.origin)
      const out = new URL(href, base)
      const rel = decodeURIComponent(out.pathname.replace(/^\/+/, ''))
      e.preventDefault()
      window.open(`/raw/${rel}`, '_blank', 'noopener')
    } catch {
      /* noop */
    }
  }
}

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  highlight(str, lang) {
    if (lang && lang !== 'card' && lang !== 'drill' && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value
      } catch {
        /* noop */
      }
    }
    return ''
  },
})

function resolveRawSrc(src: string, docPath: string | undefined): string | null {
  if (!docPath) return null
  if (/^(https?:|data:|blob:|\/raw\/)/i.test(src)) return null
  try {
    const base = new URL(`/${docPath}`, window.location.origin)
    const out = new URL(src, base)
    const rel = decodeURIComponent(out.pathname.replace(/^\/+/, ''))
    return `/raw/${rel.split('/').map(encodeURIComponent).join('/')}`
  } catch {
    return null
  }
}

// Custom image renderer: resolve relative src against docPath, wrap in link
// that opens the original in a new tab on click.
md.renderer.rules.image = (tokens, idx) => {
  const token = tokens[idx]
  const srcAttr = token.attrGet('src') ?? ''
  const altToken = token.children?.[0]
  const alt = altToken?.content ?? ''
  const resolved = resolveRawSrc(srcAttr, props.docPath) ?? srcAttr
  const title = token.attrGet('title')
  const titleAttr = title ? ` title="${md.utils.escapeHtml(title)}"` : ''
  return `<a href="${md.utils.escapeHtml(resolved)}" target="_blank" rel="noopener" class="md-img-link"><img src="${md.utils.escapeHtml(resolved)}" alt="${md.utils.escapeHtml(alt)}"${titleAttr} loading="lazy" /></a>`
}

// Replace card/drill blocks with sentinel HTML tokens and render rest as normal MD.
// Blocks become cards/drills below the prose (simpler than Vue custom fence).

interface Segment {
  type: 'md' | 'card' | 'drill'
  md?: string
  card?: Card
  drill?: Drill
}

const segments = computed<Segment[]>(() => {
  const blocks = parseBlocks(props.body, props.moduleId ?? 'unknown')
  const out: Segment[] = []
  let cursor = 0
  for (const b of blocks) {
    if (b.start > cursor) out.push({ type: 'md', md: props.body.slice(cursor, b.start) })
    if (b.kind === 'card' && b.data) out.push({ type: 'card', card: b.data as Card })
    else if (b.kind === 'drill' && b.data) out.push({ type: 'drill', drill: b.data as Drill })
    cursor = b.end
  }
  if (cursor < props.body.length) out.push({ type: 'md', md: props.body.slice(cursor) })
  return out
})

function renderMd(src: string): string {
  return md.render(src)
}
</script>

<template>
  <div class="md-render" @click="onClick">
    <template v-for="(seg, i) in segments" :key="i">
      <div v-if="seg.type === 'md'" class="md" v-html="renderMd(seg.md!)" />
      <NCard v-else-if="seg.type === 'card'" size="small" class="inline-card">
        <div class="card-front">{{ seg.card!.front }}</div>
        <div class="card-back">{{ seg.card!.back }}</div>
        <div v-if="seg.card!.hint" class="card-hint">подсказка: {{ seg.card!.hint }}</div>
        <template v-if="seg.card!.tags" #footer>
          <NTag v-for="t in seg.card!.tags" :key="t" size="small" style="margin-right: 4px">{{ t }}</NTag>
        </template>
      </NCard>
      <DrillRunner v-else-if="seg.type === 'drill'" :drill="seg.drill!" />
    </template>
  </div>
</template>

<style scoped>
.md-render :deep(h1),
.md-render :deep(h2),
.md-render :deep(h3) {
  margin-top: 1.4em;
}
.md-render :deep(a) {
  color: var(--md-link, currentColor);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.15s, color 0.15s;
}
.md-render :deep(a:hover) {
  color: var(--md-link-hover, currentColor);
  border-bottom-color: currentColor;
}
.md-render :deep(a:visited) {
  color: var(--md-link, currentColor);
}
.md-render :deep(pre) {
  padding: 12px;
  border-radius: 6px;
  overflow: auto;
}
.md-render :deep(.md-img-link) {
  display: inline-block;
  max-width: 100%;
  border-bottom: none;
  line-height: 0;
}
.md-render :deep(.md-img-link img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  background: rgba(127, 127, 127, 0.08);
}
.md-render :deep(code) {
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-size: 0.92em;
}
.md-render :deep(table) {
  border-collapse: collapse;
  margin: 1em 0;
}
.md-render :deep(th),
.md-render :deep(td) {
  border: 1px solid #444;
  padding: 6px 10px;
}
.inline-card {
  margin: 12px 0;
  max-width: 520px;
}
.card-front {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 6px;
}
.card-back {
  font-size: 16px;
  opacity: 0.85;
}
.card-hint {
  font-size: 12px;
  opacity: 0.6;
  margin-top: 6px;
}
</style>
