---
id: rust.concurrency-async-and-project.lesson-02
type: lesson
title: "Урок 02 — Async с Tokio и сквозной проект (CLI + врезка axum)"
tags: [rust, async, tokio, clap, axum, capstone, lesson]
status: todo
updated: 2026-06-26
---

# Урок 02 — Async с Tokio и сквозной проект

Цель: понять async на работающем примере, собрать сквозной **concurrent CLI** на
`clap` + `anyhow` + Tokio, и увидеть врезкой, как тот же async раскрывается в HTTP-сервисе
на **axum**. Это финал курса — здесь сходятся владение, ошибки, трейты, `Arc` и async.

## Разогрев

- Почему `Future` ничего не делает без `.await`/рантайма?
- `join!` против `await` подряд — в чём разница?
- Что нельзя делать внутри async-функции?

## Шаг 1. Первый async с Tokio

Проект: `cargo new fetcher`, затем `cargo add tokio --features full`. Минимальный пример:

```rust
use std::time::Duration;

// имитируем сетевой запрос: ждём асинхронно, не блокируя поток
async fn fetch(id: u32) -> u32 {
    tokio::time::sleep(Duration::from_millis(200)).await;   // уступаем на await
    id * 10
}

#[tokio::main]                          // разворачивает main в запуск Tokio-рантайма
async fn main() {
    let a = fetch(1).await;             // последовательно: ждём 200мс
    let b = fetch(2).await;             // ещё 200мс — итого ~400мс
    println!("{a} {b}");
}
```

`#[tokio::main]` — это макрос: он создаёт рантайм и запускает в нём `async main`. Без
рантайма `async fn` не исполнить — `Future` ленив.

## Шаг 2. Конкурентность: ждём всё разом

Два `.await` подряд — последовательны (~400мс). Чтобы оба запроса шли **одновременно** (и
уложиться в ~200мс), используем `join!`:

```rust
#[tokio::main]
async fn main() {
    let (a, b) = tokio::join!(fetch(1), fetch(2));   // обе futures конкурентно
    println!("{a} {b}");                              // ~200мс вместо ~400
}
```

А для целого списка id — конкурентно собрать все результаты:

```rust
async fn fetch_all(ids: Vec<u32>) -> Vec<u32> {
    let futures = ids.into_iter().map(fetch);     // итератор futures (ленивы!)
    futures::future::join_all(futures).await       // ждём все разом (нужен крейт futures)
    // (в реальном коде для ограничения параллелизма берут tokio::spawn + буфер/семафор)
}
```

> Тонкость для Go-разработчика: `ids.map(fetch)` создаёт futures, но **не запускает** их —
> запуск на `join_all(...).await`. Если бы ты в Go написал цикл с `go fetch(id)`, горутины
> поехали бы сразу. Здесь явный момент старта — на `await`.

## Шаг 3. Сквозной проект — concurrent CLI

Соберём утилиту `fetcher`: принимает список id аргументами, конкурентно «забирает» их и
печатает сумму. Зависимости: `cargo add clap --features derive`, `cargo add anyhow`,
`cargo add tokio --features full`, `cargo add futures`.

```rust
use anyhow::{Context, Result};
use clap::Parser;
use std::time::Duration;

/// Конкурентно «забирает» значения по id и печатает их и сумму.
#[derive(Parser)]               // clap derive: разбор аргументов из структуры
#[command(name = "fetcher", version)]
struct Args {
    /// id для обработки (одно или несколько)
    #[arg(required = true)]
    ids: Vec<u32>,

    /// задержка имитации запроса, мс
    #[arg(long, default_value_t = 200)]
    delay_ms: u64,
}

async fn fetch(id: u32, delay_ms: u64) -> Result<u32> {
    tokio::time::sleep(Duration::from_millis(delay_ms)).await;
    if id == 0 {
        anyhow::bail!("id 0 недопустим");      // ранний выход с ошибкой (как return Err)
    }
    Ok(id * 10)
}

#[tokio::main]
async fn main() -> Result<()> {               // ? прямо в main благодаря anyhow::Result
    let args = Args::parse();                  // clap сам распарсит/проверит/покажет --help

    // запускаем все задачи конкурентно через tokio::spawn
    let mut handles = Vec::new();
    for id in args.ids {
        handles.push(tokio::spawn(fetch(id, args.delay_ms)));   // задача в рантайм
    }

    let mut total = 0;
    for h in handles {
        // h.await → Result<Result<u32>>: внешний — паника задачи, внутренний — наша ошибка
        let value = h.await.context("задача упала")??;          // два ?: разворачиваем оба
        total += value;
    }

    println!("сумма: {total}");
    Ok(())
}
```

Что здесь сошлось из всего курса:
- **`clap` derive** строит парсер из структуры `Args` (типобезопасно; `--help`/`--version`
  бесплатно). Не доверяем вводу — `clap` валидирует типы (`Vec<u32>` отвергнет не-число).
