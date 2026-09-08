---
id: rust.ownership-and-moves.lesson-01
type: lesson
title: "Урок 01 — Move или Copy: тренируем глаз"
tags: [rust, move, copy, lesson]
status: todo
updated: 2026-06-26
---

# Урок 01 — Move или Copy: тренируем глаз

Цель: на серии маленьких примеров довести до автоматизма различение «это переместится» и
«это скопируется», и научиться чинить move-ошибки осознанно (ссылка vs clone).

## Разогрев

- Что общего у всех `Copy`-типов? (целиком на стеке, не владеют кучей)
- Что делает `clone()` и почему он виден в коде?
- После `let b = a;` (a: `String`) — что с `a`?

## Шаг 1. Угадай до запуска

Для каждого фрагмента скажи себе: «move или copy, оригинал валиден или нет?». Потом
проверь в Playground.

```rust
// (A)
let a = 10;
let b = a;
println!("{a} {b}");        // ?

// (B)
let s = String::from("hi");
let t = s;
println!("{s}");            // ?

// (C)
let p = (1, 2.0, true);
let q = p;
println!("{p:?}");          // ?  (:? — отладочный вывод)

// (D)
let r = (1, String::from("x"));
let w = r;
println!("{r:?}");          // ?
```

Ответы: (A) copy, оба валидны → `10 10`. (B) move → ошибка `E0382` на `{s}`. (C) copy,
кортеж из `Copy`-полей → `(1, 2.0, true)`. (D) move: внутри `String`, значит весь кортеж
не `Copy` → ошибка на `{r:?}`.

Вывод-правило: **смотри на содержимое.** Любая «начинка», владеющая кучей (`String`,
`Vec`, `Box`, своя структура без `Copy`), делает всё вокруг move-типом.

## Шаг 2. Читаем ошибку и чиним двумя путями

```rust
fn main() {
    let s = String::from("hello");
    let t = s;
    println!("{s} and {t}");   // ❌
}
```

```text
error[E0382]: borrow of moved value: `s`
  |
2 |     let s = String::from("hello");
  |         - move occurs because `s` has type `String`, which does not implement the `Copy` trait
3 |     let t = s;
  |             - value moved here
4 |     println!("{s} and {t}");
  |               ^^^ value borrowed here after move
```

**Починка 1 — мне нужны две независимые строки → `clone`:**

```rust
let t = s.clone();
println!("{s} and {t}");   // ок: две отдельные аллокации
```

**Починка 2 — мне просто надо обе ПОЧИТАТЬ → ссылка (заглянем в модуль 03):**

```rust
let t = &s;                // t одалживает s, владение остаётся у s
println!("{s} and {t}");   // ок, без лишней аллокации
```

Правило выбора: нужна **вторая копия данных** — `clone`. Нужно просто **посмотреть** —
ссылка. По умолчанию думай про ссылку: она бесплатна.

## Шаг 3. `Copy` для своей структуры

Свою структуру можно сделать `Copy`, если все её поля `Copy`:

```rust
#[derive(Clone, Copy, Debug)]
struct Point { x: i32, y: i32 }

fn main() {
    let p = Point { x: 1, y: 2 };
    let q = p;                  // copy — p остаётся валиден
    println!("{p:?} {q:?}");    // ок
}
```

А вот так — **нельзя**, и компилятор объяснит почему:

```rust
#[derive(Clone, Copy)]
struct User { name: String }   // ❌
```

```text
error[E0204]: the trait `Copy` cannot be implemented for this type
  |
2 | struct User { name: String }
  |               ---------- this field does not implement `Copy`
```

Логично: `User` владеет строкой в куче, побайтовая копия привела бы к двойному владению.
Для таких типов оставляют только `Clone` (явная глубокая копия), без `Copy`.

## Mini-drill

```drill
type: multiple-choice
prompt: "let v = vec![1,2,3]; let w = v; println!(\"{v:?}\"); — что будет?"
options: ["Напечатает [1, 2, 3]", "Ошибка E0382: Vec не Copy, v перемещён в w", "Ошибка типов", "Напечатает адрес"]
answer: "Ошибка E0382: Vec не Copy, v перемещён в w"
check: exact
hint: Vec владеет буфером в куче.
```

```drill
type: free-form
prompt: "Почему #[derive(Copy)] для struct { name: String } не компилируется?"
answer: "Copy требует, чтобы все поля были Copy. String владеет кучей и не Copy, поэтому побайтовая копия создала бы двух владельцев → запрещено (E0204). Оставляют только Clone."
check: manual
```

## Итог

Главный навык урока — **смотреть на содержимое типа**: владеет кучей → move; целиком на
стеке и дёшев → `Copy`. И чинить move-ошибки осознанно: `clone()` когда нужна копия,
ссылка `&` когда нужно просто почитать. Дальше — что происходит, когда значения уезжают в
функции.
