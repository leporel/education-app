---
id: japanese.katakana.drills
type: drills
title: Катакана — упражнения
tags: [japanese, katakana, drills]
status: todo
updated: 2026-04-20
---

# Упражнения по катакане

## Различение с хираганой

```drill
type: multiple-choice
prompt: Какой из символов — катакана?
options: [あ, ア, か, き]
answer: ア
check: exact
hint: катакана — из прямых линий и углов
```

```drill
type: multiple-choice
prompt: Какой из символов читается как "u" и относится к катакане?
options: [う, ウ, エ, い]
answer: ウ
check: exact
```

## Чтение заимствований

```drill
type: translate
prompt: "Прочитай заимствование: コーヒー"
answer: kōhī
check: fuzzy
hint: напиток
```

```drill
type: translate
prompt: "Прочитай имя: マリア"
answer: Maria
check: fuzzy
```

## Свободная запись (regex)

```drill
type: free-form
prompt: "Запиши ромадзи для カ (любой регистр)"
answer: "^[Kk][Aa]$"
check: regex
```
