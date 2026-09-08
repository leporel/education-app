---
id: rust.traits-and-generics.lesson-02
type: lesson
title: "Урок 02 — Статическая vs динамическая диспетчеризация"
tags: [rust, dyn, impl-trait, dispatch, lesson]
status: todo
updated: 2026-06-26
---

# Урок 02 — Статическая vs динамическая диспетчеризация

Цель: на одном примере увидеть оба способа использовать трейт как тип — `impl Trait`
(статика) и `Box<dyn Trait>` (динамика) — и понять, когда какой нужен.

## Разогрев

- Что мономорфизируется, а что идёт через vtable?
- Почему `dyn` требует указателя?
- Почему `Vec<impl Trait>` не хранит разные типы?

## Шаг 1. Общий трейт

```rust
trait Shape {
    fn area(&self) -> f64;
    fn name(&self) -> &str;
}

struct Circle { r: f64 }
struct Square { side: f64 }

impl Shape for Circle {
    fn area(&self) -> f64 { std::f64::consts::PI * self.r * self.r }
    fn name(&self) -> &str { "circle" }
}
impl Shape for Square {
    fn area(&self) -> f64 { self.side * self.side }
    fn name(&self) -> &str { "square" }
}
```

## Шаг 2. Статика — `impl Trait` / дженерик

Одна функция, но компилятор сделает специализированную версию под каждый конкретный тип:

```rust
fn describe(s: &impl Shape) {            // мономорфизируется: describe::<Circle>, describe::<Square>
    println!("{}: {:.2}", s.name(), s.area());
}

fn main() {
    describe(&Circle { r: 2.0 });        // circle: 12.57
    describe(&Square { side: 3.0 });     // square: 9.00
}
```

Вызовы `s.area()` — прямые, известны на компиляции, инлайнятся. Максимально быстро. Но
коллекцию разных фигур так не собрать: `Vec<impl Shape>` потребовал бы единый конкретный тип.

## Шаг 3. Динамика — `Box<dyn Trait>` для разнородной коллекции

Нужен список из разных фигур — берём trait object:

```rust
fn total_area(shapes: &[Box<dyn Shape>]) -> f64 {
    shapes.iter().map(|s| s.area()).sum()    // s.area() — через vtable
}

fn main() {
    let shapes: Vec<Box<dyn Shape>> = vec![
        Box::new(Circle { r: 1.0 }),
        Box::new(Square { side: 2.0 }),     // разные типы в одном Vec — благодаря dyn
    ];
    println!("сумма площадей: {:.2}", total_area(&shapes));   // 7.14
}
```

`Box<dyn Shape>` — указатель на кучу + vtable. Размер `Box` известен (это указатель),
поэтому такие значения можно складывать в `Vec`. Вызов `area()` идёт через таблицу методов
— чуть дороже прямого, зато гибко.

> **Go-параллель.** `Vec<Box<dyn Shape>>` — это ровно `[]Shape` в Go, где `Shape` —
> интерфейс: гетерогенный список за интерфейсом, вызовы через таблицу методов. А `impl
> Shape`/дженерики — то, чего в дорантайм-Go не было: мономорфизация без потери типа.

## Шаг 4. Возврат трейта из функции

```rust
// статика: ВСЕГДА один и тот же конкретный тип (тут Circle)
fn unit_circle() -> impl Shape {
    Circle { r: 1.0 }
}

// динамика: можем вернуть РАЗНЫЕ типы в зависимости от условия
fn make(kind: &str) -> Box<dyn Shape> {
    if kind == "square" {
        Box::new(Square { side: 1.0 })
    } else {
        Box::new(Circle { r: 1.0 })
    }
}
```

Вот наглядный критерий: если ветки возвращают **разные** типы — нужен `Box<dyn Shape>`,
`impl Shape` не скомпилируется (он обещает один конкретный тип).

```text
error[E0308]: `if` and `else` have incompatible types
   = note: expected struct `Circle`, found struct `Square`
   = help: you could change the return type to be a boxed trait object: `Box<dyn Shape>`
```

(Компилятор сам предлагает `Box<dyn Shape>` — снова читаем подсказку и берём её.)

## Mini-drill

```drill
type: multiple-choice
prompt: "fn make(k: &str) -> impl Shape возвращает в разных ветках Circle или Square. Что скажет компилятор?"
options: ["Всё ок", "incompatible types: impl Trait обещает ОДИН тип; нужен Box<dyn Shape>", "E0382", "Бесконечная рекурсия"]
answer: "incompatible types: impl Trait обещает ОДИН тип; нужен Box<dyn Shape>"
check: exact
hint: Разные типы в ветках → dyn.
```

```drill
type: free-form
prompt: "Для горячего цикла по миллиону одинаковых Circle — impl Shape или dyn Shape, и почему?"
answer: "impl Shape / дженерик (статика): мономорфизация даёт прямые инлайнящиеся вызовы area(), без накладных расходов vtable. dyn оправдан, когда нужны РАЗНЫЕ типы вместе, а не одинаковые."
check: manual
```

## Итог

Один трейт — два режима. **Статика** (`impl Trait`/дженерики, мономорфизация) — по
умолчанию: быстро, прямые вызовы, но один конкретный тип. **Динамика** (`Box<dyn Trait>`,
vtable) — когда нужны разнородные типы за общим трейтом или ветки возвращают разное. Выбор
явный и видимый в типах. Дальше — стандартные коллекции и итераторы, где трейты (`Iterator`)
работают на полную.
