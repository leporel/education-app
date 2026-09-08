---
id: typescript.index
type: index
title: TypeScript
tags: [typescript]
updated: 2026-09-08
---

# TypeScript

Учебный домен: от нуля до самостоятельного письма на TypeScript. Для человека
с опытом Go, которому JavaScript/TS и его экосистема — новые. Упор на «почему так
сделано», постоянные сравнения с Go и реальные грабли.

## Файлы

- [`CLAUDE.md`](./CLAUDE.md) — инструкции для Claude по этому домену.
- [`memory.md`](./memory.md) — память: что выучено, слабости, рабочие приёмы.
- [`roadmap.md`](./roadmap.md) — план обучения.

## Модули

1. [`01-js-foundations`](./modules/01-js-foundations/index.md) — JavaScript под капотом TS: значения, типы, объекты и массивы, деструктуризация и `...`, замыкания, `this`, прототипы, ошибки, модули, event loop.
2. [`02-ts-why-and-setup`](./modules/02-ts-why-and-setup/index.md) — зачем нужен TS, структурная типизация, стирание типов, установка и запуск.
3. [`03-functions-objects-interfaces`](./modules/03-functions-objects-interfaces/index.md) — функции, объекты, `interface` vs `type`, структурная типизация на практике.
4. [`04-unions-narrowing`](./modules/04-unions-narrowing/index.md) — union-типы, литералы, дискриминированные union, сужение типов, `never`.
5. [`05-generics`](./modules/05-generics/index.md) — дженерики, ограничения, сравнение с дженериками Go.
6. [`06-advanced-types`](./modules/06-advanced-types/index.md) — `keyof`, mapped/conditional типы, utility-типы, типы на уровне типов.
7. [`07-classes-and-oop`](./modules/07-classes-and-oop/index.md) — классы, модификаторы, наследование vs композиция, отличие от Go.
8. [`08-async`](./modules/08-async/index.md) — event loop, промисы, `async/await`, сравнение с goroutines.
9. [`09-modules-tooling-project`](./modules/09-modules-tooling-project/index.md) — ESM, npm, тулинг, обзор тестовых раннеров и сборка мини-проекта end-to-end.

## Как проходить

По порядку. Внутри модуля: `theory.md` → `lessons/` → `drills.md`, карточки `cards.md`
держать в SRS параллельно. Модули 1–2 — фундамент, не пропускать, даже если хочется
сразу «к типам».

В конце `theory.md` каждого модуля есть **глоссарий** терминов — первое место, куда
смотреть, если встретилось незнакомое слово.
