<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { NCard, NTabs, NTabPane, NList, NListItem, NThing, NTag, NSpace } from 'naive-ui'
import { api, type DomainTree, type Doc } from '@/api'
import MdRender from '@/components/MdRender.vue'
import RoadmapGraph from '@/components/RoadmapGraph.vue'
import MiscTree from '@/components/MiscTree.vue'

const props = defineProps<{ domain: string }>()
const route = useRoute()
const router = useRouter()

const allowedTabs = ['overview', 'memory', 'graph', 'roadmap', 'misc'] as const
type Tab = (typeof allowedTabs)[number]
const activeTab = computed<Tab>({
  get: () => {
    const q = route.query.tab
    const v = Array.isArray(q) ? q[0] : q
    return (allowedTabs as readonly string[]).includes(v ?? '') ? (v as Tab) : 'overview'
  },
  set: (v) => {
    router.replace({ query: { ...route.query, tab: v === 'overview' ? undefined : v } })
  },
})

const tree = ref<DomainTree | null>(null)
const readme = ref<Doc | null>(null)
const memory = ref<Doc | null>(null)
const roadmap = ref<Doc | null>(null)

async function load() {
  const all = await api.tree()
  tree.value = all.find((d) => d.slug === props.domain) ?? null
  if (!tree.value) return
  const docs = tree.value.docs
  const readmeMeta = docs.find((d) => d.frontmatter.type === 'index')
  const memoryMeta = docs.find((d) => d.frontmatter.type === 'memory')
  const roadmapMeta = docs.find((d) => d.frontmatter.type === 'roadmap')
  readme.value = readmeMeta ? await api.doc(readmeMeta.id) : null
  memory.value = memoryMeta ? await api.doc(memoryMeta.id) : null
  roadmap.value = roadmapMeta ? await api.doc(roadmapMeta.id) : null
}

onMounted(load)
watch(() => props.domain, load)

const title = computed(() => readme.value?.frontmatter.title ?? props.domain)
</script>

<template>
  <div v-if="tree">
    <h2 style="margin-bottom: 6px">{{ title }}</h2>
    <div style="opacity: 0.6; margin-bottom: 18px">{{ props.domain }}</div>

    <NTabs type="line" v-model:value="activeTab">
      <NTabPane name="overview" tab="Обзор">
        <NCard v-if="readme" :title="readme.frontmatter.title" style="margin-bottom: 16px">
          <MdRender :body="readme.body" :module-id="`${props.domain}.root`" :doc-path="readme.path" />
        </NCard>

        <NCard title="Модули">
          <NList>
            <NListItem v-for="m in tree.modules" :key="m.slug">
              <NThing>
                <template #header>
                  <RouterLink :to="`/d/${props.domain}/m/${m.slug}`" class="link">
                    {{ m.slug }}
                  </RouterLink>
                </template>
                <template #description>
                  <NSpace size="small">
                    <NTag v-for="doc in m.docs.slice(0, 4)" :key="doc.id" size="small">
                      {{ doc.frontmatter.type }}
                    </NTag>
                  </NSpace>
                </template>
              </NThing>
            </NListItem>
          </NList>
        </NCard>
      </NTabPane>

      <NTabPane name="memory" tab="Память" v-if="memory">
        <NCard :title="memory.frontmatter.title">
          <MdRender :body="memory.body" :doc-path="memory.path" />
        </NCard>
      </NTabPane>

      <NTabPane name="graph" tab="Граф">
        <NCard title="Модули">
          <RoadmapGraph :domain="tree" />
        </NCard>
      </NTabPane>

      <NTabPane name="roadmap" tab="Roadmap" v-if="roadmap">
        <NCard :title="roadmap.frontmatter.title">
          <MdRender :body="roadmap.body" :doc-path="roadmap.path" />
        </NCard>
      </NTabPane>

      <NTabPane name="misc" tab="Материалы">
        <NCard title="Материалы">
          <MiscTree :misc="tree.misc ?? []" :domain="props.domain" />
        </NCard>
      </NTabPane>
    </NTabs>
  </div>
</template>

<style scoped>
.link {
  color: inherit;
  text-decoration: none;
  font-weight: 500;
}
.link:hover {
  text-decoration: underline;
}
</style>
