---
id: rust.traits-and-generics.index
type: index
title: "Модуль 06 — Трейты и дженерики"
tags: [rust, traits, generics, dyn, bounds]
status: todo
updated: 2026-09-08
---

# Модуль 06 — Трейты и дженерики

> Здесь Go-разработчик встретит знакомца — интерфейсы — и узнает, что Rust-трейты делают
> почти то же, но мощнее и с другим выбором по умолчанию. Главное открытие: трейт можно
> реализовать для **чужого** типа, дженерики **мономорфизируются** (zero-cost), а выбор
> между статической и динамической диспетчеризацией — твой и явный (`impl Trait` vs `dyn`).

## Цель

После модуля ты:

1. Объявляешь трейты и реализуешь их (`impl Trait for Type`), понимаешь связь с интерфейсами Go.
2. Пишешь обобщённые функции и типы с **trait bounds** (`T: Display`) и блоком `where`.
3. Различаешь **статическую** диспетчеризацию (дженерики/`impl Trait`, мономорфизация) и
   **динамическую** (`dyn Trait`, vtable), и осознанно выбираешь.
4. Используешь `derive` для стандартных трейтов (`Debug`, `Clone`, `PartialEq`, ...).
5. Понимаешь associated types и стандартные трейты (`Display`, `From`, `Iterator`) как
   «грамматику» библиотеки; умеешь написать свой `Display` и свой `From`.
6. Параметризуешь типами не только функции, но и структуры/`enum`/`impl`-блоки (включая
   `impl` под конкретный `T`).
7. Знаешь, почему `PartialEq`/`PartialOrd` «частичные», и что из этого следует для `f64`.

## Предпосылки

- Модули 04–05 (`enum`, `Option`/`Result` — они и есть дженерик-типы с трейтами).

## Структура

- [`theory.md`](./theory.md) — трейты, реализации, дженерики, bounds, dyn vs impl Trait, derive.
- [`cards.md`](./cards.md) — карточки.
- [`drills.md`](./drills.md) — упражнения.
- [`lessons/01-traits-and-bounds.md`](./lessons/01-traits-and-bounds.md) — свой трейт,
  реализации, обобщённая функция с bound.
- [`lessons/02-static-vs-dynamic-dispatch.md`](./lessons/02-static-vs-dynamic-dispatch.md)
  — `impl Trait` vs `Box<dyn Trait>`, когда что.

## Порядок прохождения

1. `theory.md`.
2. Урок `lessons/01-traits-and-bounds.md`.
3. Урок `lessons/02-static-vs-dynamic-dispatch.md`.
4. `drills.md` + карточки.
