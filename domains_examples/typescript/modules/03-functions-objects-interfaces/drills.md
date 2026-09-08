---
id: typescript.functions-objects-interfaces.drills
type: drills
title: "Функции, объекты и интерфейсы — упражнения"
tags: [typescript, functions, objects, interfaces, drills]
status: todo
updated: 2026-09-08
---

# Упражнения

## Функции

```drill
type: free-form
prompt: "Напиши функцию greet(name: string, greeting?: string), где greeting по умолчанию 'Привет'. Учти, что внутри greeting может быть undefined."
answer: "function greet(name: string, greeting = 'Привет'): string { return `${greeting}, ${name}`; } — через default параметр undefined уже не возникнет."
check: manual
hint: Можно через default-параметр, тогда тип останется string.
```

```drill
type: multiple-choice
prompt: "Какой порядок параметров корректен?"
options: ["(a?: number, b: number)", "(a: number, b?: number)", "(a?: number, b?: number, c: number)", "любой"]
answer: "(a: number, b?: number)"
check: exact
hint: Опциональные — в конце.
```

```drill
type: free-form
prompt: "Напиши тип Predicate для функции, принимающей number и возвращающей boolean. Затем функцию filterNums(arr: number[], p: Predicate): number[]."
answer: "type Predicate = (n: number) => boolean; function filterNums(arr: number[], p: Predicate): number[] { return arr.filter(p); }"
check: manual
```

## Объекты

```drill
type: free-form
prompt: "Опиши тип Product с полями id (number, readonly), title (string), discount (number, опциональное). Что будет с типом discount внутри кода?"
answer: "type Product = { readonly id: number; title: string; discount?: number }; — discount имеет тип number | undefined."
check: manual
```

```drill
type: multiple-choice
prompt: "С флагом noUncheckedIndexedAccess какой тип у scores['unknown'] для type Scores = { [k: string]: number }?"
options: ["number", "number | undefined", "unknown", "never"]
answer: "number | undefined"
check: exact
```

## interface vs type

```drill
type: multiple-choice
prompt: "Тебе нужно дать имя типу Id = string | number. Что использовать?"
options: ["interface", "type", "любое", "class"]
answer: "type"
check: exact
hint: interface не умеет union.
```

```drill
type: free-form
prompt: "В каком случае стоит выбрать interface, а не type? Назови хотя бы одну причину."
answer: "Когда описываешь форму объекта/публичный контракт, который могут расширять (extends) или нужно declaration merging — например, дополнять типы библиотеки."
check: manual
```

## Excess property check

```drill
type: free-form
prompt: "Почему const c: { url: string } = { url: 'x', port: 80 } даёт ошибку, а тот же объект через переменную const o = {...}; const c = o — нет?"
answer: "Excess property check срабатывает только на прямой объектный литерал (вероятная опечатка). Через переменную работает обычная структурная совместимость — лишнее прощается."
check: manual
```

```drill
type: multiple-choice
prompt: "Как НЕ стоит лечить ошибку excess property check?"
options: ["убрать лишнее поле", "вынести литерал в переменную", "добавить поле в тип", "написать as any"]
answer: "написать as any"
check: exact
hint: as any глушит проверку и скрывает реальную опечатку.
```

## Объект-параметр и readonly

```drill
type: free-form
prompt: "Опиши тип PaginationOptions { page (обяз.), perPage (опц.), order ('asc'|'desc', опц.) } и функцию listItems, принимающую его с дефолтами perPage=20, order='asc'."
answer: "type PaginationOptions = { page: number; perPage?: number; order?: 'asc' | 'desc' }; function listItems({ page, perPage = 20, order = 'asc' }: PaginationOptions): string { return `${page}/${perPage}/${order}`; }"
check: manual
```

```drill
type: multiple-choice
prompt: "function f({ a }: { a: number }) {} — что произойдёт при вызове f() ?"
options: ["a будет undefined", "ошибка компиляции: аргумент обязателен", "вернёт undefined", "ничего"]
answer: "ошибка компиляции: аргумент обязателен"
check: exact
hint: "Чтобы разрешить вызов без аргументов, нужен дефолт всему параметру: = {}."
```

```drill
type: free-form
prompt: "Функция average не должна мутировать входной массив. Как это выразить в типе и что перестанет компилироваться внутри?"
answer: "function average(xs: readonly number[]): number — внутри перестанут быть доступны мутирующие методы (push, sort, reverse, splice)."
check: manual
```

```drill
type: free-form
prompt: "type User = { email?: string }. Напиши выражение, дающее заглавную почту или строку 'нет' (тип результата — string)."
answer: "const mail = u.email?.toUpperCase() ?? 'нет'; — ?. даёт string | undefined, ?? убирает undefined."
check: manual
```

```drill
type: multiple-choice
prompt: "Нужна функция, которая для string возвращает string[], а для number — number[]. Что попробовать в первую очередь?"
options: ["перегрузки", "any", "дженерик или union с сужением", "две разные функции с разными именами"]
answer: "дженерик или union с сужением"
check: exact
hint: "Перегрузки — крайняя мера: с ними тяжело вызывать функцию, если аргумент сам union."
```