- **`anyhow::Result` + `?`** (модуль 05): ошибки пробрасываются, `main` вернёт ненулевой код.
- **`tokio::spawn`** раздаёт задачи рантайму — они бегут конкурентно; `h.await` собирает.
- **Двойной `?`** на `h.await.context(...)??`: внешний `Result` — «не паниковала ли задача»,
  внутренний — наш `Result<u32>` из `fetch`.
- **Владение** (модуль 02): `fetch(id, ...)` забирает `id` (`Copy`), задачи независимы.

Запуск:

```bash
cargo run -- 1 2 3            # сумма: 60  (все три конкурентно, ~200мс)
cargo run -- 0               # Error: задача упала ... id 0 недопустим  (код выхода != 0)
cargo run -- --help          # clap печатает справку
```

## Шаг 4. Намеренно ошибёмся — блокировка executor'а

Заменим async-sleep на блокирующий — и «убьём» конкурентность:

```rust
async fn fetch(id: u32, delay_ms: u64) -> Result<u32> {
    std::thread::sleep(Duration::from_millis(delay_ms));   // ❌ блокирует поток executor'а
    Ok(id * 10)
}
```

Код скомпилируется и даже даст верный результат, но задачи перестанут перекрываться: каждый
`thread::sleep` морозит поток рантайма, и три «запроса» пойдут фактически последовательно
(или упрутся в число потоков пула). Симптом — пропал выигрыш по времени. Правильно —
`tokio::time::sleep(...).await` (уступает) или, для настоящей CPU-работы,
`tokio::task::spawn_blocking(|| heavy())`. Это главный async-грабль; в Go о нём не думаешь,
тут — на тебе.

## Шаг 5. Врезка — где async раскрывается в проде: axum

CLI показал механику; по-настоящему async сияет в сетевых сервисах, где тысячи соединений
**ждут** одновременно. Тот же Tokio + `axum` (web-фреймворк поверх него): `cargo add axum`,
`cargo add tokio --features full`.

```rust
use axum::{routing::get, Router, extract::Path};

async fn fetch_handler(Path(id): Path<u32>) -> String {
    // каждый запрос — отдельная async-задача; пока один ждёт I/O, рантайм крутит другие
    tokio::time::sleep(std::time::Duration::from_millis(50)).await;
    format!("value = {}", id * 10)
}

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/", get(|| async { "ok" }))
        .route("/fetch/{id}", get(fetch_handler));   // типизированный path-параметр u32

    let listener = tokio::net::TcpListener::bind("127.0.0.1:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();        // обслуживаем, не блокируя на каждом
}
```

Идея: каждый входящий запрос — async-задача; на `.await` (ожидание БД/сети) поток
освобождается под другие запросы. Один-два потока рантайма обслуживают тысячи одновременных
соединений — то, ради чего async вообще придуман. Это ровно тот сервер, что в Go ты бы
написал на горутинах (`http.HandleFunc` + `go`); здесь та же масштабируемость, но с
ленивыми futures и явным рантаймом. Глубже web (роутинг, состояние, БД, тесты) — отдельный
трек, см. roadmap «Идеи на потом».

## Mini-drill

```drill
type: multiple-choice
prompt: "В CLI tokio::spawn(fetch(id)) на список id вместо fetch(id).await в цикле. Зачем?"
options: ["Чтобы код был короче", "Чтобы задачи бежали конкурентно (spawn отдаёт их рантайму), а не последовательно", "spawn обязателен для async", "Чтобы избежать ошибок типов"]
answer: "Чтобы задачи бежали конкурентно (spawn отдаёт их рантайму), а не последовательно"
check: exact
hint: await в цикле = по очереди.
```

```drill
type: free-form
prompt: "В async-обработчике axum случайно вызвали std::fs::read (блокирующее чтение) на каждый запрос. Чем это грозит и как исправить?"
answer: "Блокирующий вызов морозит поток executor'а, и пока он читает, другие запросы на этом потоке не обслуживаются — пропускная способность падает. Исправление: tokio::fs::read(...).await (async-вариант) или tokio::task::spawn_blocking для блокирующей работы."
check: manual
hint: Не блокируй executor.
```

```drill
type: free-form
prompt: "Зачем в main используется fn main() -> anyhow::Result<()> вместе с #[tokio::main]?"
answer: "anyhow::Result<()> позволяет применять ? прямо в main для проброса ошибок (и печати + ненулевого кода выхода при Err), а #[tokio::main] разворачивает async main в запуск Tokio-рантайма. Вместе — удобный async-вход с обработкой ошибок."
check: manual
```

## Итог курса

Ты прошёл путь от «зачем Rust» до конкурентного приложения. Async замкнул всё: **владение**
решает, что переедет в задачу (`move`); **`Send`/`Sync`** гарантируют безопасность задач;
**`Result`/`?`** и `anyhow` несут ошибки; **трейты** (`Parser` из clap, `Future`) задают
контракты; **`Arc`** делит состояние. Главные мысли на вынос: `Future` ленив и требует
рантайма (Tokio), async ≠ параллелизм, и «не блокируй executor». Borrow checker из врага
стал напарником — он же и сделал твою конкурентность бесстрашной. Дальше — настоящие
проекты: возьми CLI и расширь его реальным I/O, или загляни в web-трек из roadmap.
