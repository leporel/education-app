---
id: typescript.unions-narrowing.index
type: index
title: "Модуль 04 — Union-типы, сужение и дискриминированные union"
tags: [typescript, unions, narrowing]
status: todo
updated: 2026-09-08
---

# Модуль 04 — Union-типы, сужение и дискриминированные union

> Вот тут начинается то, ради чего многие и любят TypeScript — и чего по-настоящему
> не хватает в Go. Возможность сказать «эта штука — либо A, либо B, либо C» и заставить
> компилятор следить, чтобы ты обработал все случаи.

## Цель

После модуля ты:

1. Используешь **union** (`A | B`) и **intersection** (`A & B`) типы.
2. Применяешь **литеральные типы** (`"GET" | "POST"`) для точных контрактов.
3. Строишь **дискриминированные (tagged) union** — типобезопасную замену «вариантному»
   моделированию, которого в Go нет.
4. Владеешь **сужением типов** (narrowing): `typeof`, `instanceof`, `in`,
   `Array.isArray`, проверка на `null`, пользовательские type guards и функции-утверждения
   — и знаешь, **где сужение теряется**.
5. Используешь `never` для **проверки исчерпанности** `switch`.

## Предпосылки

- [`03-functions-objects-interfaces`](../03-functions-objects-interfaces/index.md).

## Структура

- [`theory.md`](./theory.md) — union/intersection, литералы, сужение, дискриминанты.
- [`cards.md`](./cards.md) — карточки.
- [`drills.md`](./drills.md) — упражнения.
- [`lessons/01-narrowing.md`](./lessons/01-narrowing.md) — сужение типов на практике.
- [`lessons/02-discriminated-unions.md`](./lessons/02-discriminated-unions.md) —
  моделируем состояние дискриминированными union.

## Порядок прохождения

1. `theory.md`.
2. Урок `lessons/01-narrowing.md` → урок `lessons/02-discriminated-unions.md`.
3. `drills.md` + карточки.
