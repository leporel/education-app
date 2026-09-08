---
id: typescript.advanced-types.cards
type: cards
title: "Продвинутые типы — карточки"
tags: [typescript, advanced-types, cards]
status: todo
updated: 2026-09-08
---

# Карточки

## Операторы типов

```card
front: Что делает keyof T?
back: "Возвращает union ключей типа-объекта как литеральных строк. keyof { id: number; name: string } = \"id\" | \"name\"."
tags: [ts, keyof]
```

```card
front: Что делает typeof в позиции типа (не в рантайме)?
back: Извлекает тип уже существующего значения. const config = {...}; type Config = typeof config — форма получена без ручного дублирования.
tags: [ts, typeof]
```

```card
front: Что такое indexed access type T[K]?
back: Тип значения под ключом. User["id"] → number. User[keyof User] → union всех типов значений.
tags: [ts, indexed]
```

## Mapped / conditional

```card
front: Что такое mapped type и как он читается?
back: "Преобразование всех свойств: { [K in keyof T]: ... }. «Для каждого ключа K из T возьми/измени значение». Так устроены Partial, Readonly и т.д."
tags: [ts, mapped]
```

```card
front: Как mapped type снимает модификаторы readonly или ?
back: "Префиксом минус: { -readonly [K in keyof T]: T[K] } убирает readonly; { [K in keyof T]-?: T[K] } делает обязательными."
tags: [ts, mapped]
```

```card
front: Что такое conditional type? Синтаксис.
back: "Тернарный оператор на уровне типов: T extends U ? X : Y. «Если T совместим с U → X, иначе Y»."
tags: [ts, conditional]
```

```card
front: Что делает infer в условном типе?
back: "Извлекает часть типа по шаблону. type ElementOf<T> = T extends (infer E)[] ? E : never — достаёт тип элемента массива. На infer построены ReturnType, Awaited."
tags: [ts, infer]
```

## Utility types

```card
front: Partial<T>, Required<T>, Readonly<T> — что делают?
back: Partial — все свойства опциональны; Required — все обязательны (снимает ?); Readonly — все только для чтения.
tags: [ts, utility]
```

```card
front: Pick<T, K> и Omit<T, K> — в чём разница?
back: Pick оставляет ТОЛЬКО указанные ключи; Omit оставляет ВСЕ, КРОМЕ указанных. Pick<User,'id'> vs Omit<User,'email'>.
tags: [ts, utility]
```

```card
front: Как описать тип «частичное обновление User без поля id»?
back: "Partial<Omit<User, \"id\">> — читается изнутри: убрать id (Omit), остальное сделать необязательным (Partial)."
tags: [ts, utility]
```

```card
front: ReturnType<typeof fn> и Awaited<T> — что дают?
back: ReturnType извлекает тип возврата функции; Awaited разворачивает Promise (Awaited<Promise<string>> = string).
tags: [ts, utility]
```

## as const и дисциплина

```card
front: Что делает as const?
back: "Фиксирует структуру значения как максимально узкие readonly-литералы. const x = {a:'/'} as const → { readonly a: '/' } вместо { a: string }."
tags: [ts, asconst]
```

```card
front: Главное правило про продвинутые типы (дисциплина)?
back: Тип должен прояснять намерение, а не демонстрировать виртуозность. Глубокая type-магия — для библиотек; в прикладном коде хватает дженериков и горстки utility-типов.
tags: [ts, discipline]
```

## satisfies, Exclude/Extract

```card
front: "Чем отличаются : T, as T и satisfies T?"
back: "\": T\" — сделать тип таким (расширяет вывод). \"as T\" — притвориться (без проверки). \"satisfies T\" — проверить соответствие, оставив точный выведенный тип."
tags: [ts, satisfies]
```

```card
front: Зачем satisfies, если есть аннотация типа?
back: Аннотация теряет точность (Record<string, Route> разрешит любой ключ, литералы станут string). satisfies проверяет форму, но сохраняет точные ключи и литеральные типы значений.
tags: [ts, satisfies]
```

```card
front: Exclude<T, U> и Extract<T, U> — что делают и над чем работают?
back: "Работают над union: Exclude выкидывает указанные члены, Extract оставляет только их. Для объектов аналоги — Omit и Pick."
tags: [ts, utility, union]
```

```card
front: Что значит «условные типы дистрибутивны»?
back: "Условный тип с «голым» параметром применяется к каждому члену union по отдельности, а never в union исчезает. Так работает Exclude<T, U> = T extends U ? never : T."
tags: [ts, conditional]
```
