---
id: elixir.control-flow-with-and-errors.drills
type: drills
title: "Поток управления, with и ошибки — упражнения"
tags: [elixir, control-flow, with, errors, drills]
status: todo
updated: 2026-09-08
---

# Упражнения

## case / cond / if

```drill
type: multiple-choice
prompt: "`if [] do :yes else :no end` — что вернёт?"
options: [":no — пустой список ложный", ":yes — ложь только false и nil, [] истинно", "ошибку типов", "nil"]
answer: ":yes — ложь только false и nil, [] истинно"
check: exact
hint: В Elixir falsy — лишь false и nil.
```

```drill
type: multiple-choice
prompt: "Когда уместнее cond, чем case?"
options: ["Когда разбираешь форму одного тегированного кортежа", "Когда несколько независимых булевых условий (лестница if/else-if)", "Когда нужен ровно один if", "cond и case взаимозаменяемы всегда"]
answer: "Когда несколько независимых булевых условий (лестница if/else-if)"
check: exact
hint: case матчит одно значение по образцам; cond перебирает условия.
```

```drill
type: free-form
prompt: "Почему `cond` почти всегда заканчивают веткой `true ->`?"
answer: "cond проверяет условия сверху вниз и берёт первое истинное; если ни одно не истинно — CondClauseError. Ветка `true ->` всегда истинна и стоит последней, играя роль else/default, чтобы cond не упал."
check: manual
```

## Ошибки-значения

```drill
type: multiple-choice
prompt: "Файл может отсутствовать штатно (это нормальная ветка). Что выбрать?"
options: ["File.read! и try/rescue", "File.read и матч {:ok, _}/{:error, _}", "raise при отсутствии", "if File.exists? then read"]
answer: "File.read и матч {:ok, _}/{:error, _}"
check: exact
hint: Ожидаемый сбой — мягкая функция и тегированный результат.
```

```drill
type: fill-in
prompt: "Функция `Map.fetch(m, :k)` вернёт `{:ok, v}` или `:error`. Её строгий вариант, бросающий исключение при отсутствии ключа, называется ____."
answer: "Map.fetch!"
check: fuzzy
hint: Восклицательный знак = «бросаю вместо тега ошибки».
```

## with

```drill
type: free-form
prompt: "Перепиши Go-лестницу через with: a=step1(); if err return; b=step2(a); if err return; вернуть b. (step* возвращают {:ok,_}/{:error,_})"
answer: "with {:ok, a} <- step1(),\n     {:ok, b} <- step2(a) do\n  {:ok, b}\nelse\n  {:error, reason} -> {:error, reason}\nend\nПока шаги дают {:ok,_} — идём дальше; на первой ошибке with возвращает её (через else). else можно и опустить — тогда {:error,_} просто станет результатом with."
check: manual
```

```drill
type: multiple-choice
prompt: "Внутри with шаг `{:ok, x} = risky()` (через `=`, не `<-`). risky вернул {:error, :bad}. Что произойдёт?"
options: ["with вернёт {:error, :bad}", "Сработает ветка else", "MatchError — `=` обязан совпасть и не ловится else", "x станет :bad"]
answer: "MatchError — `=` обязан совпасть и не ловится else"
check: exact
hint: Ранний выход даёт только `<-`; `=` внутри with — жёсткий матч.
```

```drill
type: multiple-choice
prompt: "Зачем в with нужен else?"
options: ["Он обязателен, без него ошибка компиляции", "Чтобы централизованно преобразовать несовпавшие значения (ошибки) в одном месте; необязателен", "Чтобы зациклить with", "Чтобы поймать MatchError от `=`"]
answer: "Чтобы централизованно преобразовать несовпавшие значения (ошибки) в одном месте; необязателен"
check: exact
hint: Без else несовпавшее значение просто становится результатом with.
```

## Исключения и философия

```drill
type: free-form
prompt: "Go-разработчик в каждой функции пишет try/rescue. Объясни, почему в Elixir это обычно антипаттерн."
answer: "В Elixir ожидаемые сбои — это значения {:error, reason}, которые разбирают сопоставлением, а не исключения. Исключения (raise/rescue) — для действительно исключительного (нарушенный инвариант/баг). А для непредвиденного часто правильнее не ловить, а дать процессу упасть — супервизор перезапустит его в чистое состояние (let it crash). Повсеместный try/rescue прячет баги и мешает изоляции сбоев."
check: manual
```

```drill
type: multiple-choice
prompt: "Что выполняет блок `after` в try?"
options: ["Только при исключении", "Только при успехе", "Всегда — и при успехе, и при исключении (как defer/finally)", "Никогда, это устаревший синтаксис"]
answer: "Всегда — и при успехе, и при исключении (как defer/finally)"
check: exact
hint: after — гарантированная очистка ресурсов.
```

## Грабли with

```drill
type: free-form
prompt: "Твой with с else ловит только {:error, :not_found}, а шаг вернул {:error, :timeout}. Что произойдёт и как починить двумя способами?"
answer: "Будет WithClauseError: несовпавшее значение не подошло ни под один образец else. Починки: 1) убрать else совсем — тогда {:error, :timeout} просто станет результатом with; 2) добавить широкую ветку error -> error (или {:error, reason} -> {:error, reason}) в конец else."
check: manual
hint: "else — это тоже сопоставление."
```

```drill
type: multiple-choice
prompt: "Два шага with возвращают одинаковый {:error, :not_found}. Как в else их различить?"
options: ["Никак, with сам подскажет шаг", "Тегировать шаги: {:user, fetch_user(id)} и матчить {:user, {:error, r}}", "Использовать = вместо <-", "Добавить try/rescue"]
answer: "Тегировать шаги: {:user, fetch_user(id)} и матчить {:user, {:error, r}}"
check: exact
hint: "with не отслеживает происхождение ошибки."
```

## Исключения

```drill
type: fill-in
prompt: "Свой тип исключения объявляют макросом ____ [:message] внутри модуля."
answer: "defexception"
check: fuzzy
```

```drill
type: multiple-choice
prompt: "Какой из трёх механизмов видит супервизор, когда его ребёнок умирает?"
options: ["raise", "throw", "exit", "return"]
answer: "exit"
check: exact
hint: "Это сигнал завершения процесса; его же шлёт Process.exit/2."
```
