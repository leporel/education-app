---
id: vue.composables-and-patterns.index
type: index
title: "Модуль 04 — Composables и паттерны переиспользования"
tags: [vue, composables, patterns]
status: todo
updated: 2026-09-08
---

# Модуль 04 — Composables и паттерны переиспользования

> Компоненты переиспользуют **разметку**. А как переиспользовать **логику** — счётчик,
> подписку на событие окна, загрузку данных — между разными компонентами? Ответ Vue:
> вынести её в функцию-composable. Это та самая причина, по которой вообще придумали
> Composition API.

## Цель

После модуля ты:

1. Пишешь свой composable (`useX`) — функцию, инкапсулирующую реактивное состояние и
   логику, и переиспользуешь её в нескольких компонентах.
2. Понимаешь, почему каждый вызов composable создаёт **независимый** экземпляр состояния,
   и в чём отличие от состояния на уровне модуля (синглтон).
3. Работаешь с `template refs` (доступ к реальному DOM-элементу) и понимаешь, когда это
   оправдано.
4. Применяешь watchers осознанно: `immediate`, `deep`, очистка эффектов, остановка.
5. Знаешь паттерны: composable vs provide/inject vs стор; сравнение с React-хуками и
   Vue-миксинами.
6. Помнишь правило синхронного вызова `useX()` и то, что composable отдаёт наружу
   (`ref`/`computed`/`readonly`), а не `reactive`.

## Предпосылки

- [`01-reactivity-and-mental-model`](../01-reactivity-and-mental-model/index.md) — `ref`,
  `computed`, `watch`.
- [`03-components-props-events-slots`](../03-components-props-events-slots/index.md) —
  lifecycle-хуки, provide/inject.

## Структура

- [`theory.md`](./theory.md) — анатомия composable, экземпляры vs синглтон, template refs,
  watchers глубже, паттерны.
- [`cards.md`](./cards.md) — карточки.
- [`drills.md`](./drills.md) — упражнения.
- [`lessons/01-use-composables.md`](./lessons/01-use-composables.md) — пишем `useMouse`,
  `useLocalStorage` и переиспользуем их.

## Порядок прохождения

1. `theory.md`.
2. Урок `lessons/01-use-composables.md`.
3. `drills.md` + карточки.
