---
id: vue.state-pinia.index
type: index
title: "Модуль 06 — Общее состояние (Pinia)"
tags: [vue, pinia, state]
status: todo
updated: 2026-09-08
---

# Модуль 06 — Общее состояние (Pinia)

> props/emits хороши для соседних компонентов, provide/inject — для контекста поддерева.
> Но когда одно и то же состояние (корзина, текущий пользователь, токен) нужно
> **отовсюду** — пора в стор. Официальный стор Vue — **Pinia**.

## Цель

После модуля ты:

1. Понимаешь, какую проблему решает стор и чем он лучше «ref на уровне модуля».
2. Создаёшь стор в **setup-стиле** (рекомендуемый) и узнаёшь **options-стиль**.
3. Раскладываешь состояние по `state` / `getters` / `actions` и типизируешь их.
4. Используешь стор в компонентах, корректно деструктурируешь через `storeToRefs`.
5. Знаешь, когда стор оправдан, а когда хватает composable/provide-inject, и как Pinia
   дружит с devtools.
6. Владеешь служебным API (`$patch`, `$subscribe`, свой `reset`) и не наступаешь на
   «стор вызван до установки Pinia».

## Предпосылки

- [`01-reactivity-and-mental-model`](../01-reactivity-and-mental-model/index.md) — `ref`,
  `computed`.
- [`04-composables-and-patterns`](../04-composables-and-patterns/index.md) — синглтон на
  модуле как «бедный стор».

## Структура

- [`theory.md`](./theory.md) — зачем стор, setup vs options, state/getters/actions,
  storeToRefs, когда брать стор.
- [`cards.md`](./cards.md) — карточки.
- [`drills.md`](./drills.md) — упражнения.
- [`lessons/01-cart-store.md`](./lessons/01-cart-store.md) — стор корзины и его
  использование в компонентах.

## Порядок прохождения

1. `theory.md`.
2. Урок `lessons/01-cart-store.md`.
3. `drills.md` + карточки.
