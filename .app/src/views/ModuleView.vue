<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { NCard, NTabs, NTabPane, NTag, NSpace, NEmpty, NButton } from 'naive-ui'
import { api, type DomainTree, type Doc } from '@/api'
import MdRender from '@/components/MdRender.vue'
import FrontmatterBadges from '@/components/content/FrontmatterBadges.vue'
import SummaryBox from '@/components/content/SummaryBox.vue'

const props = defineProps<{ domain: string; module: string }>()

const tree = ref<DomainTree | null>(null)
const index = ref<Doc | null>(null)
const theory = ref<Doc | null>(null)
const cards = ref<Doc | null>(null)
const drills = ref<Doc | null>(null)
const lessons = ref<Doc[]>([])

const moduleId = computed(() => `${props.domain}.${props.module}`)

function docSummary(doc: Doc | null): string {
  return (doc?.frontmatter.summary as string | undefined) ?? ''
}

async function load() {
  const all = await api.tree()
  tree.value = all.find((d) => d.slug === props.domain) ?? null
  const mod = tree.value?.modules.find((m) => m.slug === props.module)
  if (!mod) return
  const byType = (t: string) => mod.docs.find((d) => d.frontmatter.type === t)
  const lessonMetas = mod.docs.filter((d) => d.frontmatter.type === 'lesson')
  const [i, t, c, dr, ...ls] = await Promise.all([
    byType('index')?.id ? api.doc(byType('index')!.id) : Promise.resolve(null),
    byType('theory')?.id ? api.doc(byType('theory')!.id) : Promise.resolve(null),
    byType('cards')?.id ? api.doc(byType('cards')!.id) : Promise.resolve(null),
    byType('drills')?.id ? api.doc(byType('drills')!.id) : Promise.resolve(null),
    ...lessonMetas.map((m) => api.doc(m.id)),
  ])
  index.value = i as Doc | null
  theory.value = t as Doc | null
  cards.value = c as Doc | null
  drills.value = dr as Doc | null
  lessons.value = ls.filter(Boolean) as Doc[]
}

onMounted(load)
watch(() => [props.domain, props.module], load)
</script>

<template>
  <div>
    <h2 style="margin: 0 0 14px">{{ index?.frontmatter.title ?? props.module }}</h2>

    <NTabs type="line" default-value="index">
      <NTabPane name="index" tab="Обзор" v-if="index">
        <FrontmatterBadges :frontmatter="index.frontmatter" :id="index.id" />
        <SummaryBox :text="docSummary(index)" />
        <NCard>
          <MdRender :body="index.body" :module-id="moduleId" :doc-path="index.path" />
        </NCard>
      </NTabPane>

      <NTabPane name="theory" tab="Теория" v-if="theory">
        <FrontmatterBadges :frontmatter="theory.frontmatter" :id="theory.id" />
        <SummaryBox :text="docSummary(theory)" />
        <NCard>
          <MdRender :body="theory.body" :module-id="moduleId" :doc-path="theory.path" />
        </NCard>
      </NTabPane>

      <NTabPane name="cards" tab="Карточки" v-if="cards">
        <FrontmatterBadges :frontmatter="cards.frontmatter" :id="cards.id" />
        <NCard>
          <MdRender :body="cards.body" :module-id="moduleId" :doc-path="cards.path" />
        </NCard>
      </NTabPane>

      <NTabPane name="drills" tab="Упражнения" v-if="drills">
        <FrontmatterBadges :frontmatter="drills.frontmatter" :id="drills.id" />
        <NCard>
          <MdRender :body="drills.body" :module-id="moduleId" :doc-path="drills.path" />
        </NCard>
      </NTabPane>

      <NTabPane name="lessons" tab="Уроки">
        <NEmpty v-if="!lessons.length" description="Уроков пока нет" />
        <NSpace vertical v-else>
          <NCard v-for="ls in lessons" :key="ls.id">
            <template #header>
              <NSpace align="center">
                <span>{{ ls.frontmatter.title }}</span>
                <NTag size="small">{{ ls.frontmatter.status ?? 'todo' }}</NTag>
              </NSpace>
            </template>
            <template #header-extra>
              <RouterLink
                :to="`/d/${props.domain}/m/${props.module}/doc/${encodeURIComponent(ls.id)}`"
              >
                <NButton size="small">Открыть</NButton>
              </RouterLink>
            </template>
            <div style="opacity: 0.7; font-size: 13px">
              {{ ls.path }}
            </div>
          </NCard>
        </NSpace>
      </NTabPane>
    </NTabs>
  </div>
</template>

<style scoped>
.link {
  color: inherit;
  text-decoration: none;
}
.link:hover {
  text-decoration: underline;
}
</style>
