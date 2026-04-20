# Card / drill / lesson snippets

## Card

Minimal:

~~~
```card
front: <вопрос>
back: <ответ>
```
~~~

Full:

~~~
```card
front: <вопрос>
back: <ответ>
hint: <подсказка>
tags: [<tag1>, <tag2>]
```
~~~

## Drill

Translate (fuzzy match — допускает пунктуацию/регистр/синонимы при проверке в UI):

~~~
```drill
type: translate
prompt: 'Переведи: "<исходник>"'
answer: <эталон>
check: fuzzy
```
~~~

Fill-in (несколько допустимых ответов через `|`):

~~~
```drill
type: fill-in
prompt: "<текст с ___ пропуском>"
answer: вариант1 | вариант2
check: fuzzy
```
~~~

Multiple-choice:

~~~
```drill
type: multiple-choice
prompt: <вопрос>
options: [<a>, <b>, <c>, <d>]
answer: <правильный>
check: exact
```
~~~

Free-form (ручная проверка, UI покажет ответ пользователю для самопроверки):

~~~
```drill
type: free-form
prompt: <открытый вопрос>
answer: <эталонный ответ или критерии>
check: manual
```
~~~

Regex check (строгая техническая проверка, напр. синтаксис):

~~~
```drill
type: fill-in
prompt: <задание>
answer: ^\s*SELECT\s+\*\s+FROM\s+users\s*;?\s*$
check: regex
```
~~~

## Lesson skeleton

```markdown
---
id: <domain>.<module>.lesson-NN
type: lesson
title: Урок NN — <тема>
tags: [<domain>, <module-tag>, lesson]
status: todo
updated: YYYY-MM-DD
---

# Урок NN — <тема>

## Разогрев
## Новая тема
## Разобранные примеры
## Mini-drill
## Итог
```
