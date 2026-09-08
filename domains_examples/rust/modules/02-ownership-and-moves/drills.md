---
id: rust.ownership-and-moves.drills
type: drills
title: "Владение и перемещения — упражнения"
tags: [rust, ownership, move, copy, drills]
status: todo
updated: 2026-09-08
---

# Упражнения

## Move vs Copy

```drill
type: multiple-choice
prompt: "Для какого присваивания оригинал ОСТАНЕТСЯ валидным?"
options: ["let b = a; где a: String", "let b = a; где a: Vec<i32>", "let b = a; где a: i32", "let b = a; где a: Box<u8>"]
answer: "let b = a; где a: i32"
check: exact
hint: Copy-типы целиком на стеке.
```

```drill
type: free-form
prompt: "Объясни на пальцах, почему let s2 = s1 (s1: String) делает move, а не копию — через картину stack/heap."
answer: "String хранит на стеке заголовок (ptr/len/cap), данные — в куче. Копия заголовка дала бы два указателя на одну кучу и double free при дропе обоих. Поэтому Rust инвалидирует s1 (один владелец — s2). Куча не копируется."
check: manual
```

```drill
type: multiple-choice
prompt: "Кортеж (i32, String) — Copy?"
options: ["Да, оба поля примитивны", "Нет: String не Copy, поэтому и кортеж не Copy", "Да, кортежи всегда Copy", "Только если обернуть в Box"]
answer: "Нет: String не Copy, поэтому и кортеж не Copy"
check: exact
hint: Copy у кортежа есть только если ВСЕ поля Copy.
```

## Clone

```drill
type: free-form
prompt: "Дано let a = String::from(\"x\"); нужно две независимые строки a и b. Напиши и объясни цену."
answer: "let b = a.clone(); — глубокая копия: новая аллокация в куче и копирование байт. a остаётся валиден. Цена — лишняя аллокация, поэтому в горячем коде клон заметен и обдуман."
check: manual
```

```drill
type: multiple-choice
prompt: "Уперся в E0382 (borrow of moved value). Какой первый вопрос задать себе?"
options: ["Сразу влепить .clone()", "Мне реально нужна вторая копия данных или достаточно почитать через ссылку &?", "Заменить String на i32", "Обернуть в unsafe"]
answer: "Мне реально нужна вторая копия данных или достаточно почитать через ссылку &?"
check: exact
hint: clone — не рефлекс, а осознанный выбор.
```

## Drop

```drill
type: multiple-choice
prompt: "let _a = Guard(\"A\"); let _b = Guard(\"B\"); — в каком порядке вызовется Drop в конце scope?"
options: ["A потом B", "B потом A", "Непредсказуемо", "Drop не вызовется без ручного вызова"]
answer: "B потом A"
check: exact
hint: Обратный объявлению (LIFO), как стек defer.
```

## Функции и владение

```drill
type: free-form
prompt: "fn consume(s: String){} fn main(){ let n = String::from(\"x\"); consume(n); println!(\"{n}\"); } — что не так и три способа починить?"
answer: "n перемещён в consume, после вызова невалиден (E0382). Починки: 1) consume возвращает String и присваиваем обратно; 2) consume(n.clone()); 3) изменить сигнатуру на fn consume(s: &String) и звать consume(&n) — заём, владение не отдаём."
check: manual
hint: Лучший вариант обычно — &.
```

```drill
type: fill-in
prompt: "Если функция должна лишь ПОЧИТАТЬ String, не забирая владение, её параметр стоит сделать типа ____."
answer: "&String (или &str) — ссылка"
check: fuzzy
hint: Заём вместо передачи владения.
```

## Стек и куча

```drill
type: free-form
prompt: "Объясни своими словами, что лежит на стеке, а что в куче для let v: Vec<u8> = vec![1,2,3];"
answer: "На стеке — паспорт вектора фиксированного размера: указатель на буфер, длина (3) и ёмкость. В куче — сам буфер с байтами 1,2,3. Поэтому move вектора копирует только паспорт, а drop освобождает буфер в куче."
check: manual
hint: Паспорт на стеке, данные на складе.
```

```drill
type: multiple-choice
prompt: "Почему у типа с полем String не может быть Copy?"
options: ["Так решили авторы языка", "Побайтовая копия дала бы два владельца одной аллокации в куче → double free", "String слишком большая", "Copy работает только для чисел"]
answer: "Побайтовая копия дала бы два владельца одной аллокации в куче → double free"
check: exact
hint: Смотри, владеет ли тип кучей.
```

```drill
type: multiple-choice
prompt: "Какой тип у литерала \"hello\"?"
options: ["String", "&'static str — ссылка на данные в бинарнике", "Vec<u8>", "char"]
answer: "&'static str — ссылка на данные в бинарнике"
check: exact
hint: Аллокации здесь нет вообще.
```

## Частичное перемещение

```drill
type: free-form
prompt: "struct User { name: String, age: u32 } — после let n = u.name; что можно и что нельзя делать с u?"
answer: "Можно читать u.age (u32 — Copy). Нельзя использовать u.name и нельзя двигать/использовать u как целое (use of partially moved value). Если нужны оба поля — разобрать сразу: let User { name, age } = u;"
check: manual
hint: Компилятор считает владение по полям.
```
