import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { api, type DomainTree, type MiscEntry, type NoteMeta } from '@/api'

export interface ResolvedDoc {
  id: string
  domain: string
  module?: string
  type: string
}

export const useContent = defineStore('content', () => {
  const tree = ref<DomainTree[]>([])
  const loaded = ref(false)

  const byPath = computed(() => {
    const m = new Map<string, ResolvedDoc>()
    for (const d of tree.value) {
      for (const doc of d.docs) {
        m.set(doc.path, { id: doc.id, domain: d.slug, type: doc.frontmatter.type })
      }
      for (const mod of d.modules) {
        for (const doc of mod.docs) {
          m.set(doc.path, {
            id: doc.id,
            domain: d.slug,
            module: mod.slug,
            type: doc.frontmatter.type,
          })
        }
      }
      for (const n of d.notes ?? []) {
        m.set(n.path, { id: n.id, domain: d.slug, type: 'note' })
      }
    }
    return m
  })

  async function load(force = false) {
    if (loaded.value && !force) return
    tree.value = await api.tree()
    loaded.value = true
  }

  function resolveLink(currentPath: string, href: string): ResolvedDoc | null {
    try {
      const base = new URL(`/${currentPath}`, 'http://x/')
      const out = new URL(href, base)
      const rel = decodeURIComponent(out.pathname.replace(/^\/+/, ''))
      const exact = byPath.value.get(rel)
      if (exact) return exact
      const trimmed = rel.replace(/\/+$/, '')
      const modMatch = trimmed.match(/\/modules\/([^/]+)(?:\/lessons)?$/)
      if (modMatch) {
        const modSlug = modMatch[1]
        const hit = [...byPath.value.values()].find(
          (v) => v.module === modSlug && v.type === 'index',
        )
        if (hit) return { id: hit.id, domain: hit.domain, module: hit.module, type: 'index' }
      }
      return null
    } catch {
      return null
    }
  }

  function routeFor(r: ResolvedDoc): string {
    if (r.type === 'note') return `/d/${r.domain}?note=${encodeURIComponent(r.id)}`
    if (!r.module) {
      if (r.type === 'memory') return `/d/${r.domain}?tab=memory`
      if (r.type === 'roadmap') return `/d/${r.domain}?tab=roadmap`
      return `/d/${r.domain}`
    }
    if (r.type === 'index') return `/d/${r.domain}/m/${r.module}`
    return `/d/${r.domain}/m/${r.module}/doc/${encodeURIComponent(r.id)}`
  }

  function notesFor(domain: string): NoteMeta[] {
    return tree.value.find((d) => d.slug === domain)?.notes ?? []
  }

  function miscFor(domain: string): MiscEntry[] {
    return tree.value.find((d) => d.slug === domain)?.misc ?? []
  }

  function domainBySlug(slug: string) {
    return tree.value.find((d) => d.slug === slug)
  }

  function moduleBySlug(domainSlug: string, moduleSlug: string) {
    return domainBySlug(domainSlug)?.modules.find((m) => m.slug === moduleSlug)
  }

  function siblingDocs(domainSlug: string, moduleSlug: string) {
    return moduleBySlug(domainSlug, moduleSlug)?.docs ?? []
  }

  return {
    tree,
    loaded,
    byPath,
    load,
    resolveLink,
    routeFor,
    notesFor,
    miscFor,
    domainBySlug,
    moduleBySlug,
    siblingDocs,
  }
})
