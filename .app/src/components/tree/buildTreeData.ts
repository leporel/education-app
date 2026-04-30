import { h } from 'vue'
import { NIcon } from 'naive-ui'
import type { TreeOption } from 'naive-ui'
import { FileText, Folder, StickyNote, Package } from 'lucide-vue-next'
import type { DomainTree, DocMeta, MiscEntry, NoteMeta } from '@/api'

export interface DocTreeOption extends TreeOption {
  docMeta?: DocMeta
  miscEntry?: MiscEntry
  noteMeta?: NoteMeta
  domainSlug?: string
  moduleSlug?: string
}

function docIcon() {
  return h(NIcon, { size: 14 }, () => h(FileText))
}

function folderIcon() {
  return h(NIcon, { size: 14, color: 'var(--app-primary)' }, () => h(Folder))
}

function moduleProgress(docs: DocMeta[], statuses: Record<string, string>): number {
  if (!docs.length) return 0
  const known = docs.filter((d) => statuses[d.id] === 'known').length
  return Math.round((known / docs.length) * 100)
}

function buildMiscNode(entry: MiscEntry, parentKey: string): DocTreeOption {
  const key = `${parentKey}/${entry.name}`
  if (entry.type === 'dir') {
    return {
      key,
      label: entry.name,
      isLeaf: false,
      prefix: () => folderIcon(),
      children: (entry.children ?? []).map((c) => buildMiscNode(c, key)),
    }
  }
  return {
    key,
    label: entry.name,
    isLeaf: true,
    prefix: docIcon,
    miscEntry: entry,
  }
}

export function buildTreeData(
  domain: DomainTree,
  statuses: Record<string, string>,
): DocTreeOption[] {
  const nodes: DocTreeOption[] = []

  // Root-level docs (README, roadmap, memory, etc.)
  for (const doc of domain.docs) {
    nodes.push({
      key: doc.id,
      label: doc.frontmatter.title || doc.path.split('/').pop() || doc.id,
      isLeaf: true,
      docMeta: doc,
      domainSlug: domain.slug,
      prefix: docIcon,
    })
  }

  // Module folders
  for (const mod of domain.modules) {
    const pct = moduleProgress(mod.docs, statuses)
    const pctLabel = pct > 0 ? ` (${pct}%)` : ''

    const regularDocs = mod.docs.filter((d) => d.frontmatter.type !== 'lesson')
    const lessonDocs = mod.docs.filter((d) => d.frontmatter.type === 'lesson')

    const docNode = (doc: DocMeta): DocTreeOption => ({
      key: doc.id,
      label: doc.frontmatter.title || doc.path.split('/').pop() || doc.id,
      isLeaf: true,
      docMeta: doc,
      domainSlug: domain.slug,
      moduleSlug: mod.slug,
      prefix: docIcon,
    })

    const children: DocTreeOption[] = regularDocs.map(docNode)

    if (lessonDocs.length) {
      children.push({
        key: `${domain.slug}/${mod.slug}/lessons`,
        label: 'lessons',
        isLeaf: false,
        prefix: () => folderIcon(),
        children: lessonDocs.map(docNode),
      })
    }

    nodes.push({
      key: `${domain.slug}/${mod.slug}`,
      label: mod.slug + pctLabel,
      isLeaf: false,
      children,
      domainSlug: domain.slug,
      moduleSlug: mod.slug,
      prefix: () => folderIcon(),
    })
  }

  // Notes folder (stub)
  if (domain.notes?.length) {
    nodes.push({
      key: `${domain.slug}/notes`,
      label: 'notes',
      isLeaf: false,
      prefix: () => h(NIcon, { size: 14, color: 'var(--app-primary)' }, () => h(StickyNote)),
      children: domain.notes.map((n) => ({
        key: n.id,
        label: n.frontmatter.title || n.id,
        isLeaf: true,
        prefix: docIcon,
        noteMeta: n,
        domainSlug: domain.slug,
      })),
    })
  }

  // Misc folder
  if (domain.misc?.length) {
    nodes.push({
      key: `${domain.slug}/misc`,
      label: 'misc',
      isLeaf: false,
      prefix: () => h(NIcon, { size: 14, color: 'var(--app-primary)' }, () => h(Package)),
      children: domain.misc.map((e) => buildMiscNode(e, `${domain.slug}/misc`)),
    })
  }

  return nodes
}
