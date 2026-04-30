<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { NCard, NButton, NSpace, NProgress, NEmpty, NSelect, NTag, NIcon, NInput } from 'naive-ui'
import { RouterLink, useRouter } from 'vue-router'
import { X, ExternalLink, Search } from 'lucide-vue-next'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart } from 'echarts/charts'
import { TooltipComponent } from 'echarts/components'
import type { DomainTree, DocMeta } from '@/api'
import { useTheme } from '@/stores/theme'
import { useContent } from '@/stores/content'
import { useProgress } from '@/stores/progress'

use([CanvasRenderer, PieChart, TooltipComponent])

const theme = useTheme()
const content = useContent()
const progress = useProgress()
const router = useRouter()

const tree = computed<DomainTree[]>(() => content.tree)

onMounted(async () => {
  await content.load()
})

type Status = 'todo' | 'learning' | 'known'
type BucketKey = Status

const COLORS = computed<Record<BucketKey, string>>(() => ({
  known: theme.palette.success,
  learning: theme.palette.primary,
  todo: theme.palette.text3,
}))
const LABELS: Record<BucketKey, string> = {
  known: 'выучено',
  learning: 'в процессе',
  todo: 'не начато',
}

interface DocEntry {
  doc: DocMeta
  domain: string
  module: string | null
  status: Status
}

const RELEVANT = new Set(['theory', 'cards', 'drills', 'lesson'])

const docs = computed<DocEntry[]>(() => {
  const out: DocEntry[] = []
  for (const d of tree.value) {
    for (const doc of d.docs) {
      if (!RELEVANT.has(doc.frontmatter.type)) continue
      out.push({
        doc,
        domain: d.slug,
        module: null,
        status: progress.get(doc.id, doc.frontmatter.status ?? 'todo'),
      })
    }
    for (const m of d.modules) {
      for (const doc of m.docs) {
        if (!RELEVANT.has(doc.frontmatter.type)) continue
        out.push({
          doc,
          domain: d.slug,
          module: m.slug,
          status: progress.get(doc.id, doc.frontmatter.status ?? 'todo'),
        })
      }
    }
  }
  return out
})

const totals = computed(() => {
  const t = { known: 0, learning: 0, todo: 0, total: 0 }
  for (const e of docs.value) {
    t[e.status] += 1
    t.total += 1
  }
  return t
})

const segments = computed(() =>
  (['known', 'learning', 'todo'] as const)
    .map((k) => ({ key: k, label: LABELS[k], value: totals.value[k], color: COLORS.value[k] }))
    .filter((s) => s.value > 0),
)

