---
id: typescript.functions-objects-interfaces.cards
type: cards
title: "Функции, объекты и интерфейсы — карточки"
tags: [typescript, functions, objects, interfaces, cards]
status: todo
updated: 2026-09-08
---

# Карточки

## Функции

```card
front: "Какой тип получает опциональный параметр b?: number внутри функции?"
back: number | undefined. TS заставит учесть, что b может отсутствовать. Опциональные параметры идут в конце списка.
tags: [ts, functions]
```

```card
front: Чем default-параметр (b = 10) отличается от опционального (b?)?
back: Default подставляет значение, если аргумент не передан (тип остаётся number). Опциональный оставляет undefined (тип number | undefined).
tags: [ts, functions]
```

```card
front: Как записать тип «функция (number, number) → number»?
back: "type BinOp = (a: number, b: number) => number;"
tags: [ts, functions]
```

```card
front: "Почему в [1,2,3].map((n) => n*2) не нужно писать n: number?"
back: "Контекстная типизация: тип n выводится из типа массива (number[]). Когда место назначения известно, TS подставляет типы параметров сам."
tags: [ts, inference, functions]
```

## Объекты

```card
front: Что означает readonly у свойства объекта? Это рантайм-защита?
back: «Только для чтения» на этапе компиляции — присвоить нельзя только по мнению TS. В рантайме поле обычное, физически не защищено.
tags: [ts, objects, readonly]
```

```card
front: Что такое индексная сигнатура и зачем noUncheckedIndexedAccess?
back: "[key: string]: number — описывает объект-словарь с произвольными ключами. Флаг делает доступ по ключу типом V | undefined (как v, ok := m[k] в Go)."
tags: [ts, objects, index]
```

## interface vs type

```card
front: Что умеет interface, чего не умеет type?
back: Declaration merging (повторные объявления сливаются) и расширение через extends в ООП-стиле. Зато описывает только объекты/функции.
tags: [ts, interface]
```

```card
front: Что умеет type, чего не умеет interface?
back: "Давать имя любому типу: union, кортеж, примитив, функция, шаблонный литерал, продвинутые mapped/conditional типы. Не сливается при повторе."
tags: [ts, type]
```

```card
front: Практическое правило выбора interface vs type?
back: Форма объекта / расширяемый контракт → interface. Union/кортеж/функция/alias примитива/продвинутый тип → type. Сомневаешься и это объект → interface.
tags: [ts, interface, type]
```

## Структурная совместимость и excess property check

```card
front: Когда срабатывает excess property check (ошибка про лишнее свойство)?
back: Только при присвоении объектного ЛИТЕРАЛА напрямую в типизированное место. Через промежуточную переменную лишние свойства прощаются.
tags: [ts, structural, excess]
```

```card
front: "const c: Config = { url: 'x', timeout: 5 } даёт ошибку, а через переменную — нет. Почему?"
back: Прямой литерал с лишним полем — почти всегда опечатка/ошибка, поэтому TS строг. Значение из переменной TS считает осознанным и пропускает лишнее.
tags: [ts, excess]
```

## Объект-параметр, перегрузки, readonly-массивы

```card
front: Куда ставится тип при деструктуризации параметра функции?
back: "После всей деструктуризации: function f({ a, b }: Options). Внутри { } двоеточие означает переименование, а не тип."
tags: [ts, functions, destructuring]
```

```card
front: "Зачем в function connect({ host = 'x' }: Opts = {}) нужен = {} в конце?"
back: "Чтобы функцию можно было вызвать без аргументов: деструктурировать undefined нельзя — будет ошибка."
tags: [ts, functions, destructuring]
```

```card
front: Что такое перегрузка функции в TS и что стоит попробовать раньше неё?
back: Несколько сигнатур + одна реализация (сигнатура реализации снаружи не видна). Сначала пробуют union-тип или дженерик — читаемее и лучше выводятся.
tags: [ts, overload]
```

```card
front: Что даёт readonly number[] в параметре функции?
back: "Обещание не мутировать коллекцию: мутирующих методов (push, sort) у типа нет. Обычный number[] передать можно, обратно — нет."
tags: [ts, readonly, arrays]
```

```card
front: "Какой тип у выражения u.email?.toUpperCase(), если email?: string?"
back: string | undefined. ?. не убирает undefined, а честно добавляет его в результат. Чтобы получить string — сузить (if (u.email)) или ?? 'default'.
tags: [ts, optional, narrowing]
```
