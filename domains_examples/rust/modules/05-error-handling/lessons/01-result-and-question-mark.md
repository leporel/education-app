---
id: rust.error-handling.lesson-01
type: lesson
title: "Урок 01 — Result, оператор ? и свой тип ошибки"
tags: [rust, result, question-mark, thiserror, lesson]
status: todo
updated: 2026-06-26
---

# Урок 01 — Result, оператор ? и свой тип ошибки

Цель: написать функцию, которая читает и парсит данные, пробрасывая разные ошибки через
`?`; завести свой тип ошибки; почувствовать разницу с Go-ритуалом `if err != nil`.

## Разогрев

- Что делает `?` на `Ok` и на `Err`?
- Где `Result`, а где `panic!`?
- Зачем `thiserror`/`anyhow`?

## Шаг 1. Парсинг с `?` и стандартной ошибкой

Распарсим число из строки. `str::parse` возвращает `Result<i32, ParseIntError>`:

```rust
fn parse_age(s: &str) -> Result<i32, std::num::ParseIntError> {
    let age = s.trim().parse::<i32>()?;   // Err(ParseIntError) пробросится
    Ok(age)
}

fn main() {
    println!("{:?}", parse_age("42"));    // Ok(42)
    println!("{:?}", parse_age("oops"));  // Err(ParseIntError { kind: InvalidDigit })
}
```

Сравни с Go:

```go
// Go — тот же смысл, больше ритуала
func parseAge(s string) (int, error) {
    n, err := strconv.Atoi(strings.TrimSpace(s))
    if err != nil {
        return 0, err
    }
    return n, nil
}
```

`?` убирает блок `if err != nil` и «нулевой» `0`, который в Go возвращаешь рядом с ошибкой.

## Шаг 2. Несколько разных ошибок в одной функции

Прочитать файл (io-ошибка) и распарсить его содержимое (parse-ошибка) — две **разные**
ошибки. Чтобы пробрасывать обе через `?`, нужен общий тип. Сделаем свой через `thiserror`
(`cargo add thiserror`):

```rust
use thiserror::Error;

#[derive(Debug, Error)]
enum AppError {
    #[error("ошибка ввода-вывода: {0}")]
    Io(#[from] std::io::Error),         // авто-From: io::Error -> AppError

    #[error("не число: {0}")]
    Parse(#[from] std::num::ParseIntError),  // авто-From: ParseIntError -> AppError
}

fn read_number(path: &str) -> Result<i32, AppError> {
    let raw = std::fs::read_to_string(path)?;   // io::Error -> AppError через From
    let n = raw.trim().parse::<i32>()?;          // ParseIntError -> AppError через From
    Ok(n)
}
```

Магия в `#[from]`: `thiserror` сгенерировал `From<io::Error>` и `From<ParseIntError>` для
`AppError`, поэтому `?` сам конвертирует каждую ошибку в общий тип. Без `thiserror` пришлось
бы писать эти `impl From` руками. В Go ты бы оборачивал через `fmt.Errorf("...: %w", err)` —
идея та же (обогащение и проброс), механика разная.

## Шаг 3. anyhow — когда различать ошибки не нужно

Если это **приложение** и тебе важно «прочитать, и если что — внятно упасть», не нужен
типизированный enum. `anyhow` (`cargo add anyhow`):

```rust
use anyhow::{Context, Result};

fn read_number(path: &str) -> Result<i32> {          // anyhow::Result<i32>
    let raw = std::fs::read_to_string(path)
        .with_context(|| format!("не смог прочитать {path}"))?;
    let n = raw.trim().parse::<i32>()
        .context("содержимое не число")?;
    Ok(n)
}

fn main() -> Result<()> {
    let n = read_number("count.txt")?;
    println!("число: {n}");
    Ok(())
}
```

`anyhow::Error` принимает любую ошибку, а `.context(...)` добавляет человекочитаемую
цепочку причин. `main() -> Result<()>` позволяет `?` прямо в `main`.

## Шаг 4. Намеренно ошибёмся — unwrap в проде

```rust
fn main() {
    let n: i32 = "оно не число".trim().parse().unwrap();  // ❌ паника в рантайме
    println!("{n}");
}
```

```text
thread 'main' panicked at src/main.rs:2:
called `Result::unwrap()` on an `Err` value: ParseIntError { kind: InvalidDigit }
```

`unwrap()` превратил восстановимую ошибку в краш. В прототипе это сойдёт, но в реальном
коде верни `Result` и пробрось `?`, либо обработай `match`. `unwrap`/`expect` оставь там,
где `Err` действительно невозможен — и тогда `expect("инвариант: ...")` задокументирует
почему.

## Mini-drill

```drill
type: free-form
prompt: "Функция read_number читает файл и парсит число. Какие ДВЕ разные ошибки возможны и как пробросить обе одним ??"
answer: "std::io::Error (чтение файла) и std::num::ParseIntError (парсинг). Завести общий тип ошибки с From для обеих (через thiserror #[from]) или использовать anyhow::Error, который принимает любую. Тогда ? конвертирует обе автоматически."
check: manual
```

```drill
type: multiple-choice
prompt: "fn main() -> Result<(), Box<dyn std::error::Error>> { ...?... Ok(()) } — зачем такая сигнатура?"
options: ["Чтобы main был быстрее", "Чтобы пользоваться ? прямо в main; Err завершит программу с ненулевым кодом", "Это обязательная форма main", "Чтобы отключить panic"]
answer: "Чтобы пользоваться ? прямо в main; Err завершит программу с ненулевым кодом"
check: exact
```

## Итог

Ошибки в Rust — значения, как в Go, но `Result<T,E>` объединяет успех и ошибку в один
тип-сумму (нельзя забыть проверку), а `?` убирает ритуал `if err != nil`. Для типизации
ошибок: `thiserror` в библиотеках, `anyhow` в приложениях. И держи границу: `Result` —
ожидаемое, `panic!`/`unwrap` — невосстановимое/баг. Дальше — абстракции, которые делают
код обобщённым: трейты и дженерики.
