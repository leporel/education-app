---
id: rust.types-structs-enums-pattern-matching.lesson-01
type: lesson
title: "Урок 01 — Моделируем домен: struct + enum + match"
tags: [rust, struct, enum, match, option, lesson]
status: todo
updated: 2026-06-26
---

# Урок 01 — Моделируем домен: struct + enum + match

Цель: собрать маленькую доменную модель на `struct` и `enum`, разобрать значения через
`match`, и почувствовать, как `Option` убирает целый класс nil-багов.

## Разогрев

- Чем `enum` отличается от констант?
- Что значит «исчерпывающий match»?
- Как достать значение из `Option`, не паникуя?

## Шаг 1. Структура и методы

Смоделируем платёж. Сумма в копейках (целые — без сюрпризов с плавающей точкой).

```rust
struct Payment {
    amount_cents: u64,
    currency: String,
}

impl Payment {
    fn new(amount_cents: u64, currency: &str) -> Self {
        Self { amount_cents, currency: currency.to_string() }
    }

    fn major_units(&self) -> f64 {
        self.amount_cents as f64 / 100.0     // as — явное приведение
    }
}
```

## Шаг 2. Enum со статусом — то, чего нет в Go

Статус платежа — это «одно из», и некоторые варианты несут данные:

```rust
enum Status {
    Pending,
    Paid { txn_id: String },     // несёт id транзакции
    Failed(String),              // несёт причину
}
```

В Go ты бы сделал строковую константу + отдельные поля `TxnID`, `FailReason`, и ничто не
мешало бы выставить `Paid` без `txn_id`. Здесь данные **привязаны к варианту**: нет
`Paid` без `txn_id` и нет `txn_id` у `Pending`. Невалидное состояние непредставимо.

## Шаг 3. Разбираем через match

```rust
fn describe(status: &Status) -> String {
    match status {
        Status::Pending => "ожидает оплаты".to_string(),
        Status::Paid { txn_id } => format!("оплачено, txn={txn_id}"),
        Status::Failed(reason) => format!("ошибка: {reason}"),
    }
}
```

Убери любую ветку — компилятор остановит сборку: `error[E0004]: non-exhaustive patterns:
`Status::Failed(_)` not covered`. Добавишь новый вариант в `Status` позже — компилятор
покажет все `match`, где ты его забыл. Это рефакторинг без страха.

## Шаг 4. Option вместо nil

Поиск платежа по id: может найтись, а может нет. В Go — вернуть `*Payment` (и риск nil). В
Rust — `Option`:

```rust
fn find(payments: &[Payment], cents: u64) -> Option<&Payment> {
    for p in payments {
        if p.amount_cents == cents {
            return Some(p);
        }
    }
    None
}

fn main() {
    let payments = vec![
        Payment::new(15000, "RUB"),
        Payment::new(9900, "RUB"),
    ];

    // let else: достать или сообщить и выйти
    let Some(found) = find(&payments, 9900) else {
        println!("платёж не найден");
        return;
    };
    println!("нашли: {:.2} {}", found.major_units(), found.currency);

    // комбинатор: длина названия валюты или 0, без ветвлений
    let n = find(&payments, 1).map(|p| p.currency.len()).unwrap_or(0);
    println!("currency len: {n}");
}
```

Обрати внимание: `find` возвращает `Option<&Payment>` — Option от **ссылки**, мы ничего не
клонировали и не отдавали владение (модули 02–03 в деле). А `let else` даёт плоский,
читаемый «достань-или-выйди» без пирамиды `if`.

## Шаг 5. Намеренно ошибёмся

```rust
fn main() {
    let p: Option<i32> = None;
    let x = p.unwrap();          // ❌ в рантайме: panicked at 'called `Option::unwrap()` on a `None` value'
    println!("{x}");
}
```

`unwrap()` на `None` — это паника. Компилятор пропустит (типы-то сходятся), но программа
упадёт. Это осознанный инструмент для «здесь None невозможен, и если он есть — это баг».
В проде вместо него — `match`, `if let`, `let else` или `unwrap_or`. А когда «ничего» — это
не просто отсутствие, а **ошибка с причиной**, нужен `Result` (следующий модуль).

## Mini-drill

```drill
type: free-form
prompt: "Добавь в enum Status вариант Refunded { amount_cents: u64 }. Что потребует компилятор и почему это хорошо?"
answer: "Компилятор выдаст non-exhaustive patterns во всех match по Status, где нет ветки Refunded. Хорошо, потому что он не даст забыть обработать новый случай ни в одном месте кода."
check: manual
```

```drill
type: multiple-choice
prompt: "find возвращает Option<&Payment>. Почему именно &Payment, а не Payment?"
options: ["Случайность", "Чтобы не клонировать и не отдавать владение — возвращаем заём элемента среза", "Payment нельзя возвращать", "Так быстрее печатать"]
answer: "Чтобы не клонировать и не отдавать владение — возвращаем заём элемента среза"
check: exact
```

## Итог

Ты собрал домен из `struct` (данные + методы в `impl`) и `enum` (сумм-тип, где невалидное
состояние непредставимо), разобрал его исчерпывающим `match` и заменил `nil` на `Option`,
обработав его через `let else` и комбинаторы. Главное ощущение: **компилятор не даёт
забыть случай** — ни вариант enum, ни возможность отсутствия. Дальше превратим «ничего» в
«ошибку с причиной»: `Result` и оператор `?`.
