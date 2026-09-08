---
id: vue.index
type: index
title: Vue
tags: [vue]
updated: 2026-09-08
---

# Vue

Учебный домен: от нуля до самостоятельного письма приложений на Vue 3. Для человека
с опытом Go, который **уже прошёл домен TypeScript**. Упор на ментальные модели и
«почему так сделано», постоянные сравнения с Go и TS, реальные грабли. Основной стиль —
**Composition API + `<script setup lang="ts">`**.

## Файлы

- [`CLAUDE.md`](./CLAUDE.md) — инструкции для Claude по этому домену.
- [`memory.md`](./memory.md) — память: что выучено, слабости, рабочие приёмы.
- [`roadmap.md`](./roadmap.md) — план обучения.

## Модули

1. [`01-reactivity-and-mental-model`](./modules/01-reactivity-and-mental-model/index.md) — что такое DOM/SPA, зачем фреймворк, декларативный рендеринг, реактивность (`ref`/`reactive`/`computed`/`watch`), Virtual DOM и `nextTick`, сигнальная модель под капотом.
2. [`02-sfc-templates-styling`](./modules/02-sfc-templates-styling/index.md) — устройство проекта и точка входа (`main.ts` → `mount`), Single File Components, `<script setup>`, директивы шаблона, `:class`/`:style`, scoped-стили, Tailwind, азы доступности.
3. [`03-components-props-events-slots`](./modules/03-components-props-events-slots/index.md) — компоненты, типизированные props/emits, `v-model`, `$attrs`/`defineExpose`, слоты, `provide`/`inject`, встроенные компоненты (`Teleport`/`Transition`/`KeepAlive`), lifecycle, обзор Options API.
4. [`04-composables-and-patterns`](./modules/04-composables-and-patterns/index.md) — composables, template refs, watchers глубже, паттерны переиспользования логики.
5. [`05-routing`](./modules/05-routing/index.md) — Vue Router 4: маршруты, динамика и вложенность, guards, lazy-loading, типизация.
6. [`06-state-pinia`](./modules/06-state-pinia/index.md) — Pinia 3: stores, state/getters/actions, типизация, devtools, когда нужен store.
7. [`07-async-tooling-testing-project`](./modules/07-async-tooling-testing-project/index.md) — async-данные и `Suspense`, формы, тулинг Vite, тесты Vitest + Vue Test Utils, сквозной мини-проект.

## Как проходить

По порядку. Внутри модуля: `theory.md` → `lessons/` → `drills.md`, карточки `cards.md`
держать в SRS параллельно. В конце `theory.md` каждого модуля есть **глоссарий** терминов —
первое место, куда смотреть при встрече с незнакомым словом. Модули 1–2 — фундамент (реактивность и шаблоны); не
пропускать, даже если хочется сразу «к компонентам и роутеру». Код запускать в проекте,
созданном через `npm create vue@latest` (Vue 3.5+, Vite 7, TS).
