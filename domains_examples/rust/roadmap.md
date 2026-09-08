---
id: rust.roadmap
type: roadmap
title: План обучения — rust
tags: [rust, roadmap]
updated: 2026-09-08
---

# План обучения

Упорядоченный план модулей. Статусы: `todo` / `in-progress` / `done`.
План — не догма: можно менять порядок, вставлять модули, резать лишние.

Базис: ученик — опытный **Go**-разработчик, Rust нов. Единственный якорь сравнений — Go.
Учим стабильный **Rust 1.96+, Edition 2024**; async — на **Tokio**.

## Этап 1. Вход и позвоночник языка

- [ ] [`01-why-rust-and-setup`](./modules/01-why-rust-and-setup/index.md)
      — зачем Rust (safety без GC, zero-cost), `rustup`/`cargo`/Edition 2024, первая
      программа, `cargo new/run/build/test/check`, Cargo vs `go mod`, крейты/модули и
      видимость (`mod`/`pub`/`use`), тесты (`#[cfg(test)]`/`#[test]`), тизер ownership — **todo**.
- [ ] [`02-ownership-and-moves`](./modules/02-ownership-and-moves/index.md)
      — владение, move-семантика, `Copy` vs `Move`, `Drop`/RAII, stack/heap, `clone`,
      сравнение с GC и копированием структур в Go — **todo**.
- [ ] [`03-borrowing-and-lifetimes`](./modules/03-borrowing-and-lifetimes/index.md)
      — `&`/`&mut`, правила заёма (один `&mut` ИЛИ много `&`), borrow checker, slices,
      lifetimes `'a`, элизия; читаем реальные сообщения borrow checker — **todo**.

## Этап 2. Типы и обработка ошибок

- [ ] [`04-types-structs-enums-pattern-matching`](./modules/04-types-structs-enums-pattern-matching/index.md)
      — скаляры/кортежи/массивы, `struct`/`impl`, `enum`, `match` (исчерпываемость),
      `Option<T>` вместо `nil`, `if let` / `let else` — **todo**.
- [ ] [`05-error-handling`](./modules/05-error-handling/index.md)
      — `Result<T,E>`, оператор `?`, `panic!` vs возврат ошибки, `Option`↔`Result`,
      свои ошибки, `thiserror`/`anyhow`; против `if err != nil` — **todo**.

## Этап 3. Абстракции

- [ ] [`06-traits-and-generics`](./modules/06-traits-and-generics/index.md)
      — трейты vs интерфейсы Go, `impl Trait`, дженерики + trait bounds, `where`,
      trait objects `dyn`, associated types, `derive`, static vs dynamic dispatch — **todo**.
- [ ] [`07-collections-iterators-closures`](./modules/07-collections-iterators-closures/index.md)
      — `Vec`/`HashMap`/`String`/`&str`, итераторы (ленивость, адаптеры, zero-cost),
      замыкания `Fn`/`FnMut`/`FnOnce` — **todo**.
- [ ] [`08-smart-pointers-and-interior-mutability`](./modules/08-smart-pointers-and-interior-mutability/index.md)
      — `Box`, `Rc`/`Arc`, `RefCell`/`Cell`, `Deref`, внутренняя изменяемость,
      паттерн `Rc<RefCell<T>>`, `Weak` и циклы ссылок — **todo**.

## Этап 4. Конкурентность и реальный проект

- [ ] [`09-concurrency-async-and-project`](./modules/09-concurrency-async-and-project/index.md)
      — потоки, `Send`/`Sync`, каналы, `Mutex`/`Arc`; `async`/`await`, `Future`, Tokio,
      выбор рантайма; сквозной капстоун — concurrent **CLI** (`clap` + `anyhow`/`thiserror`)
      + врезка **axum + tokio** как «async в проде»; против goroutines/CSP — **todo**.

## Идеи на потом

- `unsafe` и FFI вглубь, The Rustonomicon — отдельным треком (сейчас только обзорная секция).
- Макросы: `macro_rules!` вглубь и proc-macros (derive своими руками).
- `no_std` / embedded (Embassy) — если захочется bare-metal/микроконтроллеры.
- Веб-бэкенд по-настоящему: axum/SQLx/sea-orm, слои, тесты — отдельный домен.
- Мост к будущим доменам: Rust-сервис + общий контракт с Go; сравнить эргономику и перф.
- Продвинутые трейты: GAT, типажи-маркеры, `Pin`/`Unpin`, ручная реализация `Future`.
