---
id: typescript.generics.drills
type: drills
title: "Дженерики — упражнения"
tags: [typescript, generics, drills]
status: todo
updated: 2026-09-08
---

# Упражнения

## Базовые дженерики

```drill
type: free-form
prompt: "Напиши дженерик-функцию last<T>(arr: T[]): T | undefined, возвращающую последний элемент."
answer: "function last<T>(arr: T[]): T | undefined { return arr[arr.length - 1]; }"
check: manual
```

```drill
type: free-form
prompt: "Напиши identity<T>(x: T): T и объясни, нужен ли тут дженерик."
answer: "function identity<T>(x: T): T { return x; } — дженерик нужен: T связывает вход и выход (что пришло, то и вернётся с тем же типом)."
check: manual
```

```drill
type: multiple-choice
prompt: "const r = first([1, 2, 3]) для function first<T>(arr: T[]): T | undefined. Какой тип у r?"
options: ["number", "number | undefined", "T", "any"]
answer: "number | undefined"
check: exact
```

## Ограничения

```drill
type: free-form
prompt: "Напиши pluck<T, K extends keyof T>(items: T[], key: K): T[K][] — массив значений свойства key из каждого элемента."
answer: "function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] { return items.map((it) => it[key]); }"
check: manual
hint: K extends keyof T гарантирует существование ключа.
```

```drill
type: multiple-choice
prompt: "longest<T extends { length: number }>(a, b). Какой вызов даст ошибку?"
options: ["longest('a', 'bb')", "longest([1], [1,2])", "longest(5, 10)", "longest('x', 'yz')"]
answer: "longest(5, 10)"
check: exact
hint: У number нет свойства length.
```

```drill
type: free-form
prompt: "Почему longest(5, 10) не компилируется, хотя у чисел вроде бы есть 'длина' в обыденном смысле?"
answer: "У примитива number нет свойства length (это не строка/массив). Ограничение T extends { length: number } требует именно свойство length, которого у числа нет."
check: manual
```

## Лишние дженерики

```drill
type: multiple-choice
prompt: "function logLen<T extends { length: number }>(x: T): void { console.log(x.length); } — дженерик здесь:"
options: ["необходим", "лишний, T встречается один раз и ни с чем не связан", "ускоряет код", "нужен для вывода типов"]
answer: "лишний, T встречается один раз и ни с чем не связан"
check: exact
hint: "Проще: (x: { length: number }) => void."
```

## Контейнеры

```drill
type: free-form
prompt: "Опиши generic-интерфейс Result<T, E> = { ok: true; value: T } | { ok: false; error: E } (дискриминированный + дженерик). Это тип результата операции."
answer: "type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };"
check: manual
hint: Совмещаем модуль 04 и 05.
```

```drill
type: free-form
prompt: "Допиши класс Stack<T> методом peek(): T | undefined, возвращающим верхний элемент без удаления."
answer: "peek(): T | undefined { return this.items[this.items.length - 1]; }"
check: manual
```

```drill
type: multiple-choice
prompt: "const s = new Stack<string>(); s.push(42); — что произойдёт?"
options: ["ОК", "ошибка компиляции: 42 не string", "ошибка в рантайме", "42 преобразуется в '42'"]
answer: "ошибка компиляции: 42 не string"
check: exact
```

## Дженерики и рантайм

```drill
type: multiple-choice
prompt: "function make<T>(): T { return new T(); } — что скажет компилятор?"
options: ["всё нормально", "ошибка: T существует только как тип, не как значение", "ошибка только в strict", "предупреждение"]
answer: "ошибка: T существует только как тип, не как значение"
check: exact
hint: Типы стираются — в рантайме имени T нет.
```

```drill
type: free-form
prompt: "Перепиши идею «создать n экземпляров T» так, чтобы это компилировалось."
answer: "function makeList<T>(factory: () => T, n: number): T[] { return Array.from({ length: n }, factory); } — вместо new T() передаём фабрику."
check: manual
```

```drill
type: free-form
prompt: "Объясни на примере first(), почему вариант с any хуже варианта с <T>."
answer: "first(arr: any[]): any возвращает any — дальше компилятор перестаёт проверять что угодно (a.toFixed(2) на строке пройдёт). first<T>(arr: T[]): T | undefined сохраняет тип, ошибка ловится сразу."
check: manual
```
