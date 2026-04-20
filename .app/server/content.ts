import { readdir, readFile, stat } from 'node:fs/promises'
import type { Dirent } from 'node:fs'
import { dirname, extname, join, relative, sep } from 'node:path'
import yaml from 'js-yaml'
import { EMBEDDED_FILE_COUNT } from './embedded-dist'

function resolveContentRoot(): string {
  const override = process.env.EDU_CONTENT_ROOT
  if (override && override.length > 0) return override
  // When running the compiled binary, import.meta.dir points inside the
  // virtual bundle — use the exe's sibling `domains/` instead.
  if (EMBEDDED_FILE_COUNT > 0) return join(dirname(process.execPath), 'domains')
  return join(import.meta.dir, '..', '..', 'domains')
}

export const CONTENT_ROOT = resolveContentRoot()

export interface Frontmatter {
  id: string
  type: string
  title: string
  tags?: string[]
  status?: 'todo' | 'learning' | 'known'
  updated?: string
  [k: string]: unknown
}

export interface Card {
  id: string
  moduleId: string
  front: string
  back: string
  hint?: string
  tags?: string[]
}

export interface Drill {
  id: string
  moduleId: string
  type: 'translate' | 'fill-in' | 'multiple-choice' | 'free-form'
  prompt: string
  answer: string
  options?: string[]
  check: 'exact' | 'fuzzy' | 'regex' | 'manual'
  hint?: string
}

export interface Doc {
  id: string
  path: string            // POSIX-style relative to domains/
  frontmatter: Frontmatter
  body: string            // markdown without frontmatter
  cards: Card[]
  drills: Drill[]
}

export interface ModuleNode {
  slug: string            // "01-hiragana"
  docs: Doc[]             // index, theory, cards, drills, lessons/*
}

export interface MiscEntry {
  name: string
  path: string            // POSIX, relative to domains/
  type: 'file' | 'dir'
  size?: number
  mime?: string
  children?: MiscEntry[]
}

export interface NoteDoc {
  id: string
  path: string            // "<domain>/notes/<slug>.md"
  frontmatter: Frontmatter
  body: string
}

export interface DomainNode {
  slug: string            // "_example-japanese"
  hidden: boolean         // slug starts with "_"
  docs: Doc[]             // README, memory, roadmap
  modules: ModuleNode[]
  misc: MiscEntry[]
  notes: NoteDoc[]
}

const MIME_BY_EXT: Record<string, string> = {
  '.md': 'text/markdown',
  '.txt': 'text/plain',
  '.json': 'application/json',
  '.csv': 'text/csv',
  '.html': 'text/html',
  '.htm': 'text/html',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.bmp': 'image/bmp',
  '.pdf': 'application/pdf',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
}

export function guessMime(filename: string): string {
  return MIME_BY_EXT[extname(filename).toLowerCase()] ?? 'application/octet-stream'
}

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/

function toPosix(p: string): string {
  return p.split(sep).join('/')
}

function parseFrontmatter(raw: string): { fm: Frontmatter; body: string } {
  const m = raw.match(FRONTMATTER_RE)
  if (!m) {
    return {
      fm: { id: '', type: 'unknown', title: '(no frontmatter)' },
      body: raw,
    }
  }
  const fm = (yaml.load(m[1]) ?? {}) as Frontmatter
  return { fm, body: raw.slice(m[0].length) }
}

const BLOCK_RE = /```(card|drill)\r?\n([\s\S]*?)\r?\n```/g

function extractBlocks(
  body: string,
  moduleId: string,
  docId: string,
): { cards: Card[]; drills: Drill[] } {
  const cards: Card[] = []
  const drills: Drill[] = []
  let i = 0
  for (const match of body.matchAll(BLOCK_RE)) {
    const kind = match[1]
    const raw = match[2]
    const obj = (yaml.load(raw) ?? {}) as Record<string, unknown>
    const localId = `${docId}#${kind}-${i++}`
    if (kind === 'card' && typeof obj.front === 'string' && typeof obj.back === 'string') {
      cards.push({
        id: localId,
        moduleId,
        front: obj.front,
        back: obj.back,
        hint: typeof obj.hint === 'string' ? obj.hint : undefined,
        tags: Array.isArray(obj.tags) ? (obj.tags as string[]) : undefined,
      })
    } else if (
      kind === 'drill' &&
      typeof obj.prompt === 'string' &&
      typeof obj.answer !== 'undefined'
    ) {
      drills.push({
        id: localId,
        moduleId,
        type: (obj.type as Drill['type']) ?? 'free-form',
        prompt: obj.prompt,
        answer: String(obj.answer),
        options: Array.isArray(obj.options) ? (obj.options as string[]).map(String) : undefined,
        check: (obj.check as Drill['check']) ?? 'manual',
        hint: typeof obj.hint === 'string' ? obj.hint : undefined,
      })
    }
  }
  return { cards, drills }
}

async function walkMd(dir: string): Promise<string[]> {
  const out: string[] = []
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return out
  }
  for (const ent of entries) {
    const full = join(dir, ent.name)
    if (ent.isDirectory()) out.push(...(await walkMd(full)))
    else if (ent.isFile() && ent.name.endsWith('.md')) out.push(full)
  }
  return out
}

