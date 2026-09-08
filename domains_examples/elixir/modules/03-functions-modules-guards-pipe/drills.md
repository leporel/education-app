---
id: elixir.functions-modules-guards-pipe.drills
type: drills
title: "Функции, модули, guards и пайп — упражнения"
tags: [elixir, functions, guards, pipe, drills]
status: todo
updated: 2026-09-08
---

# Упражнения

## Multi-clause и guards

```drill
type: multiple-choice
prompt: "Порядок clause: def f(_), do: :any; def f(0), do: :zero. Что вернёт f(0)?"
options: [":zero", ":any", "FunctionClauseError", "0"]
answer: ":any"
check: exact
hint: Clause проверяются сверху вниз; `_` стоит первым и перехватывает всё.
```

```drill
type: free-form
prompt: "Напиши multi-clause функцию sign/1: возвращает :pos для положительных, :neg для отрицательных, :zero для нуля. Используй guards."
answer: "def sign(n) when n > 0, do: :pos\ndef sign(n) when n < 0, do: :neg\ndef sign(0), do: :zero\n(порядок clause с 0 может быть любым относительно guards, т.к. они взаимоисключающие; общий :zero для n==0 можно и через clause def sign(0).)"
check: manual
```

```drill
type: multiple-choice
prompt: "Что нельзя сделать внутри guard (when ...)?"
options: ["Сравнить числа: n > 0", "Проверить тип: is_binary(x)", "Вызвать свою произвольную функцию: my_check(x)", "Булеву логику: a and b"]
answer: "Вызвать свою произвольную функцию: my_check(x)"
check: exact
hint: Guards ограничены чистыми безопасными конструкциями.
```

```drill
type: fill-in
prompt: "Функция, объявленная как `def status(200)` и `def status(404)`, если ни одна не подошла, бросит ____."
answer: "FunctionClauseError"
check: fuzzy
hint: Аналог MatchError, но для clause функции.
```

## Пайп

```drill
type: multiple-choice
prompt: "`x |> f(a) |> g()` эквивалентно чему?"
options: ["g(f(x, a))", "g(f(a, x))", "f(g(x), a)", "x.f(a).g()"]
answer: "g(f(x, a))"
check: exact
hint: Пайп подставляет левое значение первым аргументом.
```

```drill
type: free-form
prompt: "Перепиши без пайпа: `\"  Hi  \" |> String.trim() |> String.downcase()`. И объясни, почему стдлиб кладёт данные первым аргументом."
answer: "String.downcase(String.trim(\"  Hi  \")). Стдлиб делает главные данные первым аргументом, чтобы пайп подставлял их естественно и конвейер читался сверху вниз. Это «data-first»-дизайн под |>."
check: manual
```

## Анонимные функции

```drill
type: multiple-choice
prompt: "square = fn x -> x*x end. Как его вызвать?"
options: ["square(5)", "square.5", "square.(5)", "square[5]"]
answer: "square.(5)"
check: exact
hint: Анонимные функции вызываются через точку.
```

```drill
type: fill-in
prompt: "Короткая запись `fn x -> x * 3 end` через capture-синтаксис: ____."
answer: "&(&1 * 3)"
check: fuzzy
hint: &1 — первый аргумент.
```

```drill
type: multiple-choice
prompt: "Как передать существующую String.upcase/1 в Enum.map как значение?"
options: ["Enum.map(list, String.upcase)", "Enum.map(list, &String.upcase/1)", "Enum.map(list, String.upcase())", "Enum.map(list, String.upcase.())"]
answer: "Enum.map(list, &String.upcase/1)"
check: exact
hint: Захват именованной функции — & + имя + арность.
```

## Рекурсия

```drill
type: free-form
prompt: "Напиши хвостовую (с аккумулятором) функцию length_of/1, считающую длину списка. Почему аккумулятор лучше наивной рекурсии?"
answer: "def length_of(list), do: length_of(list, 0)\ndefp length_of([], acc), do: acc\ndefp length_of([_h | t], acc), do: length_of(t, acc + 1)\nАккумулятор делает рекурсивный вызов последним действием (хвостовой вызов) — BEAM не растит стек (TCO), список любой длины обработается без переполнения. Наивная `1 + length_of(t)` копит кадры стека."
check: manual
```

```drill
type: multiple-choice
prompt: "Почему в Elixir нет цикла `for i := 0; i < n; i++`?"
options: ["Это баг языка", "Из-за неизменяемости нет мутируемого счётчика; перебор делают рекурсией с аккумулятором или Enum/Stream", "for есть, просто другой синтаксис цикла со счётчиком", "Циклы запрещены на BEAM"]
answer: "Из-за неизменяемости нет мутируемого счётчика; перебор делают рекурсией с аккумулятором или Enum/Stream"
check: exact
hint: "`for` в Elixir есть, но это comprehension (модуль 05), а не C-style цикл со счётчиком."
```

## Директивы модулей

```drill
type: multiple-choice
prompt: "В модуле нужно часто звать MyApp.Accounts.User.new(). Что использовать?"
options: ["import MyApp.Accounts.User", "alias MyApp.Accounts.User — и писать User.new()", "require MyApp.Accounts.User", "use MyApp.Accounts.User"]
answer: "alias MyApp.Accounts.User — и писать User.new()"
check: exact
hint: "alias — просто сокращение имени, 95% случаев."
```

```drill
type: free-form
prompt: "Ты добавил Logger.info(\"...\") и получил ошибку про неизвестный макрос. Что забыл и почему для Enum такого не требуется?"
answer: "Забыл require Logger. Logger.info — макрос (он умеет вырезаться на этапе компиляции по уровню логирования), а макросы требуют require, чтобы компилятор раскрыл их в этом файле. Enum.map — обычная функция, ей никакие директивы не нужны, максимум alias для сокращения имени."
check: manual
```

## Дефолты и пайп

```drill
type: multiple-choice
prompt: "Функция join/2 имеет две clause и дефолт для второго аргумента. Где объявить дефолт?"
options: ["В каждой clause", "В отдельной заголовочной clause без тела", "В теле первой clause", "Дефолты с multi-clause невозможны"]
answer: "В отдельной заголовочной clause без тела"
check: exact
hint: "Иначе — «defines defaults multiple times»."
```

```drill
type: free-form
prompt: "Значение из пайпа нужно передать функции ВТОРЫМ аргументом. Как это сделать идиоматично?"
answer: "Через then/2: value |> then(fn v -> some_fun(opts, v) end). Пайп всегда подставляет значение первым аргументом, а then позволяет применить произвольную функцию и поставить значение куда нужно. Раньше для этого писали |> (fn v -> ... end).() — сейчас так не делают."
check: manual
```

```drill
type: multiple-choice
prompt: "Нужно напечатать промежуточный результат конвейера, не ломая цепочку. Что вставить?"
options: ["IO.puts(...)", "|> IO.inspect(label: \"шаг\")", "return ...", "|> Enum.each(&IO.puts/1)"]
answer: "|> IO.inspect(label: \"шаг\")"
check: exact
hint: "IO.inspect возвращает своё значение, поэтому конвейер продолжается."
```
