---
id: rust.collections-iterators-closures.lesson-01
type: lesson
title: "Урок 01 — Конвейер обработки данных на итераторах"
tags: [rust, iterators, closures, lesson]
status: todo
updated: 2026-06-26
---

# Урок 01 — Конвейер обработки данных на итераторах

Цель: превратить ручной цикл в декларативный конвейер итераторов с замыканиями, увидеть
ленивость и zero-cost, и не наступить на «`for x in v` забрал владение».

## Разогрев

- Когда конвейер итераторов реально исполняется?
- Чем `iter()` отличается от `into_iter()`?
- Какой трейт у замыкания, которое только читает?

## Шаг 1. Задача и решение «как в Go» (ручной цикл)

Дан список заказов; нужна сумма стоимостей оплаченных заказов дороже 1000.

```rust
struct Order { paid: bool, amount: u32 }

fn total_imperative(orders: &[Order]) -> u32 {
    let mut sum = 0;
    for o in orders {                 // o: &Order (заём, orders цел)
        if o.paid && o.amount > 1000 {
            sum += o.amount;
        }
    }
    sum
}
```

Рабочий, знакомый по Go код. Теперь — декларативно.

## Шаг 2. То же конвейером

```rust
fn total_iter(orders: &[Order]) -> u32 {
    orders.iter()
        .filter(|o| o.paid && o.amount > 1000)   // оставить нужные
        .map(|o| o.amount)                        // взять суммы
        .sum()                                    // свернуть
}
```

Читается как «возьми заказы → отфильтруй → достань суммы → сложи». Замыкания `|o| ...` —
это `Fn` (только читают `o`). И — важно — этот конвейер **не создаёт промежуточных
векторов**: компилятор свернёт его в один цикл, не медленнее `total_imperative`. Декларативно
и при этом бесплатно.

## Шаг 3. Ленивость наглядно

```rust
fn main() {
    let v = vec![1, 2, 3, 4, 5];

    let step = v.iter().map(|x| {
        println!("обрабатываю {x}");     // побочный эффект — увидим, КОГДА исполнится
        x * 10
    });
    println!("конвейер построен, но ещё ничего не печаталось");

    let result: Vec<i32> = step.collect();   // вот ТУТ запускается обработка
    println!("{result:?}");
}
```

Вывод докажет: строки «обрабатываю N» появятся только на `collect()`, а не при построении
конвейера. Адаптеры ленивы.

## Шаг 4. enumerate, zip, collect в HashMap

```rust
use std::collections::HashMap;

fn main() {
    let names = vec!["Ann", "Bob", "Cid"];
    let scores = vec![10, 20, 30];

    // индексация
    for (i, name) in names.iter().enumerate() {
        println!("{i}: {name}");
    }

    // склейка двух итераторов в HashMap
    let table: HashMap<&str, i32> = names.iter()
        .copied()                    // &&str -> &str
        .zip(scores.iter().copied()) // пары (name, score)
        .collect();                  // собрать в HashMap
    println!("{:?}", table.get("Bob"));   // Some(20)
}
```

`collect()` универсален: тип результата (`Vec`, `HashMap`, `String`, ...) выбирается по
аннотации типа слева. Здесь мы сказали `HashMap<&str, i32>` — и `collect` собрал пары в
словарь.

## Шаг 5. Намеренно ошибёмся — потеря владения в for

```rust
fn main() {
    let v = vec![String::from("a"), String::from("b")];
    for s in v {                     // into_iter(): забрали владение v
        println!("{s}");
    }
    println!("{v:?}");               // ❌
}
```

```text
error[E0382]: borrow of moved value: `v`
  |
3 |     for s in v {
  |              - `v` moved due to this implicit call to `.into_iter()`
...
6 |     println!("{v:?}");
  |               ^^^^^ value borrowed here after move
```

Компилятор прямо называет причину: «moved due to implicit call to `.into_iter()`». Чинится
одним символом — `for s in &v` (заём вместо владения). Если же тебе и правда надо забрать
строки наружу (например, переместить их в другую структуру) — `into_iter` как раз то, что
нужно, и тогда `v` после цикла не используют намеренно.

## Mini-drill

```drill
type: free-form
prompt: "Дан words: Vec<String>. Собери в новый Vec длины только тех слов, что длиннее 3 символов."
answer: "let lens: Vec<usize> = words.iter().filter(|w| w.len() > 3).map(|w| w.len()).collect();  (или .map(|w| w.len()).filter(|&l| l > 3))"
check: manual
hint: filter → map → collect.
```

```drill
type: multiple-choice
prompt: "В каком месте конвейера .iter().map(f).filter(g) реально начнётся вычисление?"
options: ["На .map(f)", "На .filter(g)", "На терминальной операции (collect/sum/for/count)", "Сразу при .iter()"]
answer: "На терминальной операции (collect/sum/for/count)"
check: exact
```

## Итог

Итераторы превращают ручные циклы в читаемый конвейер `filter`→`map`→свёртка, и делают это
**zero-cost** (без промежуточных аллокаций) и **лениво** (исполнение на терминальной
операции). Замыкания — топливо конвейера, с трейтами `Fn`/`FnMut`/`FnOnce` по способу
захвата. И помни главную ловушку: `for x in v` забирает владение — пиши `&v`, если
коллекция ещё нужна. Дальше — умные указатели, когда одного владельца мало.
