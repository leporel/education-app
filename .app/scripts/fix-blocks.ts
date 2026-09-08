// Run: bun scripts/fix-blocks.ts [--dry] [path-prefix]
// Repairs fenced `card` / `drill` blocks whose plain YAML scalars break the parser
// (unquoted `: `, trailing `:`, ` #` comments, leading `*`/`&`/`[`/`{`...), and quotes
// front/back/prompt/answer values that YAML would otherwise read as numbers/booleans.
// Only blocks that fail to parse (or parse to a non-string where a string is required)
// are rewritten; everything else is left byte-for-byte intact.
import { readFile, writeFile } from 'node:fs/promises'
import { relative, sep } from 'node:path'
import yaml from 'js-yaml'
import { BLOCK_RE, ROOT, walkMd } from './lib/md'

const dry = process.argv.includes('--dry')
const prefix = process.argv.slice(2).find((a) => !a.startsWith('--')) ?? ''

// Keys whose value must be a string for the app; numbers/booleans get quoted.
const STRING_KEYS = new Set(['front', 'back', 'hint', 'prompt', 'answer'])

const KEY_LINE_RE = /^([A-Za-z_][\w-]*):(?:[ \t]+(.*))?$/
// `|`, `>`, `|-`, `>+2` … — a real block-scalar indicator has nothing else on the line.
const BLOCK_SCALAR_RE = /^[|>][-+]?\d*$/

// A plain scalar needs quoting when YAML cannot parse it on its own (`a: b`, `*x`,
// `{{ }}`), when it silently becomes a non-string for a string-only key (`42`, `yes`),
// or when ` #` would be swallowed as a comment.
function needsQuotes(key: string, value: string): boolean {
  if (value === '' || BLOCK_SCALAR_RE.test(value)) return false
  const parsed = tryParseScalar(value)
  if (parsed === undefined) return true
  if (STRING_KEYS.has(key) && typeof parsed !== 'string') return true
  if (/^["']/.test(value)) return false // already a well-formed quoted string
  return value.includes(' #')
}

function quote(value: string): string {
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
}

/**
 * Rewrites the raw block so every scalar that YAML would misread is double-quoted.
 * Indented continuation lines of a plain scalar are folded into the quoted value,
 * mirroring how YAML itself would have joined them.
 */
function repairBlock(raw: string): string {
  const lines = raw.split('\n')
  const out: string[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    const m = line.match(KEY_LINE_RE)
    if (!m || m[2] === undefined) {
      out.push(line)
      i++
      continue
    }
    const key = m[1]
    const value = m[2]
    // Collect indented continuation lines that belong to this plain scalar.
    let j = i + 1
    const cont: string[] = []
    while (j < lines.length && /^\s+\S/.test(lines[j]) && !BLOCK_SCALAR_RE.test(value)) {
      cont.push(lines[j].trim())
      j++
    }
    const joined = cont.length ? [value, ...cont].join(' ') : value
    if (needsQuotes(key, joined)) {
      out.push(`${key}: ${quote(joined)}`)
      i = j
      continue
    }
    out.push(line)
    i++
  }
  return out.join('\n')
}

/** Returns the YAML value of a scalar, or `undefined` when it does not parse. */
function tryParseScalar(value: string): unknown {
  try {
    return yaml.load(value)
  } catch {
    return undefined
  }
}

function blockIsHealthy(raw: string, kind: string): boolean {
  let obj: Record<string, unknown> | null
  try {
    obj = yaml.load(raw) as Record<string, unknown> | null
  } catch {
    return false
  }
  if (!obj || typeof obj !== 'object') return false
  if (kind === 'card') return typeof obj.front === 'string' && typeof obj.back === 'string'
  return typeof obj.prompt === 'string' && obj.answer !== undefined
}

let touchedFiles = 0
let fixedBlocks = 0
let unfixable = 0

for (const abs of await walkMd(ROOT)) {
  const rel = relative(ROOT, abs).split(sep).join('/')
  if (prefix && !rel.startsWith(prefix)) continue
  const raw = await readFile(abs, 'utf8')
  let changed = false
  const next = raw.replace(BLOCK_RE, (whole, kind: string, body: string) => {
    if (blockIsHealthy(body, kind)) return whole
    const repaired = repairBlock(body)
    if (!blockIsHealthy(repaired, kind)) {
      unfixable++
      console.log(`✘ ${rel}: ${kind} block still invalid after repair:\n  ${body.split('\n').join('\n  ')}`)
      return whole
    }
    fixedBlocks++
    changed = true
    return whole.replace(body, repaired)
  })
  if (changed) {
    touchedFiles++
    if (!dry) await writeFile(abs, next, 'utf8')
  }
}

console.log(
  `\n${dry ? '(dry run) ' : ''}files touched: ${touchedFiles}, blocks fixed: ${fixedBlocks}, unfixable: ${unfixable}`,
)
process.exit(unfixable > 0 ? 1 : 0)
