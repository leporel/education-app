---
id: rust.concurrency-async-and-project.index
type: index
title: "Модуль 09 — Конкурентность, async и сквозной проект"
tags: [rust, concurrency, threads, async, tokio, project]
status: todo
updated: 2026-09-08
---

# Модуль 09 — Конкурентность, async и сквозной проект

> Финал. Здесь всё сходится: владение (модуль 02) и `Arc`/`Mutex` (модуль 08) дают
> «бесстрашную конкурентность» — гонки данных невозможны на компиляции. А `async`/`await`
> + Tokio — масштабируемый I/O без потока на задачу. Для Go-разработчика это самый
> контрастный модуль: горутины «бесплатны и встроены», в Rust — потоки с проверкой
> владения и async с **внешним** рантаймом. Завершаем сквозным мини-проектом.

## Цель

После модуля ты:

1. Запускаешь потоки (`thread::spawn`), делишь данные через `Arc<Mutex<T>>`, общаешься
   каналами (`mpsc`), и понимаешь роль трейтов **`Send`/`Sync`**.
2. Понимаешь, **почему** Rust зовёт это «fearless concurrency»: borrow checker ловит гонки
   данных на компиляции.
3. Понимаешь модель `async`/`await`: `Future` ленив, нужен **рантайм** (Tokio), и чем это
   отличается от goroutines.
4. Различаешь конкурентность (`tokio::join!`, `select!`) и параллелизм (потоки/`spawn`),
   знаешь про «не блокируй executor», про отмену задачи через drop и про то, что дедлоки
   Rust не ловит.
5. Знаешь инструменты синхронизации помимо `Mutex`: `thread::scope`, `RwLock`, атомики — и
   понимаешь, почему `lock()` возвращает `Result` (отравление).
6. Собираешь сквозной проект — **concurrent CLI** (`clap` + `anyhow`) — и видишь врезку с
   **axum + tokio** как «async в проде».

## Предпосылки

- Модуль 08 (`Arc` — потокобезопасный `Rc`; `Mutex` — это `RefCell` для потоков).
- Модуль 07 (замыкания и `move` — потоки/задачи берут `move`-замыкания).
- Модуль 05 (`Result`/`?`, `anyhow` — для CLI).

## Структура

- [`theory.md`](./theory.md) — потоки, Send/Sync, каналы, Mutex; async/await, Future, Tokio.
- [`cards.md`](./cards.md) — карточки.
- [`drills.md`](./drills.md) — упражнения.
- [`lessons/01-threads-and-channels.md`](./lessons/01-threads-and-channels.md) — потоки,
  `Arc<Mutex>`, каналы; сравнение с goroutines/CSP.
- [`lessons/02-async-and-capstone.md`](./lessons/02-async-and-capstone.md) — async с Tokio,
  сквозной CLI-проект и врезка про axum.

## Порядок прохождения

1. `theory.md`.
2. Урок `lessons/01-threads-and-channels.md`.
3. Урок `lessons/02-async-and-capstone.md`.
4. `drills.md` + карточки.
