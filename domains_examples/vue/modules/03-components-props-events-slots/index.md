---
id: vue.components-props-events-slots.index
type: index
title: "Модуль 03 — Компоненты: props, события, слоты"
tags: [vue, components, props, emits, slots]
status: todo
updated: 2026-09-08
---

# Модуль 03 — Компоненты: props, события, слоты

> Реальный интерфейс не пишут одним гигантским SFC. Его собирают из компонентов —
> переиспользуемых блоков с чётким контрактом: что им передают (**props**), о чём они
> сообщают наружу (**события/emits**), и куда родитель может вставить свою разметку
> (**слоты**). Это модуль про контракты между компонентами.

## Цель

После модуля ты:

1. Создаёшь дочерние компоненты и подключаешь их в родителя.
2. Объявляешь типизированные **props** через `defineProps<T>()` и понимаешь правило
   «props идут вниз и неизменяемы» (one-way data flow).
3. Сообщаешь наверх через типизированные **события** (`defineEmits`) и строишь `v-model`
   на компоненте.
4. Принимаешь чужую разметку через **слоты** (default, named, scoped).
5. Прокидываешь данные сквозь дерево через **provide/inject** и знаешь lifecycle-хуки.
6. Понимаешь fallthrough-атрибуты (`$attrs`), `defineExpose` и умеешь применять встроенные
   компоненты **`Teleport`**, **`Transition`**, **`KeepAlive`**.
7. Можешь **прочитать** компонент в стиле Options API (легаси) и объяснить, почему
   индустрия перешла на Composition API.

## Предпосылки

- [`02-sfc-templates-styling`](../02-sfc-templates-styling/index.md) — SFC, директивы,
  `v-model` на элементах.

## Структура

- [`theory.md`](./theory.md) — props, emits, `v-model` на компоненте, `$attrs`/`defineExpose`,
  слоты, provide/inject, встроенные компоненты, lifecycle, обзор Options API.
- [`cards.md`](./cards.md) — карточки.
- [`drills.md`](./drills.md) — упражнения.
- [`lessons/01-todo-item-component.md`](./lessons/01-todo-item-component.md) — выносим пункт
  списка дел в компонент с props и событиями.
- [`lessons/02-slots-and-provide.md`](./lessons/02-slots-and-provide.md) — переиспользуемая
  карточка через слоты и общая тема через provide/inject.

## Порядок прохождения

1. `theory.md`.
2. Уроки `lessons/01-...`, затем `lessons/02-...`.
3. `drills.md` + карточки.
