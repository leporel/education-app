---
id: typescript.advanced-types.index
type: index
title: "Модуль 06 — Продвинутые типы"
tags: [typescript, advanced-types]
status: todo
updated: 2026-09-08
---

# Модуль 06 — Продвинутые типы

> Здесь TypeScript показывает то, чего в Go нет и близко: **типы, которые вычисляются
> из других типов**. Система типов TS — это, по сути, маленький функциональный язык,
> работающий во время компиляции. Будет местами «вывих мозга», но именно это делает TS
> уникальным.

## Цель

После модуля ты:

1. Используешь операторы над типами: `keyof`, `typeof`, indexed access (`T[K]`).
2. Понимаешь и пишешь **mapped types** (преобразование всех свойств) и
   **conditional types** (`T extends U ? X : Y`).
3. Свободно применяешь встроенные **utility types**: `Partial`, `Required`, `Readonly`,
   `Pick`, `Omit`, `Record`, `Exclude`, `Extract`, `ReturnType`, `Awaited` и др.
4. Знаешь про **template literal types**, `as const` и оператор **`satisfies`**.
5. Понимаешь, **где остановиться** — когда «умный тип» приносит больше боли, чем пользы.

## Предпосылки

- [`05-generics`](../05-generics/index.md) — без дженериков продвинутые типы не понять.

## Структура

- [`theory.md`](./theory.md) — операторы типов, mapped/conditional, utility types.
- [`cards.md`](./cards.md) — карточки.
- [`drills.md`](./drills.md) — упражнения.
- [`lessons/01-utility-types.md`](./lessons/01-utility-types.md) — практика с
  utility-типами на реальной модели данных.

## Порядок прохождения

1. `theory.md` (читать не торопясь, экспериментируя в Playground).
2. Урок `lessons/01-utility-types.md`.
3. `drills.md` + карточки.
