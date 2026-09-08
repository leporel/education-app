---
id: rust.why-rust-and-setup.drills
type: drills
title: "Зачем Rust и как завести проект — упражнения"
tags: [rust, intro, cargo, drills]
status: todo
updated: 2026-09-08
---

# Упражнения

## Зачем Rust

```drill
type: free-form
prompt: "Сформулируй в одном-двух предложениях, чем фундаментальный выбор Rust отличается от Go в управлении памятью."
answer: "Go использует сборщик мусора (GC) в рантайме; Rust обеспечивает безопасность памяти на этапе компиляции через владение/заём, без GC и без рантайма. Итог: предсказуемая память и нет пауз GC, но нужна дисциплина владения."
check: manual
hint: GC в рантайме vs проверки на компиляции.
```

```drill
type: multiple-choice
prompt: "Что НЕ является китом безопасности Rust?"
options: ["Ownership", "Borrowing", "Garbage Collection", "Lifetimes"]
answer: "Garbage Collection"
check: exact
hint: Именно его в Rust и нет.
```

## Тулинг и Cargo

```drill
type: multiple-choice
prompt: "Какой командой создать новый бинарный проект?"
options: ["cargo build", "cargo new hello", "rustup new hello", "cargo init --bin --release"]
answer: "cargo new hello"
check: exact
```

```drill
type: free-form
prompt: "Назови команду cargo для: (1) запуска, (2) тестов, (3) линтера, (4) добавления зависимости."
answer: "cargo run; cargo test; cargo clippy; cargo add <crate>."
check: manual
```

```drill
type: fill-in
prompt: "Манифест проекта называется ____, а файл фиксации точных версий — ____."
answer: "Cargo.toml; Cargo.lock"
check: fuzzy
hint: Аналоги go.mod / go.sum.
```

## Edition

```drill
type: multiple-choice
prompt: "Что из перечисленного про Edition ВЕРНО?"
options: ["Edition — это версия компилятора", "Крейты разных редакций нельзя линковать вместе", "Edition — набор соглашений крейта; крейты разных редакций совместимы", "Новые проекты надо создавать на edition 2015"]
answer: "Edition — набор соглашений крейта; крейты разных редакций совместимы"
check: exact
hint: Компилятор всегда последний; редакция — про соглашения конкретного крейта.
```

## Тизер ownership

```drill
type: free-form
prompt: "let a = String::from(\"x\"); let b = a; println!(\"{a}\"); — что скажет компилятор и почему?"
answer: "Ошибка error[E0382]: borrow of moved value: `a`. Владение строкой переместилось в b (String не Copy), поэтому a после этого использовать нельзя. В Go строка бы скопировалась и оба остались валидны."
check: manual
hint: move, а не copy.
```

```drill
type: multiple-choice
prompt: "Почему println! пишется с восклицательным знаком?"
options: ["Это функция с побочными эффектами", "Это макрос, ! — часть синтаксиса вызова", "Это указатель на функцию", "Так помечают unsafe-код"]
answer: "Это макрос, ! — часть синтаксиса вызова"
check: exact
```

## Модули и видимость

```drill
type: free-form
prompt: "Ты создал src/parser.rs и написал в нём pub fn parse(). Из main.rs зовёшь parser::parse() — компилятор говорит 'failed to resolve: use of undeclared crate or module `parser`'. Что забыл?"
answer: "Объявить модуль: mod parser; в src/main.rs. Файл в src/ не подключается автоматически (в отличие от Go, где файл в папке — часть пакета)."
check: manual
hint: mod — это явное подключение файла к дереву крейта.
```

```drill
type: multiple-choice
prompt: "Функция нужна во всём твоём проекте, но НЕ должна быть частью публичного API крейта. Как её объявить?"
options: ["fn helper()", "pub fn helper()", "pub(crate) fn helper()", "pub(super) fn helper()"]
answer: "pub(crate) fn helper()"
check: exact
hint: «Публично для моего крейта» — того, чего в Go нет без internal/.
```

```drill
type: multiple-choice
prompt: "Модуль config использует storage, а storage — config. Что скажет компилятор Rust?"
options: ["Ошибка: циклическая зависимость", "Ничего: внутри одного крейта циклы модулей разрешены", "Предупреждение clippy", "Нужен unsafe"]
answer: "Ничего: внутри одного крейта циклы модулей разрешены"
check: exact
hint: Запрещены циклы только между крейтами; в Go — между пакетами.
```

```drill
type: free-form
prompt: "У тебя pub struct Config { path: String }. Пользователь крейта пишет cfg.path и получает ошибку приватности. Два варианта решения и когда какой?"
answer: "1) Помечать поле: pub path: String — когда поле безопасно менять кому угодно. 2) Оставить поле приватным и дать метод pub fn path(&self) -> &str (и, если нужно, сеттер с валидацией) — когда важно сохранить инвариант. pub на структуре не делает поля публичными."
check: manual
```

## Тесты

```drill
type: free-form
prompt: "Напиши минимальный тест-модуль для pub fn add(a: i32, b: i32) -> i32."
answer: "#[cfg(test)] mod tests { use super::*; #[test] fn adds() { assert_eq!(add(2, 2), 4); } } — cargo test найдёт его сам; #[cfg(test)] не пустит модуль в релизную сборку."
check: manual
hint: cfg(test) + mod tests + use super::*.
```

```drill
type: multiple-choice
prompt: "Тест должен проверять ПРИВАТНУЮ функцию модуля. Куда его положить?"
options: ["В папку tests/ рядом с src/", "В #[cfg(test)] mod tests внутри того же файла — он видит приватное как потомок модуля", "Никак, приватное не тестируется", "Сделать функцию pub ради теста"]
answer: "В #[cfg(test)] mod tests внутри того же файла — он видит приватное как потомок модуля"
check: exact
hint: tests/ — это чёрный ящик, только pub-API.
```

```drill
type: fill-in
prompt: "Быстро проверить типы и заём, не собирая бинарник: cargo ____."
answer: "check"
check: exact
hint: В разы быстрее build; основной цикл разработки.
```