const chartOption = computed(() => {
  const p = theme.palette
  return {
    tooltip: {
      trigger: 'item',
      backgroundColor: p.surface,
      borderColor: p.border,
      borderWidth: 1,
      textStyle: { color: p.text, fontSize: 13 },
      formatter: (pt: { name: string; value: number; percent: number }) =>
        `${pt.name}<br/><b>${pt.value}</b> · ${pt.percent.toFixed(0)}%`,
    },
    series: [
      {
        type: 'pie',
        radius: ['62%', '84%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: true,
        label: { show: false },
        labelLine: { show: false },
        itemStyle: {
          borderColor: p.surface,
          borderWidth: 2,
        },
        emphasis: { scale: true, scaleSize: 4, itemStyle: { shadowBlur: 0 } },
        data: segments.value.map((s) => ({
          value: s.value,
          name: s.label,
          itemStyle: { color: s.color, opacity: selected.value && selected.value !== s.key ? 0.35 : 1 },
        })),
      },
    ],
  }
})

function pct(v: number) {
  if (!totals.value.total) return 0
  return Math.round((v / totals.value.total) * 100)
}

// Drill-down selection
const selected = ref<BucketKey | null>(null)
const query = ref('')
function pickStatus(k: BucketKey) {
  const prev = selected.value
  selected.value = prev === k ? null : k
  if (selected.value !== prev) query.value = ''
}
function onChartClick(p: { name: string }) {
  const entry = segments.value.find((s) => s.label === p.name)
  if (entry) pickStatus(entry.key)
}

const filteredDocs = computed(() => {
  if (!selected.value) return []
  const sel = selected.value
  const q = query.value.trim().toLowerCase()
  return docs.value.filter((e) => {
    if (e.status !== sel) return false
    if (!q) return true
    const hay = `${e.doc.frontmatter.title} ${e.domain} ${e.module ?? ''} ${e.doc.frontmatter.type} ${(e.doc.frontmatter.tags ?? []).join(' ')}`.toLowerCase()
    return hay.includes(q)
  })
})

const statusOptions = [
  { label: 'не начато', value: 'todo' },
  { label: 'в процессе', value: 'learning' },
  { label: 'выучено', value: 'known' },
]

async function setDocStatus(e: DocEntry, v: Status) {
  await progress.set(e.doc.id, v)
}

function openDoc(e: DocEntry) {
  if (e.module) {
    router.push(`/d/${e.domain}/m/${e.module}/doc/${encodeURIComponent(e.doc.id)}`)
  } else {
    router.push(`/d/${e.domain}`)
  }
}

function typeLabel(t: string): string {
  return (
    {
      theory: 'теория',
      cards: 'карточки',
      drills: 'упражнения',
      lesson: 'урок',
    }[t] ?? t
  )
}
</script>

<template>
  <h2 style="margin-bottom: 18px">Главная</h2>

  <NCard title="Прогресс" style="margin-bottom: 16px">
    <div v-if="totals.total" class="progress-grid">
      <div class="chart-wrap">
        <VChart :option="chartOption" autoresize @click="onChartClick" />
        <div class="center-label">
          <div class="big">{{ pct(totals.known) }}%</div>
          <div class="small">выучено</div>
        </div>
      </div>
      <ul class="legend">
        <li
          v-for="s in segments"
          :key="s.key"
          class="clickable"
          :class="{ active: selected === s.key, dim: selected && selected !== s.key }"
          @click="pickStatus(s.key)"
        >
          <span class="dot" :style="{ background: s.color }" />
          <span class="lbl">{{ s.label }}</span>
          <span class="val">{{ s.value }}</span>
          <span class="p">{{ pct(s.value) }}%</span>
        </li>
        <li class="total">
          <span class="lbl">всего</span>
          <span class="val">{{ totals.total }}</span>
          <span class="p">100%</span>
        </li>
      </ul>
    </div>
    <NEmpty v-else description="Пока нет ни одного домена с контентом" />

    <div v-if="selected" class="drilldown">
      <div class="drill-head">
        <span class="drill-head-left">
          <NTag
            :color="{ color: 'transparent', textColor: COLORS[selected], borderColor: COLORS[selected] }"
            size="small"
            round
          >
            {{ LABELS[selected] }}
          </NTag>
          <span class="drill-count">{{ filteredDocs.length }} шт.</span>
        </span>
        <NInput
          v-model:value="query"
          size="small"
          placeholder="фильтр по названию, домену, тегу…"
          clearable
          style="max-width: 320px; flex: 1; margin: 0 12px"
        >
          <template #prefix>
            <NIcon :size="14" :depth="3"><Search /></NIcon>
          </template>
        </NInput>
        <NButton size="tiny" quaternary @click="selected = null">
          <template #icon><NIcon><X :size="14" /></NIcon></template>
          сбросить
        </NButton>
      </div>
      <NEmpty
        v-if="!filteredDocs.length"
        size="small"
        :description="query ? 'Ничего не нашлось по запросу' : 'В этой категории пусто'"
      />
      <table v-else class="drill-table">
        <tbody>
          <tr v-for="e in filteredDocs" :key="e.doc.id">
            <td class="title-cell">
              <div class="t">{{ e.doc.frontmatter.title }}</div>
              <div class="sub">
                {{ e.domain }}<span v-if="e.module"> / {{ e.module }}</span>
                · <span class="type">{{ typeLabel(e.doc.frontmatter.type) }}</span>
              </div>
            </td>
            <td class="status-cell">
              <NSelect
                :value="e.status"
                :options="statusOptions"
                size="small"
                style="width: 140px"
                @update:value="(v: Status) => setDocStatus(e, v)"
              />
            </td>
            <td class="open-cell">
              <NButton size="small" quaternary @click="openDoc(e)">
                <template #icon><NIcon><ExternalLink :size="14" /></NIcon></template>
                открыть
              </NButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <template #action>
      <RouterLink to="/srs">
        <NButton type="primary" size="small">SRS на сегодня</NButton>
      </RouterLink>
    </template>
  </NCard>

  <NCard title="Домены">
    <NEmpty v-if="!tree.length" description="Добавь домен в /domains чтобы начать" />
    <NSpace v-else vertical :size="8">
      <RouterLink
        v-for="d in tree"
        :key="d.slug"
        :to="`/d/${d.slug}`"
        class="domain-row"
      >
        <span class="slug">
          {{ d.slug }}<span v-if="d.hidden" class="muted"> (пример)</span>
        </span>
        <div class="meta">
          <NProgress
            type="line"
            :percentage="d.summary.total ? Math.round((d.summary.known / d.summary.total) * 100) : 0"
            :height="6"
            :show-indicator="false"
            style="width: 180px"
          />
          <span class="counts">
            {{ d.summary.known }} / {{ d.summary.total }}
          </span>
        </div>
      </RouterLink>
    </NSpace>
  </NCard>
</template>

<style scoped>
.progress-grid {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 28px;
  align-items: center;
}
.chart-wrap {
  position: relative;
  width: 220px;
  height: 220px;
}
.chart-wrap :deep(canvas) {
  display: block;
}
.center-label {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
.big {
  font-size: 32px;
  font-weight: 600;
  letter-spacing: -0.5px;
  font-variant-numeric: tabular-nums;
}
.small {
  font-size: 12px;
  opacity: 0.6;
  margin-top: 2px;
}

.legend {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.legend li {
  display: grid;
  grid-template-columns: 14px 1fr auto 48px;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  padding: 6px 8px;
  border-bottom: 1px dashed var(--n-divider-color, rgba(128, 128, 128, 0.12));
  border-radius: 4px;
  transition: background 0.15s, opacity 0.15s;
}
.legend li.clickable {
  cursor: pointer;
}
.legend li.clickable:hover {
  background: var(--n-color-hover, rgba(128, 128, 128, 0.08));
}
.legend li.active {
  background: var(--n-color-hover, rgba(128, 128, 128, 0.12));
}
.legend li.dim {
  opacity: 0.45;
}
.legend li.total {
  font-weight: 500;
  opacity: 0.75;
  border-bottom: none;
  cursor: default;
}
.legend li.total .lbl {
  grid-column: 1 / 3;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.lbl {
  opacity: 0.85;
}
.val {
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  text-align: right;
}
.p {
  opacity: 0.55;
  font-size: 12px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.drilldown {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px dashed var(--n-divider-color, rgba(128, 128, 128, 0.2));
}
.drill-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.drill-head-left {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}
.drill-count {
  margin-left: 10px;
  opacity: 0.6;
  font-size: 13px;
}
.drill-table {
  width: 100%;
  border-collapse: collapse;
}
.drill-table tr {
  border-bottom: 1px dashed var(--n-divider-color, rgba(128, 128, 128, 0.12));
}
.drill-table tr:last-child {
  border-bottom: none;
}
.drill-table td {
  padding: 8px 6px;
  vertical-align: middle;
}
.title-cell .t {
  font-size: 14px;
  font-weight: 500;
}
.title-cell .sub {
  font-size: 12px;
  opacity: 0.6;
  margin-top: 2px;
}
.title-cell .type {
  font-variant: small-caps;
  letter-spacing: 0.5px;
}
.status-cell {
  width: 150px;
}
.open-cell {
  width: 100px;
  text-align: right;
}

.domain-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  color: inherit;
  text-decoration: none;
  padding: 6px 8px;
  border-radius: 6px;
  transition: background 0.15s;
}
.domain-row:hover {
  background: var(--n-color-hover, rgba(128, 128, 128, 0.08));
}
.slug {
  font-weight: 500;
}
.muted {
  opacity: 0.5;
  font-weight: 400;
}
.meta {
  display: flex;
  align-items: center;
  gap: 12px;
}
.counts {
  font-size: 12px;
  opacity: 0.7;
  width: 54px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

@media (max-width: 720px) {
  .progress-grid {
    grid-template-columns: 1fr;
    justify-items: center;
  }
  .status-cell { width: auto; }
  .open-cell { width: auto; }
}
</style>
