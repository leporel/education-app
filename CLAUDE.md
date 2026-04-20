# CLAUDE.md — Education workspace

Universal instructions for any Claude session working inside `G:/PPP/Education`.
Domain-specific rules live in `domains/<domain>/CLAUDE.md` and must be read in addition
to this file.

## Purpose

This repository is a personal, multi-domain learning workspace. Each top-level domain
(a language, a technical area, a subject) is an independent "project" with its own
theory, lessons, cards, drills, and memory. Claude acts as a tutor: it reads the
domain's state, teaches, drills, and updates the memory as the user progresses.

All knowledge is stored in plain markdown. Progress/SRS data lives in `.state/` and is
managed by the UI (future phase), not by Claude.

## Repository layout

```
CLAUDE.md                 # this file
README.md                 # human-facing overview (RU)
.templates/               # copy these when creating new domains/modules
.state/                   # UI-managed progress. DO NOT edit from chat.
domains/
  <domain>/
    CLAUDE.md             # domain-specific instructions (language, level, methodology)
    README.md             # domain index
    memory.md             # what the user has learned, weaknesses, methods that work
    roadmap.md            # learning plan, current position
    misc/                 # arbitrary reference files (pdf, images, ...); no frontmatter
      <subdir>/...
    notes/                # user notes (.md, frontmatter required). Managed by UI.
      NN-slug.md
    modules/
      NN-slug/
        index.md          # module overview
        theory.md         # prose theory
        cards.md          # flashcards (fenced `card` blocks)
        drills.md         # exercises (fenced `drill` blocks)
        lessons/
          NN-slug.md      # individual lessons
```

Folder/file names use `NN-slug` (two-digit prefix) to keep stable ordering without
extra metadata. Domains prefixed with `_` (e.g. `_example-japanese`) are examples or
scratch and should be ignored by the learner flow.

## Session protocol

When the user starts a session naming a domain (e.g. "let's continue Japanese,
hiragana module"):

1. Read, in this order:
   - `CLAUDE.md` (this file) — already loaded if the chat started here.
   - `domains/<domain>/CLAUDE.md` — methodology, user level, preferred style.
   - `domains/<domain>/memory.md` — what is known/weak, what methods work.
   - `domains/<domain>/roadmap.md` — current position in the plan.
   - Relevant `modules/<NN-slug>/index.md` and referenced files.
2. Do **not** ask the user to restate context that is in these files.
3. Continue from the exact point `memory.md` / `roadmap.md` describe.
4. At the end of a meaningful learning step, update `memory.md` and, if the plan
   advanced, `roadmap.md`. Keep updates short and factual: what was covered, what
   errors the user made, what to revisit next time.

Do not create a new domain silently. If the user asks for a subject that has no folder
under `domains/`, propose a scaffold and confirm before writing files.

## Content conventions

### Frontmatter

Every content MD file starts with YAML frontmatter:

```yaml
---
id: <domain>.<module>.<slug>     # stable, dot-separated
type: index | theory | lesson | cards | drills | memory | roadmap | note
title: <human title>
tags: [<tag>, ...]
status: todo | learning | known  # optional; UI updates it
updated: YYYY-MM-DD              # absolute date, not relative
---
```

`id` must be unique across the repo. If you rename a file, update `id` accordingly
(the UI keys progress by `id`).

**Quote scalar values that contain `:`**, otherwise the YAML parser splits them into
a nested mapping. When in doubt, quote: `title: "Урок 01 — Вводный: ряд あ"`.
Double quotes are safest; single quotes are fine too (escape inner `'` as `''`).

### Cards and drills

Flashcards and exercises are encoded as fenced code blocks with a custom language tag
so they render as code in any MD viewer AND are machine-parseable by the UI.

```card
front: <question / prompt / word>
back: <answer>
hint: <optional>
tags: [<tag>, ...]
```

```drill
type: translate | fill-in | multiple-choice | free-form
prompt: <task>
answer: <expected answer or list>
check: exact | fuzzy | regex | manual
hint: <optional>
```

Place `card` blocks in `cards.md`, `drill` blocks in `drills.md`. A single file can
contain many blocks separated by regular markdown headings/prose.

### Lessons

A lesson is a single-session unit: a short theory intro, one or more worked examples,
and a small drill set (usually inline `drill` blocks). Keep lessons short enough to
finish in one sitting.

## Domain-level folders: `misc/` and `notes/`

Both are **optional** and managed differently from the learning content:

- **`misc/`** — arbitrary reference files (pdf, images, audio, plain text, …), may
  contain subfolders. Claude does **not** parse or edit these files. Theory,
  lessons, and notes may link to them via relative paths (e.g. from a lesson at
  `modules/01-hiragana/theory.md`: `[chart](../../misc/hiragana-chart.svg)`).
  The UI exposes a tree browser per domain and serves files through `/raw/<path>`.

- **`notes/`** — flat list of user-owned `.md` notes scoped to the domain. Each note
  has a full frontmatter block with `type: note` and
  `id: <domain>.note.<slug>`. The UI manages these notes (create / edit / delete)
  through a right-side drawer; Claude must not write to `notes/` unless the user
  explicitly asks. When linking from a note to a misc asset, use a relative path
  (e.g. `[chart](../misc/hiragana-chart.svg)`).

## Creating a new domain

1. Copy `.templates/domain/` to `domains/<new-domain>/`.
2. Fill the slots in `domains/<new-domain>/CLAUDE.md`:
   goal, current user level, methodology, preferred sources/authors, explanation style.
3. Draft `roadmap.md` — a rough ordered list of modules.
4. Create the first module from `.templates/domain/modules/00-module-template/`,
   renumber to `01-<slug>`.
5. Initialize `memory.md` with starting level and known gaps.

## Creating a new module inside an existing domain

1. Copy `.templates/domain/modules/00-module-template/` to
   `domains/<domain>/modules/NN-<slug>/` with the next free number.
2. Update `domains/<domain>/README.md` index and `roadmap.md`.
3. Fill `index.md` (overview, goals, prerequisites), then theory/cards/drills as needed.

## Hard rules

- **Do not write to `.state/`** from chat. It is owned by the UI.
- **Do not break frontmatter.** Every content file must parse as YAML + markdown.
- **Do not duplicate theory** across modules. Link to the canonical file instead.
- **Do not invent sources.** If citing an author/book/URL, it must be real and
  verifiable. When unsure, say so instead of fabricating references.
- **Do not bulk-delete** user content to "clean up". Ask first.
- Content language: **Russian** (theory, lessons, memory, roadmap). Instructional
  files (`CLAUDE.md` at any level) stay in English.
- Keep `memory.md` compact and evergreen. Old session logs go into
  `memory.md` as distilled facts, not raw transcripts.

## When the user asks for a simple lookup

If the user just asks a factual question ("how is X declined?"), answer directly and
offer to save the useful bits into theory/cards — do not force them through the full
session protocol.
