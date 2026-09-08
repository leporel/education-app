---
id: vue.async-tooling-testing-project.index
type: index
title: "Модуль 07 — Async-данные, тулинг, тесты, проект"
tags: [vue, async, vite, testing, project]
status: todo
updated: 2026-09-08
---

# Модуль 07 — Async-данные, тулинг, тесты, проект

> Финальный модуль связывает всё: подтянуть данные с сервера и аккуратно показать
> состояния загрузки/ошибки, понять тулинг Vite, написать первый тест на Vue Test Utils +
> Vitest, и собрать сквозной мини-проект из реактивности, компонентов, роутера и стора.

## Цель

После модуля ты:

1. Грузишь async-данные и корректно отображаешь `loading` / `error` / `data`; знаешь про
   `Suspense` и `async setup`.
2. Понимаешь устройство проекта `npm create vue@latest`: Vite, dev/build/preview,
   переменные окружения, алиас `@`, проверку типов через `vue-tsc` и линтинг
   `eslint-plugin-vue`.
3. Пишешь компонентный тест на **Vitest + Vue Test Utils**: монтируешь компонент,
   проверяешь рендер, эмулируешь клик/ввод, проверяешь событие.
4. Собираешь капстоун-проект, в котором сходятся все предыдущие модули.

## Предпосылки

- Все предыдущие модули (01–06): реактивность, SFC, компоненты, composables, router, Pinia.
- Из TS-домена — `async/await`, Promise, обработка ошибок.

## Структура

- [`theory.md`](./theory.md) — async-данные и `Suspense`, формы, тулинг Vite, тестирование.
- [`cards.md`](./cards.md) — карточки.
- [`drills.md`](./drills.md) — упражнения.
- [`lessons/01-async-data.md`](./lessons/01-async-data.md) — `useFetch`-composable со
  состояниями загрузки/ошибки и отменой гонок.
- [`lessons/02-capstone-and-test.md`](./lessons/02-capstone-and-test.md) — сборка
  мини-проекта и первый компонентный тест.

## Порядок прохождения

1. `theory.md`.
2. Уроки `lessons/01-async-data.md`, затем `lessons/02-capstone-and-test.md`.
3. `drills.md` + карточки.