async function readDoc(absPath: string, moduleId: string): Promise<Doc | null> {
  const raw = await readFile(absPath, 'utf8')
  const relFromContent = toPosix(relative(CONTENT_ROOT, absPath))
  let fm: Frontmatter
  let body: string
  try {
    const parsed = parseFrontmatter(raw)
    fm = parsed.fm
    body = parsed.body
  } catch (e) {
    console.warn(`[scan] bad frontmatter in ${relFromContent}: ${(e as Error).message}`)
    fm = { id: '', type: 'broken', title: `(битый frontmatter) ${relFromContent}` }
    body = raw
  }
  const docId = fm.id || relFromContent.replace(/\.md$/, '').replace(/\//g, '.')
  const { cards, drills } = extractBlocks(body, moduleId, docId)
  return {
    id: docId,
    path: relFromContent,
    frontmatter: { ...fm, id: docId },
    body,
    cards,
    drills,
  }
}

async function walkMisc(dir: string): Promise<MiscEntry[]> {
  let entries: Dirent[]
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return []
  }
  const out: MiscEntry[] = []
  for (const ent of entries) {
    if (ent.name.startsWith('.')) continue // skip dotfiles (.gitkeep, .DS_Store)
    const full = join(dir, ent.name)
    const rel = toPosix(relative(CONTENT_ROOT, full))
    if (ent.isDirectory()) {
      out.push({
        name: ent.name,
        path: rel,
        type: 'dir',
        children: await walkMisc(full),
      })
    } else if (ent.isFile()) {
      let size: number | undefined
      try {
        size = (await stat(full)).size
      } catch {
        /* noop */
      }
      out.push({
        name: ent.name,
        path: rel,
        type: 'file',
        size,
        mime: guessMime(ent.name),
      })
    }
  }
  out.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'dir' ? -1 : 1
    return a.name.localeCompare(b.name)
  })
  return out
}

async function readNotes(dir: string, domainSlug: string): Promise<NoteDoc[]> {
  let entries: Dirent[]
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return []
  }
  const out: NoteDoc[] = []
  for (const ent of entries) {
    if (!ent.isFile() || !ent.name.endsWith('.md') || ent.name.startsWith('.')) continue
    const full = join(dir, ent.name)
    try {
      const raw = await readFile(full, 'utf8')
      const relFromContent = toPosix(relative(CONTENT_ROOT, full))
      const { fm, body } = parseFrontmatter(raw)
      const slug = ent.name.replace(/\.md$/, '')
      const id = fm.id || `${domainSlug}.note.${slug}`
      out.push({
        id,
        path: relFromContent,
        frontmatter: { ...fm, id, type: fm.type || 'note' },
        body,
      })
    } catch (e) {
      console.warn(`[scan] bad note ${dir}/${ent.name}: ${(e as Error).message}`)
    }
  }
  out.sort((a, b) => a.path.localeCompare(b.path))
  return out
}

export async function scan(): Promise<DomainNode[]> {
  const domains: DomainNode[] = []
  let domainDirs: Dirent[]
  try {
    domainDirs = await readdir(CONTENT_ROOT, { withFileTypes: true })
  } catch {
    return []
  }
  for (const d of domainDirs) {
    if (!d.isDirectory()) continue
    const domainPath = join(CONTENT_ROOT, d.name)
    const domainRootDocs: Doc[] = []
    const modules: ModuleNode[] = []

    // domain-level docs (README.md, memory.md, roadmap.md)
    for (const name of ['README.md', 'memory.md', 'roadmap.md']) {
      try {
        const doc = await readDoc(join(domainPath, name), `${d.name}`)
        if (doc) domainRootDocs.push(doc)
      } catch (e) {
        console.warn(`[scan] failed ${d.name}/${name}: ${(e as Error).message}`)
      }
    }

    // modules
    const modulesDir = join(domainPath, 'modules')
    let moduleDirs: Dirent[]
    try {
      moduleDirs = await readdir(modulesDir, { withFileTypes: true })
    } catch {
      moduleDirs = []
    }
    for (const m of moduleDirs) {
      if (!m.isDirectory()) continue
      const moduleId = `${d.name}.${m.name}`
      const moduleDir = join(modulesDir, m.name)
      const mdFiles = await walkMd(moduleDir)
      const docs: Doc[] = []
      for (const f of mdFiles) {
        try {
          const doc = await readDoc(f, moduleId)
          if (doc) docs.push(doc)
        } catch (e) {
          console.warn(`[scan] failed ${f}: ${(e as Error).message}`)
        }
      }
      docs.sort((a, b) => a.path.localeCompare(b.path))
      modules.push({ slug: m.name, docs })
    }
    modules.sort((a, b) => a.slug.localeCompare(b.slug))

    const misc = await walkMisc(join(domainPath, 'misc'))
    const notes = await readNotes(join(domainPath, 'notes'), d.name)

    domains.push({
      slug: d.name,
      hidden: d.name.startsWith('_'),
      docs: domainRootDocs,
      modules,
      misc,
      notes,
    })
  }
  domains.sort((a, b) => a.slug.localeCompare(b.slug))
  return domains
}

export function flatten(domains: DomainNode[]): Doc[] {
  const out: Doc[] = []
  for (const d of domains) {
    out.push(...d.docs)
    for (const m of d.modules) out.push(...m.docs)
  }
  return out
}
