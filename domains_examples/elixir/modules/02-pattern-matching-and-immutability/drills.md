---
id: elixir.pattern-matching-and-immutability.drills
type: drills
title: "Сопоставление с образцом и неизменяемость — упражнения"
tags: [elixir, pattern-matching, immutability, drills]
status: todo
updated: 2026-09-08
---

# Упражнения

## Match operator

```drill
type: multiple-choice
prompt: "Дано x = 7. Какое выражение бросит MatchError?"
options: ["7 = x", "x = 8", "_ = x", "8 = x"]
answer: "8 = x"
check: exact
hint: Литерал слева должен совпасть со значением справа; голая переменная — пере-связывается.
```

```drill
type: free-form
prompt: "Объясни своими словами, почему `{:ok, v} = {:error, :timeout}` падает, а `{:ok, v} = {:ok, 42}` — нет."
answer: "= сопоставляет образец слева с данными справа. В первом случае литерал-атом :ok не совпадает с :error → MatchError. Во втором :ok совпадает с :ok, а переменная v связывается с 42. Совпадение проверяется по форме И по литералам."
check: manual
```

```drill
type: fill-in
prompt: "Чтобы из `{:user, \"Sam\", 30}` достать имя и возраст, отбросив тег: `{_, name, age} = ...` свяжет name = ____ и age = ____."
answer: "\"Sam\"; 30"
check: fuzzy
hint: _ отбрасывает первый элемент.
```

```drill
type: multiple-choice
prompt: "`[a, b | rest] = [1, 2, 3, 4]` — чему равны a, b, rest?"
options: ["a=1, b=2, rest=[3,4]", "a=1, b=[2,3,4], rest=[]", "MatchError", "a=[1,2], b=3, rest=[4]"]
answer: "a=1, b=2, rest=[3,4]"
check: exact
hint: До | — отдельные элементы, после | — остаток списка.
```

## Пин и пере-связывание

```drill
type: multiple-choice
prompt: "expected = 42. Что делает `expected = 43`, а что `^expected = 43`?"
options: ["Оба бросают MatchError", "Первое пере-связывает expected на 43; второе бросает MatchError (42 ≠ 43)", "Первое бросает MatchError; второе пере-связывает", "Оба пере-связывают"]
answer: "Первое пере-связывает expected на 43; второе бросает MatchError (42 ≠ 43)"
check: exact
hint: Пин превращает переменную в литерал образца.
```

```drill
type: free-form
prompt: "У тебя `known = self()` (некий pid). Напиши образец, который пропустит только сообщение от этого pid и упадёт для любого другого. Объясни роль ^."
answer: "Например `^known = sender` (или в case: `^known -> ...`). Пин ^known означает «сопоставь со ЗНАЧЕНИЕМ known», то есть совпадёт, только если sender == known; иначе MatchError. Без пина `known = sender` пере-связало бы known и совпало бы с чем угодно."
check: manual
```

## Типы данных

```drill
type: multiple-choice
prompt: "Какой доступ безопасно вернёт nil, если ключа нет, а какой бросит KeyError?"
options: ["map[:k] вернёт nil; map.k бросит KeyError", "map.k вернёт nil; map[:k] бросит KeyError", "Оба вернут nil", "Оба бросят KeyError"]
answer: "map[:k] вернёт nil; map.k бросит KeyError"
check: exact
hint: Точка — строгая, скобки — мягкие.
```

```drill
type: multiple-choice
prompt: "Почему `String.to_atom(user_input)` опасно в боевом коде?"
options: ["Медленно работает", "Атомы не собираются GC — недоверенный ввод может исчерпать таблицу атомов и уронить узел", "Возвращает charlist", "Ломает неизменяемость"]
answer: "Атомы не собираются GC — недоверенный ввод может исчерпать таблицу атомов и уронить узел"
check: exact
hint: Используй to_existing_atom или просто строки.
```

```drill
type: free-form
prompt: "Когда выбрать кортеж, когда список, когда мапу? Дай по одному характерному применению."
answer: "Кортеж — фиксированный набор полей известной формы и быстрый доступ по позиции; идиома {:ok, value}. Список — последовательная обработка/рекурсия, дёшево добавлять в голову [x|list]. Мапа — ассоциативный доступ ключ→значение (аналог map в Go), когда нужен поиск по ключу. (Список не для индексированного доступа — он O(n).)"
check: manual
```

```drill
type: fill-in
prompt: "`String.split(\"a,b,,c\", \",\", trim: true)` — последний аргумент `trim: true` это ____ (тип структуры данных), идиома для ____."
answer: "keyword list; опций функции"
check: fuzzy
hint: "[trim: true] == [{:trim, true}]."
```

## Неизменяемость

```drill
type: multiple-choice
prompt: "list = [1,2,3]; List.delete_at(list, 0). Чему равен list после этого?"
options: ["[2, 3]", "[1, 2, 3]", "[]", "nil"]
answer: "[1, 2, 3]"
check: exact
hint: Операция возвращает новый список; исходный неизменен. Надо присвоить результат, чтобы «сохранить».
```

```drill
type: free-form
prompt: "Go-разработчик говорит: «неизменяемость значит, что каждое изменение копирует всю структуру — это же медленно». В чём он неправ?"
answer: "Structural sharing: BEAM переиспользует неизменные части. Например `[x | big_list]` создаёт новый список, который ссылается на старый big_list без копирования. Копируется только то, что реально меняется по пути к изменению, а общие неизменные части разделяются. Это безопасно именно из-за неизменяемости."
check: manual
```

## Строки и бинарники

```drill
type: free-form
prompt: "Напиши multi-clause функцию scheme/1, которая по URL возвращает :http, :https или :unknown, используя матч по префиксу строки."
answer: "def scheme(\"http://\" <> _), do: :http\ndef scheme(\"https://\" <> _), do: :https\ndef scheme(_), do: :unknown\nВ образце слева от <> обязан быть литерал известной длины."
check: manual
hint: "Порядок clause: https раньше или позже http не важен, т.к. префиксы различаются."
```

```drill
type: multiple-choice
prompt: "Что вернёт is_list(~c\"abc\") и \"abc\" == ~c\"abc\"?"
options: ["true и true", "true и false — charlist это список кодпойнтов, а не строка", "false и true", "Ошибку компиляции"]
answer: "true и false — charlist это список кодпойнтов, а не строка"
check: exact
hint: "Рабочий строковый тип — binary в двойных кавычках."
```

```drill
type: fill-in
prompt: "Список слов [\"go\", \"elixir\"] короткой записью через сигил: ____(go elixir)."
answer: "~w"
check: fuzzy
hint: "С модификатором a получились бы атомы."
```

## Сравнения

```drill
type: multiple-choice
prompt: "Что вернёт 1 == 1.0 и 1 === 1.0?"
options: ["true и true", "true и false", "false и false", "Ошибку: разные типы"]
answer: "true и false"
check: exact
hint: "=== строгое, различает целое и дробное."
```

```drill
type: free-form
prompt: "Почему `count = input || 0` работает как «значение по умолчанию», а `input and 0` может упасть?"
answer: "|| мягкий: ложью считаются только false и nil, и оператор возвращает один из операндов — если input равен nil, получим 0, иначе сам input. and строгий: он требует слева настоящий булев, и на любом другом значении (например, на числе или nil) бросит BadBooleanError."
check: manual
```

## Вложенные структуры

```drill
type: multiple-choice
prompt: "Как изменить user.address.city, не собирая всю мапу вручную?"
options: ["user.address.city = \"Питер\"", "put_in(user, [:address, :city], \"Питер\")", "Map.put(user, :city, \"Питер\")", "update(user, :city)"]
answer: "put_in(user, [:address, :city], \"Питер\")"
check: exact
hint: "Возвращается новая мапа; исходная не меняется."
```
