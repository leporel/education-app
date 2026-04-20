---
id: <domain>.<module-slug>.drills
type: drills
title: <Название модуля> — упражнения
tags: [<domain>, <module-tag>, drills]
status: todo
updated: YYYY-MM-DD
---

# Упражнения

Каждое упражнение — fenced-блок с языком `drill`.

Поля:
- `type`: `translate` | `fill-in` | `multiple-choice` | `free-form`
- `prompt`: текст задания
- `answer`: ожидаемый ответ (или список через `|`)
- `check`: `exact` | `fuzzy` | `regex` | `manual`
- `hint`: опционально
- для `multiple-choice` — `options: [a, b, c, d]`

## <Блок упражнений 1>

```drill
type: translate
prompt: <задание>
answer: <эталон>
check: fuzzy
```

```drill
type: multiple-choice
prompt: <вопрос>
options: [<a>, <b>, <c>, <d>]
answer: <b>
check: exact
```

```drill
type: fill-in
prompt: "Завтра я ___ в магазин."
answer: пойду | схожу
check: fuzzy
```
