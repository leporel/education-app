import { join } from 'node:path'
import { readFile, stat, unlink, writeFile, mkdir, readdir } from 'node:fs/promises'
import { scan, flatten, CONTENT_ROOT, guessMime, type DomainNode, type Doc } from './content'
import { dueCards, review, setStatus, getStatuses } from './srs'
import { getEmbeddedAsset, getEmbeddedIndex, EMBEDDED_FILE_COUNT } from './embedded-dist'

const PORT = Number(process.env.EDU_PORT ?? 5174)
const DIST_DIR = join(import.meta.dir, '..', 'dist')
const IS_COMPILED = EMBEDDED_FILE_COUNT > 0
const AUTO_OPEN = IS_COMPILED || process.env.EDU_OPEN === '1'

// simple in-memory cache; re-scan on demand or if mtime of domains/ root changes
let cache: { domains: DomainNode[]; flat: Doc[]; at: number } | null = null

async function ensureScan(force = false) {
  if (!force && cache && Date.now() - cache.at < 2000) return cache
  const domains = await scan()
  const flat = flatten(domains)
  cache = { domains, flat, at: Date.now() }
  return cache
}

function json(data: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(data), {
    headers: { 'content-type': 'application/json; charset=utf-8' },
    ...init,
  })
}

function notFound(msg = 'not found') {
  return json({ error: msg }, { status: 404 })
}

async function serveStatic(pathname: string): Promise<Response> {
  const rel = pathname === '/' || pathname === '' ? '/index.html' : pathname

  // Compiled binary path: serve from embedded table.
  if (IS_COMPILED) {
    const a = getEmbeddedAsset(rel) ?? getEmbeddedIndex()
    if (!a) return new Response('embedded SPA missing', { status: 500 })
    return new Response(a.bytes as unknown as BodyInit, { headers: { 'content-type': a.mime } })
  }

  // Dev / non-compiled prod: read from dist/ on disk.
  const abs = join(DIST_DIR, rel)
  try {
    const s = await stat(abs)
    if (s.isFile()) return new Response(Bun.file(abs))
  } catch {
    /* fall through */
  }
  try {
    return new Response(Bun.file(join(DIST_DIR, 'index.html')))
  } catch {
    return new Response('SPA not built. Run `bun run build`.', { status: 404 })
  }
}

function openInBrowser(url: string) {
  try {
    const platform = process.platform
    if (platform === 'win32') {
      // `start` is a cmd builtin; empty "" is the window title arg.
      Bun.spawn({ cmd: ['cmd', '/c', 'start', '""', url], stdout: 'ignore', stderr: 'ignore' })
    } else if (platform === 'darwin') {
      Bun.spawn({ cmd: ['open', url], stdout: 'ignore', stderr: 'ignore' })
    } else {
      Bun.spawn({ cmd: ['xdg-open', url], stdout: 'ignore', stderr: 'ignore' })
    }
  } catch (e) {
    console.warn(`[server] failed to open browser: ${(e as Error).message}`)
  }
}

