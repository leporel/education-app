---
id: vue.roadmap
type: roadmap
title: План обучения — vue
tags: [vue, roadmap]
updated: 2026-09-08
---

# План обучения

Упорядоченный план модулей. Статусы: `todo` / `in-progress` / `done`.
План — не догма: можно менять порядок, вставлять модули, резать лишние.

Базис: ученик уже прошёл домен **TypeScript**. Все примеры — на TS + `<script setup>`.
Основной стиль — **Composition API**; Options API даётся обзорно (чтение легаси).

## Этап 1. Ментальная модель и шаблоны

- [ ] [`01-reactivity-and-mental-model`](./modules/01-reactivity-and-mental-model/index.md)
      — введение в DOM/SPA, зачем фреймворк, декларативный рендер vs ручной DOM,
      `ref`/`reactive`/`computed`/`watch`/`watchEffect`, Virtual DOM и `nextTick`,
      сигнальная модель под капотом, грабли реактивности — **todo**.
- [ ] [`02-sfc-templates-styling`](./modules/02-sfc-templates-styling/index.md)
      — устройство проекта и точка входа, Single File Components, `<script setup>`,
      директивы шаблона, `:class`/`:style`, `<style scoped>`, интеграция Tailwind,
      азы доступности — **todo**.

## Этап 2. Компоненты

- [ ] [`03-components-props-events-slots`](./modules/03-components-props-events-slots/index.md)
      — компоненты, типизированные `defineProps`/`defineEmits`, `v-model`, `$attrs`,
      слоты, `provide`/`inject`, встроенные компоненты (`Teleport`/`Transition`/`KeepAlive`),
      lifecycle; обзор Options API — **todo**.
- [ ] [`04-composables-and-patterns`](./modules/04-composables-and-patterns/index.md)
      — composables (`use*`), template refs, watchers глубже, паттерны DI,
      грабли модульного состояния — **todo**.

## Этап 3. Приложение

- [ ] [`05-routing`](./modules/05-routing/index.md) — Vue Router 4: маршруты,
      динамические/вложенные, navigation guards, lazy-loading, типизация — **todo**.
- [ ] [`06-state-pinia`](./modules/06-state-pinia/index.md) — Pinia 3: stores,
      state/getters/actions, типизация, devtools; store vs provide/inject — **todo**.

## Этап 4. Реальное приложение

- [ ] [`07-async-tooling-testing-project`](./modules/07-async-tooling-testing-project/index.md)
      — async-данные и `Suspense`, формы кратко, тулинг Vite, тесты Vitest + Vue Test
      Utils, сборка, сквозной мини-проект — **todo**.

## Идеи на потом

- Глубокий слой стилизации/UI-китов (Naive UI, PrimeVue) — отдельным треком.
- SSR / Nuxt — если захочется meta-framework.
- **Vapor Mode** (Vue 3.6+) детально, когда стабилизируется: переписать узкие места
  капстоуна на Vapor и сравнить бандл/перфоманс.
- Продвинутые тесты: компонентные тесты в браузере (Vitest browser mode), e2e (Playwright).
- Мост к будущим доменам: Vue + бэкенд на Go (общий контракт типов).
