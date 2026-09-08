---
id: rust.index
type: index
title: Rust
tags: [rust]
updated: 2026-09-08
---

# Rust

Учебный домен: от нуля до самостоятельного письма программ на Rust. Для человека с
сильным опытом **Go**, которому Rust нов. Упор на ментальные модели и «почему так
сделано», постоянные сравнения с Go, реальные сообщения компилятора и грабли. Главная
цель — чтобы **borrow checker стал напарником, а не врагом**.

Учим **стабильный Rust 1.96+, Edition 2024**; async — на **Tokio**.

## Файлы

- [`CLAUDE.md`](./CLAUDE.md) — инструкции для Claude по этому домену.
- [`memory.md`](./memory.md) — память: что выучено, слабости, рабочие приёмы.
- [`roadmap.md`](./roadmap.md) — план обучения.

## Модули

1. [`01-why-rust-and-setup`](./modules/01-why-rust-and-setup/index.md) — зачем Rust (safety без GC, zero-cost), `rustup`/`cargo`/Edition 2024, первая программа, Cargo vs `go mod`, крейты/модули/видимость (`mod`/`pub`/`use`), тесты (`#[test]`), тизер ownership.
2. [`02-ownership-and-moves`](./modules/02-ownership-and-moves/index.md) — владение, move-семантика, `Copy` vs `Move`, `Drop`/RAII, stack/heap, `clone`.
3. [`03-borrowing-and-lifetimes`](./modules/03-borrowing-and-lifetimes/index.md) — `&`/`&mut`, правила заёма, borrow checker, slices, lifetimes и `'a`, элизия.
4. [`04-types-structs-enums-pattern-matching`](./modules/04-types-structs-enums-pattern-matching/index.md) — типы, `struct`/`impl`, `enum`, `match`, `Option<T>` (нет `nil`), `if let`/`let else`.
5. [`05-error-handling`](./modules/05-error-handling/index.md) — `Result<T,E>`, оператор `?`, `panic!` vs возврат ошибки, свои ошибки, `thiserror`/`anyhow`.
6. [`06-traits-and-generics`](./modules/06-traits-and-generics/index.md) — трейты vs интерфейсы, дженерики + trait bounds, `dyn`, associated types, `derive`, static vs dynamic dispatch.
7. [`07-collections-iterators-closures`](./modules/07-collections-iterators-closures/index.md) — `Vec`/`HashMap`/`String`/`&str`, итераторы (ленивые, zero-cost), замыкания `Fn`/`FnMut`/`FnOnce`.
8. [`08-smart-pointers-and-interior-mutability`](./modules/08-smart-pointers-and-interior-mutability/index.md) — `Box`, `Rc`/`Arc`, `RefCell`/`Cell`, `Deref`, внутренняя изменяемость, `Rc<RefCell<T>>`, `Weak`.
9. [`09-concurrency-async-and-project`](./modules/09-concurrency-async-and-project/index.md) — потоки, `Send`/`Sync`, каналы, `Mutex`/`Arc`; `async`/`await`, `Future`, Tokio; сквозной проект (CLI + врезка axum).

## Как проходить

Строго по порядку. Модули **02–03 (ownership/borrowing/lifetimes)** — позвоночник всего
курса; не пропускать, даже если хочется быстрее «к трейтам и async». Внутри модуля:
`theory.md` → `lessons/` → `drills.md`, карточки `cards.md` держать в SRS параллельно.
Код запускать локально через `cargo` (поставь `rustup`) или в [Rust Playground](https://play.rust-lang.org).
Каждый раз, когда компилятор ругается — **читай ошибку целиком**: в Rust это половина обучения.
