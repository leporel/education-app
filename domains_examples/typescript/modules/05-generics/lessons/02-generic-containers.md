---
id: typescript.generics.lesson-02
type: lesson
title: "Урок 02 — Обобщённые типы и контейнеры"
tags: [typescript, generics, lesson]
status: todo
updated: 2026-06-26
---

# Урок 02 — Обобщённые типы и контейнеры

Цель: параметризовать структуры данных — написать переиспользуемые типобезопасные
контейнеры (стек, результат операции, кэш), которые работают с любым содержимым.

## Разогрев

- Чем `Box<T>` отличается от `Box` с полем `value: any`?
- Может ли метод вводить свой собственный параметр типа?
- Зачем default-параметр типа?

## Шаг 1. Простой контейнер

```ts
interface Box<T> {
  value: T;
}

const numBox: Box<number> = { value: 42 };
const strBox: Box<string> = { value: "hi" };

numBox.value.toFixed(2);    // OK — value: number
strBox.value.toUpperCase(); // OK — value: string
```

Один интерфейс — сколько угодно типобезопасных «коробок». Сравни с `{ value: any }`,
где `value` был бы дырой в типобезопасности.

## Шаг 2. Класс-стек

```ts
class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  get size(): number {
    return this.items.length;
  }
}

const nums = new Stack<number>();
nums.push(1);
nums.push(2);
nums.peek();    // 2 : number | undefined
nums.size;      // 2
nums.push("x"); // ❌ "x" не number
```

`Stack<number>` гарантирует, что внутрь попадают только числа, а наружу выходят числа
(или `undefined`, если стек пуст — честно, благодаря `strict`).

## Шаг 3. Метод со своим параметром типа

Метод может вводить **дополнительный** параметр типа, не зависящий от параметра класса.
Классика — `map`:

```ts
class Box<T> {
  constructor(public value: T) {}

  map<U>(fn: (v: T) => U): Box<U> {     // U — новый параметр метода
    return new Box(fn(this.value));
  }
}

const b = new Box(5);                   // Box<number>
const s = b.map((n) => `=${n}=`);       // Box<string>: T=number → U=string
console.log(s.value);                   // "=5="
```

`map` берёт `Box<T>` и возвращает `Box<U>`, превращая содержимое функцией. Это уже почти
функциональное программирование, и оно типобезопасно от и до.

## Шаг 4. Дженерик + дискриминированный union = типобезопасный результат

Соединим знания модулей 04 и 05 — опишем результат операции (вместо Go-шного
`(value, error)`):

```ts
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function divide(a: number, b: number): Result<number, string> {
  if (b === 0) {
    return { ok: false, error: "деление на ноль" };
  }
  return { ok: true, value: a / b };
}

const r = divide(10, 2);
if (r.ok) {
  console.log(r.value);   // здесь доступен value: number
} else {
  console.log(r.error);   // здесь доступен error: string
}
```

`Result<T, E = Error>` — обобщённый и дискриминированный одновременно. `T` —
тип успешного значения, `E` — тип ошибки (по умолчанию `Error`). Проверка `r.ok`
сужает union, и ты не можешь прочитать `value`, не доказав успех. Это типобезопасная,
проверяемая компилятором версия паттерна «значение или ошибка».

## Mini-drill

```drill
type: free-form
prompt: "Допиши класс Stack<T> методом toArray(): T[], возвращающим копию содержимого."
answer: "toArray(): T[] { return [...this.items]; } — spread делает копию, чтобы не отдать приватный массив наружу."
check: manual
```

```drill
type: free-form
prompt: "Используя Result<T, E>, напиши parseIntSafe(s: string): Result<number, string>, возвращающую ошибку для нечисловой строки."
answer: "function parseIntSafe(s: string): Result<number, string> { const n = Number(s); return Number.isNaN(n) ? { ok: false, error: `не число: ${s}` } : { ok: true, value: n }; }"
check: manual
```

```drill
type: multiple-choice
prompt: "В Box<T> метод map<U>(fn: (v: T) => U): Box<U>. Для new Box(5).map(n => n > 3) какой тип результата?"
options: ["Box<number>", "Box<boolean>", "Box<U>", "boolean"]
answer: "Box<boolean>"
check: exact
hint: fn возвращает boolean → U = boolean.
```

## Итог

Параметризовать можно любую структуру: интерфейс, класс, union. Методы умеют вводить
собственные параметры типа (`map<U>`), что открывает дорогу к функциональным
преобразованиям. А связка «дженерик + дискриминированный union» (`Result<T, E>`) даёт
типобезопасную замену Go-шному `(value, error)`, где компилятор не даст добраться до
значения, не проверив успех. Это фундамент, на котором стоит много реального TS-кода.
