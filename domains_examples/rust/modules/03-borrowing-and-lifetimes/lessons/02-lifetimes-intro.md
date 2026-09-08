---
id: rust.borrowing-and-lifetimes.lesson-02
type: lesson
title: "Урок 02 — Знакомство с lifetimes"
tags: [rust, lifetimes, lesson]
status: todo
updated: 2026-06-26
---

# Урок 02 — Знакомство с lifetimes

Цель: понять, зачем `'a`, на примере функции, возвращающей ссылку; увидеть, где элизия
избавляет от аннотаций, а где их требует.

## Разогрев

- Почему нельзя вернуть ссылку на локальную переменную?
- Что `'a` связывает?
- Когда lifetimes можно не писать?

## Шаг 1. Висячая ссылка — Rust не даст

```rust
fn make() -> &String {           // ❌
    let s = String::from("temp");
    &s
}
```

```text
error[E0106]: missing lifetime specifier
  = help: this function's return type contains a borrowed value,
          but there is no value for it to be borrowed from
```

`s` умирает в конце `make`, ссылка на неё была бы висячей. В Go `return &s` сработал бы —
escape analysis отправил бы `s` в кучу, а GC удержал бы её живой. В Rust владелец один и
умирает на выходе; вернуть на него ссылку нельзя. Если нужно отдать данные наружу — отдай
**владение**: `fn make() -> String { String::from("temp") }`.

## Шаг 2. Ссылка приходит снаружи — и одного аргумента хватает (элизия)

```rust
fn first_word(s: &str) -> &str {        // никаких 'a — элизия!
    match s.find(' ') {
        Some(i) => &s[..i],
        None => s,
    }
}

fn main() {
    let text = String::from("hello rust world");
    println!("{}", first_word(&text));   // hello
}
```

Здесь компилятор сам понимает: результат заимствован из единственного входа `s`, значит
живёт столько же. Один входной заём → lifetimes не нужны. Это правило элизии.

## Шаг 3. Два входа — компилятор просит помощи

```rust
fn longest(x: &str, y: &str) -> &str {   // ❌ из какого входа результат?
    if x.len() >= y.len() { x } else { y }
}
```

```text
error[E0106]: missing lifetime specifier
  = help: this function's return type contains a borrowed value, but the signature
          does not say whether it is borrowed from `x` or `y`
```

Компилятор не угадывает: вернуться может и `x`, и `y`. Свяжем оба входа и выход одним `'a`:

```rust
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() >= y.len() { x } else { y }
}

fn main() {
    let a = String::from("short");
    let b = String::from("a bit longer");
    println!("{}", longest(&a, &b));      // a bit longer
}
```

Читается так: «для некоторого времени жизни `'a`, x и y живут хотя бы `'a`, и результат
живёт `'a`». Практический смысл — **результат нельзя использовать дольше, чем живёт любой
из входов**. Попробуй нарушить, и компилятор поймает:

```rust
fn main() {
    let a = String::from("short");
    let result;
    {
        let b = String::from("a bit longer");
        result = longest(&a, &b);    // result привязан к жизни и b тоже
    }                                // b умирает здесь
    // println!("{result}");         // ❌ b уже мёртв, а result мог указывать на b
}
```

```text
error[E0597]: `b` does not live long enough
```

Вот ради чего `'a`: он позволил компилятору доказать, что мы пытаемся пережить данные.

## Шаг 4. Lifetime в структуре, которая хранит ссылку

Если структура **держит** ссылку, ей тоже нужен `'a` — он говорит «экземпляр не переживёт
то, на что ссылается»:

```rust
struct Excerpt<'a> {
    part: &'a str,           // храним заём, а не владеем строкой
}

fn main() {
    let novel = String::from("Зовите меня Измаил. Прошло несколько лет...");
    let first = novel.split('.').next().unwrap();
    let e = Excerpt { part: first };   // e не может пережить novel
    println!("{}", e.part);
}
```

Чаще всего, впрочем, структуры **владеют** своими данными (`String`, а не `&str`), и
lifetimes им не нужны — это упрощает жизнь. Ссылки в полях — осознанный приём для случаев,
где копировать дорого, а время жизни заведомо короче источника.

## Mini-drill

```drill
type: multiple-choice
prompt: "Почему fn first_word(s: &str) -> &str компилируется без 'a, а longest(x,y) — нет?"
options: ["first_word проще", "У first_word один входной заём — элизия привязывает результат к нему; у longest два входа, неоднозначно", "longest возвращает String", "Это баг компилятора"]
answer: "У first_word один входной заём — элизия привязывает результат к нему; у longest два входа, неоднозначно"
check: exact
```

```drill
type: free-form
prompt: "Нужно вернуть из функции новую строку (не ссылку на локальную). Какой тип возвращать и почему?"
answer: "String (владение), а не &String. Локальная переменная умрёт на выходе, ссылку на неё вернуть нельзя; отдаём владение наружу — вызывающий становится владельцем."
check: manual
hint: Отдать владение, а не заём.
```

## Итог

`'a` — это не «сколько живёт значение», а **связь** между жизнью входных и выходных
ссылок, которую компилятор использует, чтобы не дать тебе пережить данные. В большинстве
функций работает элизия и `'a` писать не нужно; он всплывает, когда ссылок несколько или
когда структура хранит заём. Запомни спасательный круг: хочешь отдать данные наружу
надолго — **отдавай владение** (`String`, `Vec`), а не ссылку. На этом позвоночник
(модули 02–03) закончен — дальше строим из этого типы и данные.
