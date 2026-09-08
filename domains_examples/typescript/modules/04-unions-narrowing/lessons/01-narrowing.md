---
id: typescript.unions-narrowing.lesson-01
type: lesson
title: "Урок 01 — Сужение типов на практике"
tags: [typescript, narrowing, lesson]
status: todo
updated: 2026-06-26
---

# Урок 01 — Сужение типов на практике

Цель: научиться спокойно работать с union-типами, превращая «может быть что угодно из
этого» в «вот сейчас это точно вот это» — и видеть, как TS подхватывает обычные
JS-проверки.

## Разогрев

- Какие операции доступны для `number | string` до сужения?
- Чем сужают примитивы, а чем классы?
- Что такое предикат типа `x is T`?

## Шаг 1. typeof и control flow analysis

Наведи курсор на `value` в каждой ветке (в редакторе/Playground) и посмотри, какой тип
показывает TS:

```ts
function describe(value: number | string | boolean): string {
  if (typeof value === "number") {
    return `число ${value.toFixed(1)}`;     // value: number
  }
  if (typeof value === "string") {
    return `строка "${value.toUpperCase()}"`; // value: string
  }
  return `булево ${value ? "да" : "нет"}`;    // value: boolean (осталось последнее)
}
```

Заметь: ты не делаешь ничего «типового» — это обычные JS-проверки. TS читает их и сам
понимает, что в каждой ветке остаётся. Последняя ветка не требует проверки: после
отсечения `number` и `string` остаётся только `boolean`.

## Шаг 2. Сужение от null (повседневное)

```ts
function initials(name: string | null | undefined): string {
  if (!name) {
    return "??";          // сюда попадают null, undefined и "" (все falsy)
  }
  // ниже name: string
  return name.slice(0, 2).toUpperCase();
}

initials("Анна");     // "АН"
initials(null);       // "??"
initials(undefined);  // "??"
initials("");         // "??"
```

`if (!name)` отсекает все «пустые» случаи разом, и дальше TS уверен, что `name` —
непустая строка. Это самый частый паттерн в коде со `strictNullChecks`.

## Шаг 3. Сужение по свойству через `in`

```ts
type Square = { side: number };
type Circle = { radius: number };

function area(shape: Square | Circle): number {
  if ("side" in shape) {
    return shape.side ** 2;        // Square
  }
  return Math.PI * shape.radius ** 2; // Circle
}
```

`in` проверяет наличие свойства и сужает тип. Работает, когда у вариантов разные поля.
(В следующем уроке увидим, что удобнее различать варианты по специальному полю-тегу.)

## Шаг 4. Пользовательский type guard для внешних данных

Самый практичный сценарий: данные пришли извне как `unknown`, надо безопасно ввести их
в типизированный мир.

```ts
type Point = { x: number; y: number };

function isPoint(v: unknown): v is Point {
  return (
    typeof v === "object" && v !== null &&
    "x" in v && typeof (v as Record<string, unknown>).x === "number" &&
    "y" in v && typeof (v as Record<string, unknown>).y === "number"
  );
}

function handle(input: unknown) {
  if (isPoint(input)) {
    // input сужен до Point — безопасно
    console.log(input.x + input.y);
  } else {
    console.log("это не точка");
  }
}

handle({ x: 1, y: 2 });        // 3
handle({ x: 1 });              // "это не точка"
handle("nope");                // "это не точка"
```

Внутри `isPoint` мы вручную доказываем тип (приходится `as`), но снаружи получаем
чистую типобезопасность: после `if (isPoint(input))` компилятор сам знает, что это
`Point`.

## Mini-drill

```drill
type: free-form
prompt: "Функция len(x: string | unknown[]): number — верни длину. Для обоих случаев это .length, но реши через сужение typeof для строки."
answer: "function len(x: string | unknown[]): number { return typeof x === 'string' ? x.length : x.length; } — формально .length есть у обоих, но в общем случае сужают: if (typeof x === 'string') ... else (массив)."
check: manual
```

```drill
type: free-form
prompt: "Напиши type guard isNonEmptyString(v: unknown): v is string, истинный только для непустых строк."
answer: "function isNonEmptyString(v: unknown): v is string { return typeof v === 'string' && v.length > 0; }"
check: manual
```

```drill
type: multiple-choice
prompt: "После if (!value) return ... для value: string | null, какой тип у value ниже?"
options: ["string | null", "string", "null", "never"]
answer: "string"
check: exact
```

## Итог

Сужение — это то, что делает union-типы пригодными для жизни. TS понимает обычные
JS-проверки (`typeof`, `instanceof`, `in`, `=== null`, truthy) и сам уточняет тип в
каждой ветке. Для сложных случаев есть предикаты `x is T`, которыми ты вводишь внешние
`unknown`-данные в типизированный мир. Следующий шаг — научиться проектировать сами
union так, чтобы сужение было максимально удобным: дискриминированные union.
