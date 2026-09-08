---
id: typescript.async.index
type: index
title: "Модуль 08 — Асинхронность"
tags: [typescript, async, promises]
status: todo
updated: 2026-09-08
---

# Модуль 08 — Асинхронность

> Здесь контраст с Go максимальный. В Go ты пишешь блокирующий код в горутинах, и
> рантайм творит магию параллелизма. В JS — один поток, event loop и промисы. Понять
> эту разницу — значит понять, почему фронтенд устроен именно так.

## Цель

После модуля ты:

1. Глубоко понимаешь **event loop**: микро- и макрозадачи, почему `async` ≠ потоки.
2. Уверенно работаешь с **Promise**: создание, `.then/.catch`, состояния.
3. Пишешь и читаешь **async/await**, корректно обрабатываешь ошибки (`try/catch`).
4. Используешь комбинаторы: `Promise.all`, `allSettled`, `race`, `any`.
5. Понимаешь, как «параллелить» запросы в однопоточной модели и где грабли
   (floating promises, последовательное вместо параллельного).
6. Умеешь сходить в сеть через `fetch` (и знаешь, почему 404 — «успех») и **отменять**
   операции через `AbortController` — JS-аналог `context.Context`.

## Предпосылки

- [`01-js-foundations`](../01-js-foundations/index.md) — event loop (введение),
- [`04-unions-narrowing`](../04-unions-narrowing/index.md) — для типобезопасных
  результатов.

## Структура

- [`theory.md`](./theory.md) — event loop, промисы, async/await, комбинаторы.
- [`cards.md`](./cards.md) — карточки.
- [`drills.md`](./drills.md) — упражнения.
- [`lessons/01-promises-and-await.md`](./lessons/01-promises-and-await.md) — от
  колбэков к `async/await`.
- [`lessons/02-concurrency-patterns.md`](./lessons/02-concurrency-patterns.md) —
  параллельные запросы, комбинаторы, сравнение с goroutines.

## Порядок прохождения

1. `theory.md`.
2. Урок `01-promises-and-await.md` → урок `02-concurrency-patterns.md`.
3. `drills.md` + карточки.
