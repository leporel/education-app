---
id: japanese.hiragana.drills
type: drills
title: Хирагана — упражнения
tags: [japanese, hiragana, drills]
status: learning
updated: 2026-04-20
---

# Упражнения по хирагане

Эти задания покрывают все четыре типа drill'ов и все четыре режима проверки —
полезно для самотеста и как референс формата.

## Чтение (translate, exact)

```drill
type: translate
prompt: "Прочитай и запиши ромадзи: あお"
answer: ao
check: exact
hint: это слово означает «синий»
```

```drill
type: translate
prompt: "Прочитай и запиши ромадзи: かお"
answer: kao
check: exact
```

## Чтение с вариациями (translate, fuzzy)

Режим `fuzzy` прощает регистр, лишние пробелы и диакритику — удобен, когда важен
смысл, а не точный формат.

```drill
type: translate
prompt: "Прочитай: えき"
answer: eki
check: fuzzy
hint: «станция»
```

## Свободная транслитерация (free-form, regex)

Режим `regex` — когда правильных вариантов несколько или допустимы опечатки в
фиксированных местах. Ответ — паттерн.

```drill
type: free-form
prompt: "Запиши ромадзи для いえ (допустим любой регистр)"
answer: "^[Ii][Ee]$"
check: regex
```

## Письменный ответ с ручной проверкой (free-form, manual)

Режим `manual` — UI показывает эталон и спрашивает пользователя, засчитывать ли.
Нужен для каллиграфии/произношения, где автопроверка не работает.

```drill
type: free-form
prompt: "Напиши от руки символ お. Сравни с эталоном и отметь сам, верно ли."
answer: "Эталон: три черты — вертикаль с крюком, горизонталь, отдельный кружок справа сверху. Порядок черт важен."
check: manual
hint: кружочек справа сверху — якорь для отличия от あ
```

## Выбор из вариантов (multiple-choice)

```drill
type: multiple-choice
prompt: Какой символ читается как "ki"?
options: [か, き, く, け]
answer: き
check: exact
```

```drill
type: multiple-choice
prompt: Что означает слово あい?
options: [«дом», «любовь», «верх», «синий»]
answer: «любовь»
check: exact
```

## Заполнение пропуска (fill-in)

```drill
type: fill-in
prompt: "«Верх, над» на хирагане — ___."
answer: うえ
check: exact
```

```drill
type: fill-in
prompt: "Пара для различения: あ и ___ — главная визуальная ловушка."
answer: お
check: exact
```

## См. также

- [`theory.md`](./theory.md) — теория по хирагане.
- [`cards.md`](./cards.md) — карточки для заучивания.
- [`lessons/01-intro.md`](./lessons/01-intro.md) — первый урок.
- [`lessons/02-row-ka.md`](./lessons/02-row-ka.md) — ряд か.
