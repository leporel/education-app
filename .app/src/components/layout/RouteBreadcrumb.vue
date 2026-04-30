<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NDropdown, NButton, NIcon } from 'naive-ui'
import { ChevronDown } from 'lucide-vue-next'
import { useContent } from '@/stores/content'

const route = useRoute()
const router = useRouter()
const content = useContent()

const domainSlug = computed(() => route.params.domain as string | undefined)
const moduleSlug = computed(() => route.params.module as string | undefined)
const docId = computed(() => route.params.docId as string | undefined)

const currentDomain = computed(() =>
  domainSlug.value ? content.domainBySlug(domainSlug.value) : undefined,
)

const currentModule = computed(() =>
  domainSlug.value && moduleSlug.value
    ? content.moduleBySlug(domainSlug.value, moduleSlug.value)
    : undefined,
)

const domainOptions = computed(() =>
  content.tree
    .filter((d) => !d.hidden)
    .map((d) => ({
      key: d.slug,
      label: d.docs.find((doc) => doc.frontmatter.type === 'index')?.frontmatter.title ?? d.slug,
    })),
)

const moduleOptions = computed(() =>
  currentDomain.value?.modules.map((m) => ({
    key: m.slug,
    label: m.docs.find((d) => d.frontmatter.type === 'index')?.frontmatter.title ?? m.slug,
  })) ?? [],
)

const docOptions = computed(() =>
  currentModule.value?.docs.map((d) => ({
    key: d.id,
    label: d.frontmatter.title || d.id,
  })) ?? [],
)

const domainLabel = computed(
  () =>
    currentDomain.value?.docs.find((d) => d.frontmatter.type === 'index')?.frontmatter.title ??
    domainSlug.value ??
    '',
)

const moduleLabel = computed(
  () =>
    currentModule.value?.docs.find((d) => d.frontmatter.type === 'index')?.frontmatter.title ??
    moduleSlug.value ??
    '',
)

const docLabel = computed(() => {
  if (!docId.value || !currentModule.value) return ''
  const decoded = decodeURIComponent(docId.value)
  return (
    currentModule.value.docs.find((d) => d.id === decoded)?.frontmatter.title ?? decoded
  )
})

function selectDomain(key: string) {
  router.push(`/d/${key}`)
}

function selectModule(key: string) {
  if (!domainSlug.value) return
  router.push(`/d/${domainSlug.value}/m/${key}`)
}

function selectDoc(key: string) {
  if (!domainSlug.value || !moduleSlug.value) return
  const doc = currentModule.value?.docs.find((d) => d.id === key)
  if (!doc) return
  router.push(
    content.routeFor({
      id: doc.id,
      domain: domainSlug.value,
      module: moduleSlug.value,
      type: doc.frontmatter.type,
    }),
  )
}
</script>

<template>
  <div class="breadcrumb">
    <template v-if="domainSlug">
      <NDropdown
        :options="domainOptions"
        placement="bottom-start"
        @select="selectDomain"
      >
        <NButton text size="small" class="crumb-btn" icon-placement="right">
          {{ domainLabel }}
          <template #icon>
            <NIcon><ChevronDown :size="12" /></NIcon>
          </template>
        </NButton>
      </NDropdown>

      <span class="sep">›</span>

      <template v-if="moduleSlug">
        <NDropdown
          :options="moduleOptions"
          placement="bottom-start"
          @select="selectModule"
        >
          <NButton text size="small" class="crumb-btn" icon-placement="right">
            {{ moduleLabel }}
            <template #icon>
              <NIcon><ChevronDown :size="12" /></NIcon>
            </template>
            </NButton>
        </NDropdown>

        <span class="sep">›</span>

        <template v-if="docId">
          <NDropdown
            :options="docOptions"
            placement="bottom-start"
            @select="selectDoc"
          >
            <NButton text size="small" class="crumb-btn" icon-placement="right">
              {{ docLabel }}
              <template #icon>
                <NIcon><ChevronDown :size="12" /></NIcon>
              </template>
                </NButton>
          </NDropdown>
        </template>
      </template>
    </template>
    <span v-else class="crumb-home">Education Workspace</span>
  </div>
</template>

<style scoped>
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 2px;
  min-width: 0;
  overflow: hidden;
}
.crumb-btn {
  font-size: 13px;
  opacity: 0.9;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.crumb-home {
  font-size: 13px;
  opacity: 0.6;
}
.sep {
  opacity: 0.4;
  font-size: 14px;
  padding: 0 2px;
}
</style>
