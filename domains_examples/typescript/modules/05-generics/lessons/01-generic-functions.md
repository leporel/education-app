---
id: typescript.generics.lesson-01
type: lesson
title: "Урок 01 — Обобщённые функции и ограничения"
tags: [typescript, generics, lesson]
status: todo
updated: 2026-09-08
---

# Урок 01 — Обобщённые функции и ограничения

Цель: научиться писать функции, работающие с любым типом без потери типобезопасности,
и грамотно их ограничивать.

## Разогрев

- Зачем нужен дженерик, если есть `any`?
- Что значит `T extends { length: number }`?
- Когда параметр типа лишний?

## Шаг 1. От any к дженерику

Сравни три версии «обернуть значение в массив»:

```ts
// Плохо: теряем тип
function wrapAny(x: any): any[] { return [x]; }
const r1 = wrapAny(5);     // r1: any[] — тип потерян, дальше всё any

// Дженерик: тип сохраняется
function wrap<T>(x: T): T[] { return [x]; }
const r2 = wrap(5);        // r2: number[]
const r3 = wrap("hi");     // r3: string[]
```

`wrap` связывает вход и выход: «что обернули, то и в массиве». Это и есть смысл
дженерика — *связь* между типами, которую `any` уничтожает.

## Шаг 2. Несколько параметров типа

```ts
function pair<A, B>(a: A, b: B): [A, B] {
  return [a, b];
}

const p = pair("age", 30);   // p: [string, number]
const [key, value] = p;      // key: string, value: number
```

Два независимых параметра типа — и кортеж точно знает тип каждой позиции. Деструктуризация
сохраняет типы.

## Шаг 3. Ограничения раскрывают возможности

Без ограничения с `T` почти ничего не сделать. Добавим требование к форме:

```ts
function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const k of keys) {
    result[k] = obj[k];
  }
  return result;
}

const user = { id: 1, name: "Ann", age: 30, secret: "xxx" };
const publicUser = pick(user, ["id", "name"]);
// тип publicUser: { id: number; name: string } — только выбранные поля, с точными типами!
pick(user, ["nope"]);   // ❌ "nope" не ключ user
```

Здесь работают сразу две идеи: `K extends keyof T` гарантирует, что ключи реальны, а
тип результата `Pick<T, K>` автоматически содержит только выбранные поля с их точными
типами. (Утилиту `Pick` подробно разберём в модуле 06; пока — почувствуй мощь.)

## Шаг 4. Вывод типов в действии

```ts
function mapArray<T, U>(arr: T[], fn: (item: T) => U): U[] {
  return arr.map(fn);
}

const lengths = mapArray(["a", "bb", "ccc"], (s) => s.length);
// T выведен как string (из массива), U как number (из возврата fn)
// lengths: number[]
```

Обрати внимание: ни `T`, ни `U` мы не указали — TS вывел оба. И параметр `s` в колбэке
не аннотирован: его тип `string` пришёл из `T`. Это та самая «умная» цепочка вывода,
которой TS заметно превосходит ручную работу.

## Mini-drill

```drill
type: free-form
prompt: "Напиши repeat<T>(value: T, n: number): T[], возвращающую массив из n копий value."
answer: "function repeat<T>(value: T, n: number): T[] { return Array.from({ length: n }, () => value); }"
check: manual
```

```drill
type: free-form
prompt: "Напиши mapValues, преобразующую массив T[] в массив пар [T, U] через функцию (T) => U. Сигнатуру с дженериками."
answer: "function mapValues<T, U>(arr: T[], fn: (x: T) => U): [T, U][] { return arr.map((x) => [x, fn(x)]); }"
check: manual
```

```drill
type: multiple-choice
prompt: "В pair<A, B>(a: A, b: B): [A, B] для pair(true, 'x') какой тип результата?"
options: ["[boolean, string]", "[any, any]", "[A, B]", "boolean | string"]
answer: "[boolean, string]"
check: exact
```

## Шаг 5. Границы: чего дженерик не может

```ts
function create<T>(): T {
  // return new T();     // ❌ T стирается: в рантайме такого имени нет
  return null as T;      // так «работает», но это ложь компилятору
}

// правильный приём — передать фабрику
function create2<T>(factory: () => T): T {
  return factory();
}
const p1 = create2(() => ({ x: 0, y: 0 }));   // T выведен из фабрики
```

Запомни ощущение: параметр типа — это информация **для компилятора**, а не объект,
который можно позвать в рантайме.

## Итог

Дженерик-функция = код, который пишешь один раз, а используешь с любыми типами, не
теряя информации о них. Ключевые навыки: связывать типы параметрами (`<T>`, `<A, B>`),
ограничивать форму через `extends`, доверять выводу типов. Дальше — параметризуем не
функции, а сами структуры данных.
