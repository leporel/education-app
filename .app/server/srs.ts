import { Database } from 'bun:sqlite'
import { join } from 'node:path'
import { mkdirSync } from 'node:fs'

// SRS using SM-2. State lives in ../../.state/progress.sqlite

const STATE_DIR = join(import.meta.dir, '..', '..', '.state')
mkdirSync(STATE_DIR, { recursive: true })
const DB_PATH = join(STATE_DIR, 'progress.sqlite')

export const db = new Database(DB_PATH, { create: true })

db.run(`CREATE TABLE IF NOT EXISTS srs (
  card_id    TEXT PRIMARY KEY,
  ease       REAL NOT NULL DEFAULT 2.5,
  interval   INTEGER NOT NULL DEFAULT 0,
  reps       INTEGER NOT NULL DEFAULT 0,
  due        INTEGER NOT NULL DEFAULT 0,
  last_grade INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL DEFAULT 0
)`)
db.run(`CREATE TABLE IF NOT EXISTS status (
  doc_id     TEXT PRIMARY KEY,
  state      TEXT NOT NULL,
  updated_at INTEGER NOT NULL DEFAULT 0
)`)

export interface SrsRow {
  card_id: string
  ease: number
  interval: number
  reps: number
  due: number
  last_grade: number
  updated_at: number
}

export function getRow(cardId: string): SrsRow | null {
  return db.query('SELECT * FROM srs WHERE card_id = ?').get(cardId) as SrsRow | null
}

export function dueCards(nowSec: number, limit = 100): SrsRow[] {
  return db
    .query('SELECT * FROM srs WHERE due <= ? ORDER BY due ASC LIMIT ?')
    .all(nowSec, limit) as SrsRow[]
}

// SM-2: grade in 0..5 (0–2 = fail, 3–5 = pass)
export function review(cardId: string, grade: number): SrsRow {
  const now = Math.floor(Date.now() / 1000)
  const prev = getRow(cardId) ?? {
    card_id: cardId,
    ease: 2.5,
    interval: 0,
    reps: 0,
    due: now,
    last_grade: 0,
    updated_at: now,
  }

  let { ease, interval, reps } = prev
  if (grade < 3) {
    reps = 0
    interval = 1
  } else {
    if (reps === 0) interval = 1
    else if (reps === 1) interval = 6
    else interval = Math.round(interval * ease)
    reps += 1
  }
  ease = Math.max(1.3, ease + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02)))
  const due = now + interval * 86400

  const row: SrsRow = {
    card_id: cardId,
    ease,
    interval,
    reps,
    due,
    last_grade: grade,
    updated_at: now,
  }

  db.query(
    `INSERT INTO srs (card_id, ease, interval, reps, due, last_grade, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(card_id) DO UPDATE SET
       ease=excluded.ease,
       interval=excluded.interval,
       reps=excluded.reps,
       due=excluded.due,
       last_grade=excluded.last_grade,
       updated_at=excluded.updated_at`,
  ).run(row.card_id, row.ease, row.interval, row.reps, row.due, row.last_grade, row.updated_at)

  return row
}

export function setStatus(docId: string, state: 'todo' | 'learning' | 'known'): void {
  const now = Math.floor(Date.now() / 1000)
  db.query(
    `INSERT INTO status (doc_id, state, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(doc_id) DO UPDATE SET state=excluded.state, updated_at=excluded.updated_at`,
  ).run(docId, state, now)
}

export function getStatuses(): Record<string, string> {
  const rows = db.query('SELECT doc_id, state FROM status').all() as Array<{
    doc_id: string
    state: string
  }>
  const out: Record<string, string> = {}
  for (const r of rows) out[r.doc_id] = r.state
  return out
}
