---
id: rust.concurrency-async-and-project.lesson-01
type: lesson
title: "Урок 01 — Потоки, Arc<Mutex> и каналы"
tags: [rust, threads, mutex, channels, lesson]
status: todo
updated: 2026-06-26
---

# Урок 01 — Потоки, Arc<Mutex> и каналы

Цель: запустить потоки, поделить состояние через `Arc<Mutex<T>>`, пообщаться через каналы,
и наступить на «`Rc` нельзя в поток» — увидеть fearless concurrency в действии.

## Разогрев

- Почему `spawn` берёт `move`-замыкание?
- Что такое `Send`/`Sync` и кто их проверяет?
- Где данные у `Mutex<T>` живут?

## Шаг 1. Простой поток

```rust
use std::thread;

fn main() {
    let handle = thread::spawn(|| {
        let sum: u64 = (1..=1_000_000).sum();
        println!("посчитал в потоке: {sum}");
    });
    println!("main делает своё");
    handle.join().unwrap();          // дождаться потока (как WaitGroup на один)
}
```

`join()` возвращает `Result` (поток мог паниковать) — отсюда `unwrap()`. В Go это `go
func(){...}()` + `wg.Wait()`.

## Шаг 2. Намеренно ошибёмся — Rc в поток

Попробуем поделить `Rc` между потоками:

```rust
use std::rc::Rc;
use std::thread;

fn main() {
    let data = Rc::new(vec![1, 2, 3]);
    let d = Rc::clone(&data);
    thread::spawn(move || {
        println!("{:?}", d);          // ❌
    }).join().unwrap();
}
```

```text
error[E0277]: `Rc<Vec<i32>>` cannot be sent between threads safely
   |
   = help: within `..`, the trait `Send` is not implemented for `Rc<Vec<i32>>`
note: required by a bound in `spawn`
```

Компилятор не пускает `Rc` в поток: его счётчик неатомарный, гонка по нему испортила бы
подсчёт ссылок (и привела бы к use-after-free или утечке). Это та самая ошибка **на
компиляции**, которой в Go нет. Лечение — `Arc`:

```rust
use std::sync::Arc;
let data = Arc::new(vec![1, 2, 3]);   // Arc: Send + Sync
```

## Шаг 3. Общий счётчик — Arc<Mutex<T>>

Десять потоков инкрементят один счётчик:

```rust
use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    let counter = Arc::new(Mutex::new(0u64));
    let mut handles = Vec::new();

    for _ in 0..10 {
        let c = Arc::clone(&counter);
        let h = thread::spawn(move || {
            let mut guard = c.lock().unwrap();   // блокируемся, берём эксклюзив
            *guard += 1;
        });                                       // guard дропается → замок снят (RAII)
        handles.push(h);
    }

    for h in handles {
        h.join().unwrap();
    }
    println!("итог: {}", *counter.lock().unwrap());   // ровно 10, без гонок
}
```

Ключевое: данные (`0u64`) живут **внутри** `Mutex`. Добраться до них можно только через
`lock()` — забыть взять замок физически невозможно. А разблокировка — автоматическая (guard
вышел из scope). В Go ты бы держал `mu sync.Mutex` рядом с `count int` и сам бы дисциплинированно
звал `mu.Lock()/Unlock()`; здесь дисциплину обеспечивает тип.

## Шаг 4. Каналы — CSP по-Rust'овски

Передача сообщений вместо общей памяти. Воркер шлёт результаты в main:

```rust
use std::sync::mpsc;
use std::thread;

fn main() {
    let (tx, rx) = mpsc::channel();

    // несколько производителей: клонируем отправитель
    for id in 0..3 {
        let tx = tx.clone();
        thread::spawn(move || {
            tx.send(format!("результат от воркера {id}")).unwrap();
        });
    }
    drop(tx);   // закрыли исходный отправитель, иначе rx будет ждать вечно

    for msg in rx {            // итерируемся, пока жив хоть один отправитель
        println!("{msg}");
    }
}
```

`mpsc` = много отправителей (`tx.clone()`), один получатель (`rx`). Важная деталь: цикл
`for msg in rx` завершится, только когда **все** отправители уничтожены — поэтому исходный
`tx` явно `drop`-нули. Это похоже на закрытие канала в Go (`close(ch)`), но через владение:
канал «закрывается», когда умирает последний `tx`.

> **Память vs сообщения.** `Arc<Mutex<T>>` — общая память под замком. Каналы — передача
> владения. Rust поддерживает оба, как и Go («share memory by communicating»). Выбор тот
> же: каналы — когда есть поток данных/пайплайн; мьютекс — когда есть общее состояние,
> которое все правят.

## Mini-drill

```drill
type: multiple-choice
prompt: "Поделить вектор между потоками только для чтения. Что обернуть вокруг?"
options: ["Rc", "Arc (Send+Sync; Rc не пройдёт проверку Send)", "RefCell", "Box"]
answer: "Arc (Send+Sync; Rc не пройдёт проверку Send)"
check: exact
hint: Для потоков — атомарный счётчик.
```

```drill
type: free-form
prompt: "for msg in rx никогда не завершается, хотя воркеры всё отправили. Вероятная причина и починка?"
answer: "Жив лишний отправитель tx (например, исходный, который не клонировали в потоки). Канал закрывается только когда уничтожены ВСЕ tx. Починка: drop(tx) после раздачи клонов воркерам."
check: manual
hint: rx ждёт, пока жив хоть один tx.
```

## Итог

Потоки в Rust — это реальный параллелизм с проверкой владения: `Send`/`Sync` ловят гонки
на компиляции (`Rc` не пустят — бери `Arc`). Общее состояние — `Arc<Mutex<T>>` (данные
внутри замка, разблокировка по RAII). Поток данных — каналы `mpsc` (передача владения,
закрытие через `drop` последнего `tx`). Дальше — async для масштабируемого I/O и сквозной
проект.
