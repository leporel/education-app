---
id: rust.smart-pointers-and-interior-mutability.lesson-01
type: lesson
title: "Урок 01 — Общий изменяемый узел на Rc<RefCell<T>>"
tags: [rust, rc, refcell, weak, lesson]
status: todo
updated: 2026-06-26
---

# Урок 01 — Общий изменяемый узел на Rc<RefCell<T>>

Цель: собрать данные с несколькими владельцами и изменяемостью, наступить на
`BorrowMutError` и понять, как чинить; увидеть цикл `Rc` и `Weak`.

## Разогрев

- Зачем `Rc`, если есть владение?
- Что проверяет `RefCell` и когда паникует?
- Почему цикл `Rc` течёт?

## Шаг 1. Несколько владельцев — `Rc`

Сценарий: общий счётчик-конфиг, на который ссылаются два «модуля». В Go это просто `*Config`,
который оба держат. Здесь — `Rc`:

```rust
use std::rc::Rc;

struct Config { name: String }

fn main() {
    let cfg = Rc::new(Config { name: "prod".into() });
    let module_a = Rc::clone(&cfg);
    let module_b = Rc::clone(&cfg);

    println!("{} {}", module_a.name, module_b.name);   // prod prod
    println!("владельцев: {}", Rc::strong_count(&cfg)); // 3
}
```

Но `Rc` даёт только чтение: `module_a.name = ...` не скомпилируется (нет `&mut` через `Rc`).
А менять-то надо.

## Шаг 2. Добавляем изменяемость — `RefCell`

```rust
use std::rc::Rc;
use std::cell::RefCell;

struct Config { name: String }

fn main() {
    let cfg = Rc::new(RefCell::new(Config { name: "prod".into() }));
    let module_a = Rc::clone(&cfg);

    // меняем через одного владельца...
    module_a.borrow_mut().name = "staging".into();

    // ...видно через другого (это те же данные)
    println!("{}", cfg.borrow().name);   // staging
}
```

`borrow_mut()` выдал изменяемый доступ (с рантайм-проверкой), мы поменяли поле, и изменение
видно всем совладельцам — потому что данные общие.

## Шаг 3. Намеренно ошибёмся — `BorrowMutError`

`RefCell` не отключает правило «один писатель» — он проверяет его в рантайме:

```rust
use std::cell::RefCell;

fn main() {
    let cell = RefCell::new(0);

    let mut first = cell.borrow_mut();    // первый изменяемый заём
    let mut second = cell.borrow_mut();   // ❌ второй, пока жив первый
    *first += 1;
    *second += 1;
}
```

```text
thread 'main' panicked at src/main.rs:6:
already borrowed: BorrowMutError
```

Компилятор это пропустил (типы сходятся), но в рантайме — паника. Сравни: обычный `&mut`
поймал бы это **на компиляции** (`E0499`). `RefCell` — та же гарантия, но динамически, с
паникой вместо отказа сборки. Починка — сузить область первого заёма, чтобы он завершился
до второго:

```rust
fn main() {
    let cell = RefCell::new(0);
    *cell.borrow_mut() += 1;   // заём живёт только на этой строке
    *cell.borrow_mut() += 1;   // первый уже отпущен — ок
    println!("{}", cell.borrow());   // 2
}
```

> **Практический вывод.** Держи `borrow_mut()` как можно короче — в идеале одной строкой/
> выражением. Длинные живущие `Ref`/`RefMut` — главная причина `BorrowMutError`.

## Шаг 4. Цикл Rc и Weak

Свяжем «родитель ↔ ребёнок» наивно — оба через `Rc` — и получим утечку (счётчики не
обнулятся). Правильно: родитель владеет детьми через `Rc`, ребёнок ссылается на родителя
через `Weak`:

```rust
use std::rc::{Rc, Weak};
use std::cell::RefCell;

struct Node {
    value: i32,
    parent: RefCell<Weak<Node>>,        // Weak — не держим родителя живым
    children: RefCell<Vec<Rc<Node>>>,   // Rc — владеем детьми
}

fn main() {
    let leaf = Rc::new(Node {
        value: 3,
        parent: RefCell::new(Weak::new()),
        children: RefCell::new(vec![]),
    });

    let branch = Rc::new(Node {
        value: 5,
        parent: RefCell::new(Weak::new()),
        children: RefCell::new(vec![Rc::clone(&leaf)]),
    });

    // ребёнок ссылается на родителя СЛАБО → цикла нет
    *leaf.parent.borrow_mut() = Rc::downgrade(&branch);

    // достучаться до родителя через upgrade()
    if let Some(parent) = leaf.parent.borrow().upgrade() {
        println!("родитель leaf: {}", parent.value);   // 5
    }
}
```

`Rc::downgrade` делает `Weak`, `upgrade()` возвращает `Option<Rc<Node>>` — `None`, если
родителя уже нет. Так дерево не держит само себя в живых через обратные ссылки.

## Mini-drill

```drill
type: free-form
prompt: "Код паникует с BorrowMutError. Не меняя структуру данных, как обычно чинят?"
answer: "Сузить область жизни заёма: не держать Ref/RefMut в долгоживущей переменной, а брать borrow()/borrow_mut() коротко (на одно выражение/строку), чтобы предыдущий заём завершился до следующего."
check: manual
hint: Короткий borrow.
```

```drill
type: multiple-choice
prompt: "Почему в дереве ребёнок ссылается на родителя через Weak, а не Rc?"
options: ["Weak быстрее", "Чтобы не создать цикл Rc<->Rc и утечку: Weak не удерживает родителя живым", "Rc нельзя класть в RefCell", "Так требует компилятор всегда"]
answer: "Чтобы не создать цикл Rc<->Rc и утечку: Weak не удерживает родителя живым"
check: exact
```

## Итог

`Rc` даёт совладельцев, `RefCell` — изменяемость через `&` с рантайм-проверкой «одного
писателя» (паника `BorrowMutError` вместо ошибки компиляции). Вместе — `Rc<RefCell<T>>`,
общий изменяемый узел для однопоточного кода. Циклы `Rc` текут — разрывай их `Weak`.
Главный навык: держать `borrow_mut()` коротким. Дальше многопоточная версия этих идей —
`Arc<Mutex<T>>` — и вся конкурентность с async в финальном модуле.
