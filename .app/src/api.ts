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

export interface DocMeta {
  id: string
  path: string
  frontmatter: Frontmatter
  cardCount?: number
  drillCount?: number
}

export interface Doc extends DocMeta {
  body: string
  cards: Card[]
  drills: Drill[]
}

export interface DomainSummary {
  total: number
  known: number
  learning: number
}

export interface ModuleTree {
  slug: string
  docs: DocMeta[]
}

export interface MiscEntry {
  name: string
  path: string
  type: 'file' | 'dir'
  size?: number
  mime?: string
  children?: MiscEntry[]
}

export interface NoteMeta {
  id: string
  path: string
  frontmatter: Frontmatter
}

export interface DomainTree {
  slug: string
  hidden: boolean
  summary: DomainSummary
  docs: DocMeta[]
  modules: ModuleTree[]
  misc: MiscEntry[]
  notes: NoteMeta[]
}

async function get<T>(url: string): Promise<T> {
  const r = await fetch(url)
  if (!r.ok) throw new Error(`${r.status} ${url}`)
  return (await r.json()) as T
}

async function post<T>(url: string, body: unknown): Promise<T> {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!r.ok) throw new Error(`${r.status} ${url}`)
  return (await r.json()) as T
}

export interface SearchHit {
  id: string
  path: string
  title: string
  type: string
  snippet: string
}

async function put<T>(url: string, body: string, contentType = 'text/markdown'): Promise<T> {
  const r = await fetch(url, {
    method: 'PUT',
    headers: { 'content-type': contentType },
    body,
  })
  if (!r.ok) throw new Error(`${r.status} ${url}`)
  return (await r.json()) as T
}

async function del<T>(url: string): Promise<T> {
  const r = await fetch(url, { method: 'DELETE' })
  if (!r.ok) throw new Error(`${r.status} ${url}`)
  return (await r.json()) as T
}

function rawPath(path: string): string {
  return `/raw/${path.split('/').map(encodeURIComponent).join('/')}`
}

export const api = {
  tree: () => get<DomainTree[]>('/api/tree'),
  doc: (id: string) => get<Doc>(`/api/doc?id=${encodeURIComponent(id)}`),
  raw: (path: string) => fetch(rawPath(path)).then((r) => r.text()),
  rawUrl: (path: string) => rawPath(path),
  saveRaw: (path: string, content: string) => put<{ ok: true }>(rawPath(path), content),
  createNote: (domain: string, slug: string, title: string, body?: string) =>
    post<{ ok: true; id: string; path: string }>('/api/notes', { domain, slug, title, body }),
  deleteNote: (id: string) => del<{ ok: true }>(`/api/notes?id=${encodeURIComponent(id)}`),
  cards: (moduleId?: string) =>
    get<Card[]>(`/api/cards${moduleId ? `?module=${encodeURIComponent(moduleId)}` : ''}`),
  drills: (moduleId?: string) =>
    get<Drill[]>(`/api/drills${moduleId ? `?module=${encodeURIComponent(moduleId)}` : ''}`),
  due: () => get<Array<Card & { srs: { due: number; interval: number; reps: number } }>>('/api/srs/due'),
  review: (cardId: string, grade: number) =>
    post<{ due: number; interval: number; reps: number }>('/api/srs/review', { cardId, grade }),
  setStatus: (docId: string, state: 'todo' | 'learning' | 'known') =>
    post<{ ok: true }>('/api/status', { docId, state }),
  statuses: () => get<Record<string, 'todo' | 'learning' | 'known'>>('/api/status'),
  search: (q: string, domain?: string) =>
    get<SearchHit[]>(`/api/search?q=${encodeURIComponent(q)}${domain ? `&domain=${encodeURIComponent(domain)}` : ''}`),
  openInExplorer: (path: string) => post<{ ok: true }>('/api/open', { path }),
}