function summarizeDomain(d: DomainNode, statuses: Record<string, string>) {
  let total = 0
  let known = 0
  let learning = 0
  const count = (doc: Doc) => {
    if (doc.frontmatter.type === 'index' || doc.frontmatter.type === 'memory' || doc.frontmatter.type === 'roadmap')
      return
    total += 1
    const state = statuses[doc.id] ?? doc.frontmatter.status ?? 'todo'
    if (state === 'known') known += 1
    else if (state === 'learning') learning += 1
  }
  for (const doc of d.docs) count(doc)
  for (const m of d.modules) for (const doc of m.docs) count(doc)
  return { total, known, learning }
}

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url)
    const { pathname } = url

    if (pathname === '/api/tree') {
      const { domains } = await ensureScan()
      const statuses = getStatuses()
      return json(
        domains.map((d) => ({
          slug: d.slug,
          hidden: d.hidden,
          summary: summarizeDomain(d, statuses),
          docs: d.docs.map(({ id, path, frontmatter }) => ({ id, path, frontmatter })),
          modules: d.modules.map((m) => ({
            slug: m.slug,
            docs: m.docs.map(({ id, path, frontmatter, cards, drills }) => ({
              id,
              path,
              frontmatter,
              cardCount: cards.length,
              drillCount: drills.length,
            })),
          })),
          misc: d.misc,
          notes: d.notes.map(({ id, path, frontmatter }) => ({ id, path, frontmatter })),
        })),
      )
    }

    if (pathname === '/api/doc') {
      const id = url.searchParams.get('id')
      if (!id) return json({ error: 'id required' }, { status: 400 })
      const { flat } = await ensureScan()
      const doc = flat.find((d) => d.id === id)
      return doc ? json(doc) : notFound('doc')
    }

    if (pathname === '/api/cards') {
      const moduleSlug = url.searchParams.get('module') // domain.module
      const { flat } = await ensureScan()
      const cards = flat
        .filter((d) => !moduleSlug || d.cards[0]?.moduleId === moduleSlug)
        .flatMap((d) => d.cards)
      return json(cards)
    }

    if (pathname === '/api/drills') {
      const moduleSlug = url.searchParams.get('module')
      const { flat } = await ensureScan()
      const drills = flat
        .filter((d) => !moduleSlug || d.drills[0]?.moduleId === moduleSlug)
        .flatMap((d) => d.drills)
      return json(drills)
    }

    if (pathname === '/api/srs/due') {
      const { flat } = await ensureScan()
      const cardsById = new Map<string, (typeof flat)[number]['cards'][number]>()
      for (const doc of flat) for (const c of doc.cards) cardsById.set(c.id, c)
      const now = Math.floor(Date.now() / 1000)
      const rows = dueCards(now, 200)
      return json(
        rows
          .map((r) => {
            const c = cardsById.get(r.card_id)
            return c ? { ...c, srs: r } : null
          })
          .filter(Boolean),
      )
    }

    if (pathname === '/api/srs/review' && req.method === 'POST') {
      const body = (await req.json()) as { cardId?: string; grade?: number }
      if (!body.cardId || typeof body.grade !== 'number')
        return json({ error: 'cardId + grade required' }, { status: 400 })
      return json(review(body.cardId, body.grade))
    }

    if (pathname === '/api/status' && req.method === 'POST') {
      const body = (await req.json()) as {
        docId?: string
        state?: 'todo' | 'learning' | 'known'
      }
      if (!body.docId || !body.state) return json({ error: 'docId + state required' }, { status: 400 })
      setStatus(body.docId, body.state)
      return json({ ok: true })
    }

    if (pathname === '/api/status') {
      return json(getStatuses())
    }

    if (pathname === '/api/rescan') {
      await ensureScan(true)
      return json({ ok: true })
    }

    if (pathname === '/api/search') {
      const q = (url.searchParams.get('q') ?? '').trim().toLowerCase()
      const domainFilter = url.searchParams.get('domain')?.trim() ?? ''
      if (!q) return json([])
      const { flat } = await ensureScan()
      const hits = []
      for (const doc of flat) {
        if (domainFilter && !doc.path.startsWith(domainFilter + '/')) continue
        const hay = `${doc.frontmatter.title} ${(doc.frontmatter.tags ?? []).join(' ')} ${doc.body}`.toLowerCase()
        const pos = hay.indexOf(q)
        if (pos < 0) continue
        const start = Math.max(0, pos - 40)
        const end = Math.min(hay.length, pos + q.length + 60)
        const snippet = (pos > 0 ? '…' : '') + hay.slice(start, end).replace(/\s+/g, ' ') + (end < hay.length ? '…' : '')
        hits.push({
          id: doc.id,
          path: doc.path,
          title: doc.frontmatter.title,
          type: doc.frontmatter.type,
          snippet,
        })
        if (hits.length >= 50) break
      }
      return json(hits)
    }

    if (pathname === '/api/notes' && req.method === 'POST') {
      const body = (await req.json()) as {
        domain?: string
        slug?: string
        title?: string
        body?: string
      }
      if (!body.domain || !body.slug || !body.title)
        return json({ error: 'domain, slug, title required' }, { status: 400 })
      if (!/^[a-z0-9][a-z0-9-]*$/.test(body.slug))
        return json({ error: 'slug must match /^[a-z0-9][a-z0-9-]*$/' }, { status: 400 })
      const { domains } = await ensureScan()
      const d = domains.find((x) => x.slug === body.domain)
      if (!d) return json({ error: 'unknown domain' }, { status: 404 })
      const notesDir = join(CONTENT_ROOT, body.domain, 'notes')
      await mkdir(notesDir, { recursive: true })
      // find next free NN
      let existing: string[] = []
      try {
        existing = await readdir(notesDir)
      } catch {
        /* noop */
      }
      let nn = 1
      for (const name of existing) {
        const m = name.match(/^(\d{2})-/)
        if (m) nn = Math.max(nn, parseInt(m[1], 10) + 1)
      }
      const nnStr = String(nn).padStart(2, '0')
      const filename = `${nnStr}-${body.slug}.md`
      const abs = join(notesDir, filename)
      // collision check (slug duplicated ignoring NN)
      if (existing.some((n) => n.replace(/^\d{2}-/, '') === `${body.slug}.md`))
        return json({ error: 'slug already exists' }, { status: 409 })
      const id = `${body.domain}.note.${body.slug}`
      const today = new Date().toISOString().slice(0, 10)
      const fm = `---
id: ${id}
type: note
title: ${JSON.stringify(body.title)}
tags: []
updated: ${today}
---

`
      await writeFile(abs, fm + (body.body ?? ''), 'utf8')
      await ensureScan(true)
      return json({ ok: true, id, path: `${body.domain}/notes/${filename}` })
    }

    if (pathname === '/api/notes' && req.method === 'DELETE') {
      const id = url.searchParams.get('id')
      if (!id) return json({ error: 'id required' }, { status: 400 })
      const { domains } = await ensureScan()
      let target: { path: string } | null = null
      for (const d of domains) {
        const n = d.notes.find((x) => x.id === id)
        if (n) {
          target = { path: n.path }
          break
        }
      }
      if (!target) return notFound('note')
      const abs = join(CONTENT_ROOT, target.path)
      try {
        await unlink(abs)
      } catch (e) {
        return json({ error: (e as Error).message }, { status: 500 })
      }
      await ensureScan(true)
      return json({ ok: true })
    }

    if (pathname.startsWith('/raw/')) {
      const rel = decodeURIComponent(pathname.slice('/raw/'.length))
      if (rel.includes('..'))
        return json({ error: 'bad path' }, { status: 400 })
      const abs = join(CONTENT_ROOT, rel)
      if (req.method === 'PUT') {
        if (!rel.endsWith('.md'))
          return json({ error: 'PUT allowed only for .md files' }, { status: 400 })
        const body = await req.text()
        try {
          await stat(abs)
        } catch {
          return notFound('file')
        }
        await writeFile(abs, body, 'utf8')
        await ensureScan(true)
        return json({ ok: true })
      }
      try {
        const mime = guessMime(rel)
        if (mime.startsWith('text/') || mime === 'application/json' || mime === 'image/svg+xml') {
          const raw = await readFile(abs, 'utf8')
          return new Response(raw, { headers: { 'content-type': `${mime}; charset=utf-8` } })
        }
        const file = Bun.file(abs)
        if (!(await file.exists())) return notFound('file')
        return new Response(file, { headers: { 'content-type': mime } })
      } catch {
        return notFound('file')
      }
    }

    if (pathname === '/api/open' && req.method === 'POST') {
      const body = (await req.json()) as { path?: string }
      if (!body.path) return json({ error: 'path required' }, { status: 400 })
      // Resolve and validate — only allow paths inside CONTENT_ROOT
      const abs = join(CONTENT_ROOT, body.path)
      if (!abs.startsWith(CONTENT_ROOT)) return json({ error: 'forbidden' }, { status: 403 })
      try {
        await stat(abs)
      } catch {
        return notFound('path')
      }
      const platform = process.platform
      if (platform === 'win32') {
        Bun.spawn({ cmd: ['explorer', abs.replaceAll('/', '\\')], stdout: 'ignore', stderr: 'ignore' })
      } else if (platform === 'darwin') {
        Bun.spawn({ cmd: ['open', abs], stdout: 'ignore', stderr: 'ignore' })
      } else {
        Bun.spawn({ cmd: ['xdg-open', abs], stdout: 'ignore', stderr: 'ignore' })
      }
      return json({ ok: true })
    }

    // static SPA (production) — in dev, vite serves the SPA
    if (!pathname.startsWith('/api')) return serveStatic(pathname)
    return notFound()
  },
})

const origin = `http://localhost:${server.port}`
console.log(`[server] listening on ${origin}`)
console.log(`[server] content root: ${CONTENT_ROOT}`)
if (AUTO_OPEN) openInBrowser(origin)
