---
id: rust.traits-and-generics.lesson-01
type: lesson
title: "Урок 01 — Свой трейт и обобщённая функция с bound"
tags: [rust, traits, generics, bounds, lesson]
status: todo
updated: 2026-06-26
---

# Урок 01 — Свой трейт и обобщённая функция с bound

Цель: объявить трейт, реализовать его для нескольких типов (включая чужой), и написать
обобщённую функцию, работающую для любого типа с нужным поведением.

## Разогрев

- Чем явная реализация трейта лучше структурной из Go?
- Что такое trait bound?
- Что разрешает и запрещает правило сиротства?

## Шаг 1. Трейт с методом по умолчанию

```rust
trait Summary {
    fn title(&self) -> String;

    // метод по умолчанию — использует обязательный title()
    fn preview(&self) -> String {
        format!("[{}] (читать далее...)", self.title())
    }
}
```

## Шаг 2. Реализации для разных типов

```rust
struct Article { headline: String, body: String }
struct Tweet { user: String, text: String }

impl Summary for Article {
    fn title(&self) -> String { self.headline.clone() }
}

impl Summary for Tweet {
    fn title(&self) -> String { format!("@{}", self.user) }
    fn preview(&self) -> String { format!("@{}: {}", self.user, self.text) }  // переопределили
}
```

`Article` пользуется дефолтным `preview`, `Tweet` — своим. В Go дефолтных методов в
интерфейсе нет; здесь это убирает дублирование.

## Шаг 3. Обобщённая функция с bound

Функция, печатающая превью **чего угодно**, что реализует `Summary`:

```rust
fn print_preview(item: &impl Summary) {     // == fn print_preview<T: Summary>(item: &T)
    println!("{}", item.preview());
}

fn main() {
    let a = Article { headline: "Rust 1.96".into(), body: "...".into() };
    let t = Tweet { user: "rustlang".into(), text: "we shipped".into() };
    print_preview(&a);   // [Rust 1.96] (читать далее...)
    print_preview(&t);   // @rustlang: we shipped
}
```

`.into()` тут — конвертация `&str` → `String` (через трейт `Into`, родственник `From`).

## Шаг 4. Реализуем СВОЙ трейт для ЧУЖОГО типа

Правило сиротства разрешает: трейт `Summary` — наш, значит можем реализовать его хоть для
`Vec<T>` (чужой тип):

```rust
impl Summary for Vec<String> {
    fn title(&self) -> String {
        format!("список из {} строк", self.len())
    }
}

fn main() {
    let v = vec!["a".to_string(), "b".to_string()];
    println!("{}", v.preview());   // [список из 2 строк] (читать далее...)
}
```

В Go так нельзя — методы добавляются только к типам своего пакета. Здесь — можно, пока
трейт твой.

## Шаг 5. Намеренно ошибёмся — bound, которого нет

```rust
fn print_preview<T>(item: &T) {     // ❌ забыли bound
    println!("{}", item.preview());
}
```

```text
error[E0599]: no method named `preview` found for reference `&T` in the current scope
  = note: the method `preview` exists for ... but its trait bounds were not satisfied
help: consider restricting type parameter `T` with trait bound `T: Summary`
```

Компилятор прямо подсказывает: добавь `T: Summary`. Без bound он не знает, что у `T` есть
`preview`. Это и есть сила дженериков Rust — поведение гарантируется типом, а не «надеемся,
что метод есть».

## Mini-drill

```drill
type: free-form
prompt: "Добавь трейту Summary метод word_count(&self) -> usize по умолчанию, считающий слова в title(). Напиши."
answer: "Внутри trait Summary: fn word_count(&self) -> usize { self.title().split_whitespace().count() } — дефолтный метод поверх обязательного title()."
check: manual
```

```drill
type: multiple-choice
prompt: "fn show<T>(x: &T) { println!(\"{}\", x.summary()); } не компилируется (no method summary). Починка?"
options: ["Добавить bound: fn show<T: Summary>(x: &T)", "Обернуть в unsafe", "Заменить T на any", "Удалить дженерик"]
answer: "Добавить bound: fn show<T: Summary>(x: &T)"
check: exact
hint: Компилятор сам это и предлагает.
```

## Итог

Трейт — это контракт, реализуемый **явно** и расширяемый методами по умолчанию; его можно
повесить даже на чужой тип (правило сиротства). Обобщённые функции работают для любого
`T`, удовлетворяющего bound, и это гарантируется компилятором. Дальше — как этот код
исполняется: статически (быстро) или динамически (гибко).
