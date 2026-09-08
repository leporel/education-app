# CLAUDE.md — vue

Domain-specific instructions. Loaded after the root `CLAUDE.md` at the start of every
session in this domain. Keep it short and factual.

## Goal

Take the learner from zero Vue to building real Vue 3 single-page applications on their
own — confidently using reactivity, the component model, routing, and state management,
and understanding *why* the framework is shaped the way it is. Emphasis on mental models
and trade-offs, not syntax recall.

## Starting level

Experienced programmer with a strong **Go** background who has **already completed the
`typescript` domain** in this workspace. Comfortable with TypeScript (types, generics,
`interface`/`type`, structural typing, async/await), the npm ecosystem, and the
JavaScript runtime. **New to** Vue specifically and to frontend/SPA frameworks in
general (declarative UI, reactivity, component lifecycles, client-side routing).

Freeze this — progress goes into `memory.md`, not here.

## Methodology

- **Why-first.** Each feature is introduced with the problem it solves (and what manual
  alternative it replaces), then the trade-off it carries — never as an isolated rule.
- **Double anchor.** Compare to **Go** (no reactivity → you'd re-render by hand; CSP
  goroutines vs the single-threaded UI loop; interfaces vs prop contracts) *and* to the
  already-learned **TypeScript** (every example is TS + `<script setup>`; typed
  `defineProps`, `defineEmits`, typed stores).
- **Composition API first.** Teach Composition API + `<script setup>` as the default
  style. Options API gets one short "how to read legacy code" section, not parallel
  coverage.
- **Runnable examples.** Prefer small SFCs the learner can drop into a `npm create vue@latest`
  project and run. Show Vue's dev warnings/errors before the fix.
- **Pitfalls explicitly.** Name the classic footguns (losing reactivity on destructure,
  `ref` vs `reactive`, forgetting `.value`, mutating props, missing `:key`, watchers vs
  `computed`) and how to avoid them. Each module ends with a "типичные ошибки" section.
- **Drill over passive reading.** Each module ends with `drill` blocks; SRS on `cards`.

## Preferred sources / authors

Real, verifiable references only:
- **Vue.js docs** — vuejs.org/guide (canonical; Composition API as default).
- **Vue.js API reference** — vuejs.org/api.
- **Pinia docs** — pinia.vuejs.org (state management).
- **Vue Router docs** — router.vuejs.org.
- **Vue Test Utils** — test-utils.vuejs.org; **Vitest** — vitest.dev.
- **Vite** — vite.dev. **Evan You / Vue School / VueConf** talks for direction (Vapor Mode).

## Explanation style

- Content in **Russian**; code, identifiers, template syntax and warnings stay in English.
- **Engaging, not dry.** Conversational tone, vivid analogies, light humor where it
  lands. Humor serves the point, never replaces it.
- Lead with intuition ("почему так"), then formalize.
- Show the Go and/or TS equivalent inline when it sharpens the contrast (`// Go: ...`,
  `// в TS-домене мы видели ...`).
- Show wrong code and Vue's resulting warning/behavior before the fix.
- Use **Vue 3.5+** stable API with `<script setup lang="ts">`, **Vite 7**, **Pinia 3**,
  **Vue Router 4**, **Vitest + Vue Test Utils**. Mention **Vapor Mode / 3.6** only as
  "where Vue is heading", not as the API being taught.

## Out of scope

- **Deep CSS / design systems.** Styling is covered just enough to be productive:
  `:class`/`:style` bindings, `<style scoped>`, and one Tailwind-integration section.
  No CSS-framework deep dives.
- **SSR / Nuxt / meta-frameworks.** Mention they exist; do not teach them here.
- **Backend.** Async data is fetched against a stub/`fetch`; no server is built.
- **Build-tool internals** (Rollup/Vite plugin authoring) — overview only.

## Optional folders

- `misc/` — reference files; link from theory/lessons via relative paths. Do not parse.
- `notes/` — user-owned `.md` notes managed by the UI. Do not write there unless asked.

## Links

- Memory: [`memory.md`](./memory.md)
- Roadmap: [`roadmap.md`](./roadmap.md)
- Index:   [`README.md`](./README.md)
