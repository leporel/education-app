// Run: bun scripts/validate.ts
// Walks G:/PPP/Education and validates YAML frontmatter + every fenced `card`/`drill` block.
import { readdir, readFile } from 'node:fs/promises'
import { join, relative, sep } from 'node:path'
import yaml from 'js-yaml'

const ROOT = join(import.meta.dir, '..', '..')

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/
const BLOCK_RE = /```(card|drill)\r?\n([\s\S]*?)\r?\n```/g

let errors = 0
let files = 0
let blocks = 0

async function walk(dir: string, out: string[] = []): Promise<string[]> {
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return out
  }
  for (const e of entries) {
    if (e.name === 'node_modules' || e.name === 'dist' || e.name === '.app' || e.name === '.state')
      continue
    const full = join(dir, e.name)
    if (e.isDirectory()) await walk(full, out)
    else if (e.isFile() && e.name.endsWith('.md')) out.push(full)
  }
  return out
}

function report(relPath: string, label: string, err: unknown) {
  errors++
  const msg = err instanceof Error ? err.message : String(err)
  console.log(`\n✘ ${relPath} [${label}]`)
  console.log(`  ${msg.split('\n').join('\n  ')}`)
}

const mdFiles = await walk(ROOT)
for (const abs of mdFiles) {
  files++
  const rel = relative(ROOT, abs).split(sep).join('/')
  const raw = await readFile(abs, 'utf8')

  const m = raw.match(FRONTMATTER_RE)
  if (m) {
    try {
      const parsed = yaml.load(m[1])
      if (parsed && typeof parsed === 'object') {
        const fm = parsed as Record<string, unknown>
        for (const required of ['id', 'type', 'title']) {
          if (!(required in fm) && !rel.endsWith('CLAUDE.md')) {
            console.log(`⚠ ${rel}: frontmatter missing "${required}"`)
          }
        }
      }
    } catch (e) {
      report(rel, 'frontmatter', e)
    }
  }

  const body = m ? raw.slice(m[0].length) : raw
  let i = 0
  for (const bm of body.matchAll(BLOCK_RE)) {
    blocks++
    const kind = bm[1]
    try {
      const obj = yaml.load(bm[2]) as Record<string, unknown> | null
      if (!obj || typeof obj !== 'object') {
        report(rel, `${kind}#${i}`, new Error('block did not parse to an object'))
      } else if (kind === 'card') {
        if (typeof obj.front !== 'string' || typeof obj.back !== 'string')
          report(rel, `card#${i}`, new Error('card requires string front + back'))
      } else if (kind === 'drill') {
        if (typeof obj.prompt !== 'string')
          report(rel, `drill#${i}`, new Error('drill requires string prompt'))
        if (obj.answer === undefined)
          report(rel, `drill#${i}`, new Error('drill requires answer'))
      }
    } catch (e) {
      report(rel, `${kind}#${i}`, e)
    }
    i++
  }
}

console.log(
  `\n${errors === 0 ? '✓' : '✘'} files: ${files}, blocks: ${blocks}, errors: ${errors}`,
)
process.exit(errors > 0 ? 1 : 0)
