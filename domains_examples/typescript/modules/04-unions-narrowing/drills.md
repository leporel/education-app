---
id: typescript.unions-narrowing.drills
type: drills
title: "Union-типы и сужение — упражнения"
tags: [typescript, unions, narrowing, drills]
status: todo
updated: 2026-09-08
---

# Упражнения

## Union и intersection

```drill
type: free-form
prompt: "Опиши тип Padding, который может быть либо числом (px со всех сторон), либо объектом { top: number; bottom: number }."
answer: "type Padding = number | { top: number; bottom: number };"
check: manual
```

```drill
type: multiple-choice
prompt: "type T = { a: number } & { b: string }. Какой объект подходит под T?"
options: ["{ a: 1 }", "{ b: 'x' }", "{ a: 1, b: 'x' }", "{ a: 1 } или { b: 'x' }"]
answer: "{ a: 1, b: 'x' }"
check: exact
hint: "& требует оба набора свойств."
```

## Литералы

```drill
type: fill-in
prompt: "Тип HTTP-метода только из GET/POST/PUT/DELETE: type Method = ___;"
answer: "\"GET\" | \"POST\" | \"PUT\" | \"DELETE\""
check: fuzzy
```

```drill
type: free-form
prompt: "Почему move(a) даёт ошибку, если let a = 'north', а move ждёт Direction = 'north' | 'south'? Как починить минимально?"
answer: "let расширяет тип a до string. Починка: const a = 'north' (зафиксирует литеральный тип 'north'), либо аннотировать let a: Direction."
check: manual
```

## Сужение

```drill
type: free-form
prompt: "Функция format(x: number | Date): string — верни x.toFixed(2) для числа и x.toISOString() для Date. Используй сужение."
answer: "function format(x: number | Date): string { return typeof x === 'number' ? x.toFixed(2) : x.toISOString(); } — typeof сужает; в else остаётся Date."
check: manual
```

```drill
type: multiple-choice
prompt: "Чем сужать тип значения e: Error | string до Error?"
options: ["typeof e === 'Error'", "e instanceof Error", "'message' in e через as", "e === Error"]
answer: "e instanceof Error"
check: exact
hint: typeof для объектов даёт 'object', не имя класса.
```

```drill
type: free-form
prompt: "Напиши type guard isStringArray(x: unknown): x is string[], проверяющий, что x — массив строк."
answer: "function isStringArray(x: unknown): x is string[] { return Array.isArray(x) && x.every((e) => typeof e === 'string'); }"
check: manual
```

## Дискриминированные union и исчерпанность

```drill
type: free-form
prompt: "Опиши тип RemoteData<T> состояния загрузки: idle | loading | success(данные) | error(сообщение). Используй поле-тег state."
answer: "type RemoteData<T> = { state: 'idle' } | { state: 'loading' } | { state: 'success'; data: T } | { state: 'error'; message: string };"
check: manual
hint: Дженерик T — забегаем в модуль 05, но идея уже понятна.
```

```drill
type: free-form
prompt: "Объясни, как трюк с const _: never = s в default ветке switch ловит забытый case при добавлении нового варианта."
answer: "Когда обработаны все варианты, в default тип s сужается до never. Новый необработанный вариант 'протекает' в default — s уже не never, и присваивание в never перестаёт компилироваться."
check: manual
```

```drill
type: multiple-choice
prompt: "Что делает дискриминированный union лучше пары (value, error) из Go?"
options: ["он быстрее", "делает невозможные состояния непредставимыми (нельзя иметь data и error разом)", "не требует проверок", "работает в рантайме"]
answer: "делает невозможные состояния непредставимыми (нельзя иметь data и error разом)"
check: exact
```

## Границы сужения

```drill
type: free-form
prompt: "Функция f(x: string | string[]): string — верни строку как есть, а массив склей через запятую. Чем сужать?"
answer: "function f(x: string | string[]): string { return Array.isArray(x) ? x.join(', ') : x; } — typeof для массива не подходит."
check: manual
```

```drill
type: free-form
prompt: "Код: if (box.value !== null) { setTimeout(() => box.value.toUpperCase(), 100) } — почему TS ругается и как починить?"
answer: "Сужение не переносится в колбэк (значение свойства могло измениться к моменту вызова). Починка: const value = box.value; if (value !== null) setTimeout(() => value.toUpperCase(), 100)."
check: manual
```

```drill
type: multiple-choice
prompt: "Что даёт наиболее надёжное сужение свойства объекта перед асинхронным кодом?"
options: ["as", "!", "копия в локальную const", "повторная проверка после await"]
answer: "копия в локальную const"
check: exact
hint: "К const сужение прилипает: её никто не может переприсвоить."
```

```drill
type: free-form
prompt: "Напиши функцию-утверждение assertPositive(n: number): asserts n is number, бросающую Error для n <= 0. Зачем такая форма, если тип и так number?"
answer: "function assertPositive(n: number): asserts n is number { if (n <= 0) throw new Error('ожидалось положительное'); } — тип тут не меняется, поэтому честнее обычная проверка с throw: форма asserts x is T нужна, когда действительно уточняется ТИП (например, unknown → string)."
check: manual
hint: Смысл asserts — уточнение типа, а не проверка значения.
```
