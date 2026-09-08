// Shared helpers for content maintenance scripts (validate, fix-blocks).
import { readdir } from 'node:fs/promises'
import { join } from 'node:path'

export const ROOT = join(import.meta.dir, '..', '..', '..')

export const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/
export const BLOCK_RE = /```(card|drill)\r?\n([\s\S]*?)\r?\n```/g

const SKIP_DIRS = new Set(['node_modules', 'dist', '.app', '.state'])

/** Recursively collects every `.md` under `dir`, skipping tooling/state folders. */
export async function walkMd(dir: string, out: string[] = []): Promise<string[]> {
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return out
  }
  for (const e of entries) {
    if (SKIP_DIRS.has(e.name)) continue
    const full = join(dir, e.name)
    if (e.isDirectory()) await walkMd(full, out)
    else if (e.isFile() && e.name.endsWith('.md')) out.push(full)
  }
  return out
}
