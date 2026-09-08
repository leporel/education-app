---
id: rust.borrowing-and-lifetimes.drills
type: drills
title: "Заём и времена жизни — упражнения"
tags: [rust, borrowing, lifetimes, drills]
status: todo
updated: 2026-09-08
---

# Упражнения

## Правило заёма

```drill
type: multiple-choice
prompt: "Что нарушает правило заёма?"
options: ["let a = &v; let b = &v;", "let m = &mut v; (единственная)", "let a = &v; let m = &mut v; пока a используется дальше", "много &v без единого &mut"]
answer: "let a = &v; let m = &mut v; пока a используется дальше"
check: exact
hint: Нельзя &mut вместе с живым &.
```

```drill
type: free-form
prompt: "Объясни, почему одновременные &v и &mut v опасны (через пример с Vec::push)."
answer: "push может перевыделить буфер вектора в новое место в куче. Если в этот момент жива &-ссылка на старые данные, она станет висячей (use-after-free). Поэтому Rust запрещает &mut вместе с любым & — на компиляции."
check: manual
```

```drill
type: multiple-choice
prompt: "Какой код ошибки даёт 'cannot borrow as mutable because also borrowed as immutable'?"
options: ["E0382", "E0502", "E0106", "E0204"]
answer: "E0502"
check: exact
hint: Конфликт &mut с активным &.
```

```drill
type: free-form
prompt: "let mut v = vec![1,2,3]; let a = &v; println!(\"{a:?}\"); let m = &mut v; m.push(4); — компилируется? Почему?"
answer: "Да. Благодаря NLL заём a 'жив' только до его последнего использования (println!). К моменту &mut v ссылка a уже отжила, конфликта нет."
check: manual
hint: non-lexical lifetimes.
```

## Слайсы

```drill
type: fill-in
prompt: "Чтобы функция читала и String, и литерал, и срез — её параметр стоит сделать типа ____, а не &String."
answer: "&str"
check: fuzzy
hint: Слайс строки — самый общий вход.
```

```drill
type: free-form
prompt: "Что напечатает: let s = String::from(\"hello world\"); let w = &s[6..11]; println!(\"{w}\"); ?"
answer: "world — слайс байтов с 6 по 11 (не включая 11). w — это &str, заём части s, без копирования."
check: manual
```

## Lifetimes

```drill
type: multiple-choice
prompt: "fn longest(x: &str, y: &str) -> &str { ... } не компилируется. Что добавить?"
options: ["Ничего, элизия справится", "Параметр lifetime: fn longest<'a>(x: &'a str, y: &'a str) -> &'a str", "Обернуть результат в String", "Сделать аргументы &mut"]
answer: "Параметр lifetime: fn longest<'a>(x: &'a str, y: &'a str) -> &'a str"
check: exact
hint: Двух входных ссылок элизия не разрулит.
```

```drill
type: free-form
prompt: "Своими словами: что значит 'a в fn longest<'a>(x: &'a str, y: &'a str) -> &'a str?"
answer: "Возвращаемая ссылка заимствует из тех же данных, что x и y, и живёт не дольше меньшей из них. 'a связывает время жизни входов и выхода, гарантируя, что результат не станет висячим."
check: manual
```

## Возврат ссылок и 'static

```drill
type: free-form
prompt: "fn upper(s: &str) -> &str { let owned = s.to_uppercase(); &owned } — какая ошибка и как починить?"
answer: "error[E0515]: cannot return reference to local variable `owned` — owned умирает на выходе из функции. Починка: возвращать владеющий тип: fn upper(s: &str) -> String { s.to_uppercase() }."
check: manual
hint: Функция создала значение сама → отдаёт по значению.
```

```drill
type: multiple-choice
prompt: "Что означает ограничение T: 'static?"
options: ["Значение живёт до конца программы", "Тип не содержит заимствованных ссылок с коротким сроком (String подходит)", "Тип обязан быть ссылкой", "Тип нельзя перемещать"]
answer: "Тип не содержит заимствованных ссылок с коротким сроком (String подходит)"
check: exact
hint: Это про отсутствие заимствований, а не про «вечность».
```

## Практика заёма

```drill
type: multiple-choice
prompt: "let mut v = vec![1]; let r = &v; v.push(2); — где здесь второй заём, если амперсанд только один?"
options: ["Его нет, ошибка ложная", "В v.push(2): это Vec::push(&mut v, 2) — метод берёт &mut self неявно", "В vec![1]", "В println!"]
answer: "В v.push(2): это Vec::push(&mut v, 2) — метод берёт &mut self неявно"
check: exact
hint: Раскрывай вызовы методов в полную форму.
```

```drill
type: free-form
prompt: "Тебе нужно в одном методе читать self.name и одновременно менять self.items. Компилятор ругается, потому что метод берёт &mut self целиком. Какой приём из пятёрки применить?"
answer: "Приём 3: работать с полями напрямую вместо методов на &mut self — компилятор заимствует РАЗНЫЕ поля структуры независимо. Либо заранее вынести нужное значение в локальную переменную (let name = self.name.clone() / &self.name до мутации)."
check: manual
hint: Разные поля — разные заёмы.
```

```drill
type: fill-in
prompt: "Чтобы компилятор подробно объяснил код ошибки E0502, надо выполнить: rustc ____ E0502."
answer: "--explain"
check: fuzzy
```
