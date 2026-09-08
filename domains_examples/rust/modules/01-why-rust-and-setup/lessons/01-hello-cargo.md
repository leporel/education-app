---
id: rust.why-rust-and-setup.lesson-01
type: lesson
title: "Урок 01 — Hello, Cargo: первый проект и первая ошибка"
tags: [rust, cargo, lesson]
status: todo
updated: 2026-06-26
---

# Урок 01 — Hello, Cargo: первый проект и первая ошибка

Цель: завести проект, запустить, заглянуть в структуру, а потом **намеренно сломать** код
и прочитать сообщение компилятора. Чтение ошибок rustc — навык №1.

## Разогрев

- Чем `cargo run` отличается от `go run`? (почти ничем по ощущению — собирает и запускает)
- Что такое edition и какую брать для нового проекта? (2024)
- Почему `let t = s;` иногда «забирает» `s`?

## Шаг 1. Создаём проект

```bash
cargo new hello
cd hello
cargo run
#   Compiling hello v0.1.0 (.../hello)
#    Finished `dev` profile [unoptimized + debuginfo] target(s)
#     Running `target/debug/hello`
# Hello, world!
```

`cargo new` создал:

```text
hello/
├── Cargo.toml        # манифест: имя, версия, edition, зависимости
└── src/
    └── main.rs       # точка входа
```

Загляни в `Cargo.toml` — там `edition = "2024"`. Это значит, компилятор применит к твоему
крейту соглашения редакции 2024.

## Шаг 2. Читаем `main.rs`

```rust
fn main() {
    println!("Hello, world!");
}
```

- `fn main()` — точка входа, как `func main()` в Go.
- `println!` — **макрос** (видно по `!`). Форматная строка проверяется на компиляции:
  если число аргументов не совпадёт с `{}`, словишь ошибку ещё до запуска.

Поменяем на интерполяцию переменной (Rust умеет вставлять имя прямо в строку):

```rust
fn main() {
    let name = "Rust";
    println!("Hello, {name}!");   // {name} — захват переменной из области видимости
}
```

## Шаг 3. Немного типов и неизменяемость по умолчанию

```rust
fn main() {
    let x = 5;          // тип выведен как i32; ПЕРЕМЕННАЯ НЕИЗМЕНЯЕМА по умолчанию
    // x = 6;           // ❌ ошибка: cannot assign twice to immutable variable `x`
    let mut y = 5;      // mut — теперь можно менять
    y += 1;
    println!("{x} {y}");
}
```

> **Не как в Go.** В Go переменная изменяема всегда; неизменяемость — только у `const`
> (и то для констант времени компиляции). В Rust **по умолчанию всё неизменяемо**, а
> `mut` — осознанное разрешение менять. Это не каприз: неизменяемость по умолчанию
> сильно помогает borrow checker и читателю кода.

## Шаг 4. Намеренно ошибёмся — тизер move

Впиши это в `main` и запусти `cargo run`:

```rust
fn main() {
    let s = String::from("hello");
    let t = s;                 // move: владение ушло в t
    println!("{t}");
    println!("{s}");           // ❌ используем s после move
}
```

Компилятор не запустит программу и покажет:

```text
error[E0382]: borrow of moved value: `s`
 --> src/main.rs:5:16
  |
2 |     let s = String::from("hello");
  |         - move occurs because `s` has type `String`, which does not implement the `Copy` trait
3 |     let t = s;
  |             - value moved here
4 |     println!("{t}");
5 |     println!("{s}");
  |               ^^^ value borrowed here after move
```

Разбор сообщения по частям (привыкай так читать каждую ошибку):
- `error[E0382]` — у ошибок есть коды; `rustc --explain E0382` даст подробное объяснение.
- *«move occurs because `String` does not implement `Copy`»* — компилятор объясняет
  **причину**: `String` владеет данными в куче, копировать её «по-тихому» нельзя.
- *«value moved here» / «borrowed here after move»* — где переместили и где попытались
  использовать после.

**Две починки на выбор** (обе — нормальные, выбор зависит от намерения):

```rust
let t = s.clone();   // (1) сделать ГЛУБОКУЮ копию — теперь s и t независимы
```

```rust
let t = &s;          // (2) одолжить ССЫЛКУ — s остаётся владельцем (про это модуль 03)
println!("{t} {s}"); // ок
```

Почему move вообще существует, а не «просто копируй» как в Go? Потому что для `String`
копия означает аллокацию и дублирование данных в куче — это дорого, и делать это неявно
на каждом `=` было бы расточительно. Rust заставляет тебя сказать явно: `clone()` (хочу
копию) или `&` (хочу ссылку). Числа же (`i32` и пр.) дёшевы и реализуют `Copy`, поэтому
для них `let t = x;` копирует, а `x` остаётся валиден — об этом подробно в модуле 02.

## Mini-drill

```drill
type: multiple-choice
prompt: "let x = 5; x = 6; — что скажет компилятор?"
options: ["Всё ок", "cannot assign twice to immutable variable `x` (нужно let mut x)", "x не объявлен", "type mismatch"]
answer: "cannot assign twice to immutable variable `x` (нужно let mut x)"
check: exact
hint: По умолчанию переменные неизменяемы.
```

```drill
type: free-form
prompt: "После let t = s; (s — это String) тебе нужно и дальше пользоваться s. Назови два способа починить."
answer: "1) let t = s.clone(); — глубокая копия, s и t независимы. 2) let t = &s; — одолжить ссылку, владельцем остаётся s."
check: manual
```

```drill
type: free-form
prompt: "Чем cargo run отличается от cargo build?"
answer: "cargo build только собирает (в target/debug), cargo run собирает И запускает бинарь. build --release включает оптимизации."
check: manual
```

## Итог

Ты завёл проект, понял структуру (`Cargo.toml` + `src/main.rs`), увидел три «не как в
Go» вещи разом: **неизменяемость по умолчанию**, **макросы** (`println!`) и — самое
важное — **move-семантику**, когда присваивание забирает владение. Последнее — дверь в
модуль 02, где владение разбирается до основания. И ты потренировал главный навык:
**читать сообщение компилятора целиком**, а не пугаться красного текста.
