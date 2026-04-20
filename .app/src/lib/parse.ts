import yaml from 'js-yaml'
import type { Card, Drill } from '@/api'

// Client-side parser — mirror of server/content.ts block extraction. Used by MdRender
// to replace fenced `card` / `drill` blocks with components.

const BLOCK_RE = /```(card|drill)\r?\n([\s\S]*?)\r?\n```/g

export interface ParsedBlock {
  kind: 'card' | 'drill'
  raw: string
  start: number
  end: number
  data: Card | Drill | null
}

export function parseBlocks(body: string, moduleId = 'unknown'): ParsedBlock[] {
  const out: ParsedBlock[] = []
  let i = 0
  for (const m of body.matchAll(BLOCK_RE)) {
    const kind = m[1] as 'card' | 'drill'
    const raw = m[2]
    const obj = (yaml.load(raw) ?? {}) as Record<string, unknown>
    const id = `inline#${kind}-${i++}`
    let data: Card | Drill | null = null
    if (kind === 'card' && typeof obj.front === 'string' && typeof obj.back === 'string') {
      data = {
        id,
        moduleId,
        front: obj.front,
        back: obj.back,
        hint: typeof obj.hint === 'string' ? obj.hint : undefined,
        tags: Array.isArray(obj.tags) ? (obj.tags as string[]) : undefined,
      }
    } else if (kind === 'drill' && typeof obj.prompt === 'string') {
      data = {
        id,
        moduleId,
        type: (obj.type as Drill['type']) ?? 'free-form',
        prompt: obj.prompt,
        answer: String(obj.answer ?? ''),
        options: Array.isArray(obj.options) ? (obj.options as string[]).map(String) : undefined,
        check: (obj.check as Drill['check']) ?? 'manual',
        hint: typeof obj.hint === 'string' ? obj.hint : undefined,
      }
    }
    out.push({ kind, raw, start: m.index ?? 0, end: (m.index ?? 0) + m[0].length, data })
  }
  return out
}

export function checkAnswer(drill: Drill, userAnswer: string): boolean {
  const given = userAnswer.trim()
  const expected = drill.answer.trim()
  switch (drill.check) {
    case 'exact':
      return given === expected
    case 'fuzzy': {
      const norm = (s: string) =>
        s.toLowerCase().replace(/[\p{P}\s]+/gu, '').trim()
      const variants = expected.split('|').map((v) => norm(v))
      return variants.includes(norm(given))
    }
    case 'regex':
      try {
        return new RegExp(expected).test(given)
      } catch {
        return false
      }
    case 'manual':
      return true // let user self-grade
  }
}
