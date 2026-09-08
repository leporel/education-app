---
id: typescript.roadmap
type: roadmap
title: План обучения — typescript
tags: [typescript, roadmap]
updated: 2026-09-08
---

# План обучения

Упорядоченный план модулей. Статусы: `todo` / `in-progress` / `done`.
План — не догма: можно менять порядок, вставлять модули, резать лишние.

## Этап 1. Фундамент: язык под типами

- [ ] [`01-js-foundations`](./modules/01-js-foundations/index.md) — модель JavaScript,
      на которую ложится TS. Значения, объекты и массивы, деструктуризация и `...`,
      замыкания, `this`, прототипы, ошибки, модули. Два урока — **todo**.
- [ ] [`02-ts-why-and-setup`](./modules/02-ts-why-and-setup/index.md) — зачем TS,
      структурная типизация, стирание типов, установка/запуск, базовые типы — **todo**.

## Этап 2. Система типов вглубь

- [ ] [`03-functions-objects-interfaces`](./modules/03-functions-objects-interfaces/index.md)
      — функции, объекты, `interface` vs `type`, структурная типизация — **todo**.
- [ ] [`04-unions-narrowing`](./modules/04-unions-narrowing/index.md) — union-типы,
      дискриминированные union, сужение, `never` — **todo**.
- [ ] [`05-generics`](./modules/05-generics/index.md) — дженерики и ограничения,
      сравнение с Go — **todo**.
- [ ] [`06-advanced-types`](./modules/06-advanced-types/index.md) — `keyof`,
      mapped/conditional, utility-типы — **todo**.

## Этап 3. Структурирование кода

- [ ] [`07-classes-and-oop`](./modules/07-classes-and-oop/index.md) — классы и ООП,
      композиция vs наследование — **todo**.
- [ ] [`08-async`](./modules/08-async/index.md) — event loop, промисы, `async/await`,
      vs goroutines — **todo**.

## Этап 4. Реальный код

- [ ] [`09-modules-tooling-project`](./modules/09-modules-tooling-project/index.md) —
      модули, npm, тулинг, обзор тестовых раннеров, мини-проект — **todo**.

## Идеи на потом

- Тестирование на TS вглубь (Vitest: моки, фейковые таймеры, покрытие) — обзор уже есть
  в модуле 09.
- Валидация рантайм-данных (zod) — мост между «стёртыми» типами и реальными данными.
- Node.js-бэкенд: HTTP-сервер, работа с файлами (если захочется backend-трек).
- Мост к домену **Vue** — TS в компонентах.
