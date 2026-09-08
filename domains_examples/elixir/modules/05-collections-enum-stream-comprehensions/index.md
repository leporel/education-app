---
id: elixir.collections-enum-stream-comprehensions.index
type: index
title: "Модуль 05 — Коллекции: Enum, Stream, comprehensions"
tags: [elixir, enum, stream, comprehensions, collections]
status: todo
updated: 2026-06-26
---

# Модуль 05 — Коллекции: Enum, Stream, comprehensions

> В Go ты пишешь циклы `for` руками. В Elixir циклов нет — есть `Enum` (жадные операции над
> коллекциями), `Stream` (те же операции, но ленивые) и comprehensions (`for`). Это твой
> рабочий инструмент 90% времени: `map`, `filter`, `reduce`, `group_by` — вместо ручного
> перебора с мутацией. Понять, когда `Enum`, а когда `Stream` — значит не положить узел на
> гигабайтном файле.

## Цель

После модуля ты:

1. Свободно строишь пайплайны `Enum.map/filter/reduce/...` и знаешь `reduce` как «мать всех
   свёрток».
2. Понимаешь разницу **`Enum` (жадный)** vs **`Stream` (ленивый)**: когда каждый шаг
   материализует список, а когда данные текут по одному; зачем это для больших/бесконечных
   источников.
3. Пишешь comprehensions `for` с генераторами, фильтрами, `:into` и `:reduce`.
4. Выбираешь контейнер: `Map`, `MapSet`, keyword list, `Range` — под задачу.
5. Не делаешь классических ошибок: `Enum` над бесконечным/огромным потоком, `Enum.at` в
   цикле, `++` в цикле.

## Предпосылки

- Модули 02–03 (типы данных, пайп, анонимные функции, рекурсия — `Enum` стоит на них).

## Структура

- [`theory.md`](./theory.md) — `Enum`, `reduce`, `Stream` (ленивость), comprehensions, контейнеры.
- [`cards.md`](./cards.md) — карточки.
- [`drills.md`](./drills.md) — упражнения.
- [`lessons/01-enum-stream-comprehensions.md`](./lessons/01-enum-stream-comprehensions.md) —
  пайплайны `Enum`, `reduce`, ленивый `Stream` на большом источнике, `for`-comprehension.

## Порядок прохождения

1. `theory.md`.
2. Урок `lessons/01-enum-stream-comprehensions.md`.
3. `drills.md` + карточки.
