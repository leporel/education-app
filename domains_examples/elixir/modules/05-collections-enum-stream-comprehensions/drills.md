---
id: elixir.collections-enum-stream-comprehensions.drills
type: drills
title: "Коллекции: Enum, Stream, comprehensions — упражнения"
tags: [elixir, enum, stream, comprehensions, drills]
status: todo
updated: 2026-09-08
---

# Упражнения

## Enum и reduce

```drill
type: free-form
prompt: "Через пайп Enum: из [1..10] оставить чётные, возвести в квадрат, сложить. Напиши и дай результат."
answer: "Enum.to_list(1..10) |> Enum.filter(&(rem(&1,2)==0)) |> Enum.map(&(&1*&1)) |> Enum.sum() — или сразу с диапазоном: 1..10 |> Enum.filter(...) |> Enum.map(...) |> Enum.sum(). Чётные: 2,4,6,8,10; квадраты: 4,16,36,64,100; сумма: 220."
check: manual
```

```drill
type: multiple-choice
prompt: "Какой Enum-вызов посчитает сумму списка чисел через свёртку явно?"
options: ["Enum.map(list, 0, &+/2)", "Enum.reduce(list, 0, fn x, acc -> acc + x end)", "Enum.filter(list, &(&1+0))", "Enum.sort(list)"]
answer: "Enum.reduce(list, 0, fn x, acc -> acc + x end)"
check: exact
hint: reduce(коллекция, начальный_acc, fn элемент, acc -> ... end).
```

```drill
type: free-form
prompt: "Объясни, почему `[1,2,3] |> Enum.filter(f) |> Enum.map(g)` делает ДВА прохода и создаёт промежуточный список, а Stream-версия — нет."
answer: "Enum жадный: filter полностью обходит вход и материализует новый список, затем map обходит этот список и материализует ещё один — два прохода, промежуточный список. Stream ленив: строит рецепт и прогоняет КАЖДЫЙ элемент через filter и map за один проход по одному, без промежуточного списка; вычисление запускает терминальный Enum."
check: manual
```

## Stream

```drill
type: multiple-choice
prompt: "Сколько элементов реально обработает `1..1_000_000 |> Stream.map(&(&1+1)) |> Enum.take(2)`?"
options: ["1_000_000", "2", "0", "999_998"]
answer: "2"
check: exact
hint: "Лень + ранняя остановка: вычисляется ровно столько, сколько нужно для take(2)."
```

```drill
type: multiple-choice
prompt: "Что вернёт `Stream.map([1,2,3], &(&1*2))` САМ ПО СЕБЕ (без Enum)?"
options: ["[2,4,6]", "Ленивую Stream-структуру (рецепт), без вычисления", "Ошибку", "6"]
answer: "Ленивую Stream-структуру (рецепт), без вычисления"
check: exact
hint: Нужна терминальная операция Enum, чтобы прогнать данные.
```

```drill
type: free-form
prompt: "Надо посчитать строки с \"ERROR\" в файле на 5 ГБ. Почему File.read! + String.split + Enum плохо, а File.stream! + Stream — хорошо?"
answer: "File.read! загрузит все 5 ГБ в память (binary), затем split создаст огромный список строк, затем Enum пройдёт его — память взрывается. File.stream! читает файл ЛЕНИВО построчно; Stream.filter прогоняет каждую строку по одной без накопления; Enum.count считает на лету. Память остаётся маленькой независимо от размера файла."
check: manual
```

## Comprehensions

```drill
type: multiple-choice
prompt: "Что вернёт `for x <- 1..3, y <- 1..2, do: {x, y}`?"
options: ["[{1,1},{2,2},{3,?}]", "[{1,1},{1,2},{2,1},{2,2},{3,1},{3,2}]", "[1,2,3,1,2]", "Ошибку: два генератора нельзя"]
answer: "[{1,1},{1,2},{2,1},{2,2},{3,1},{3,2}]"
check: exact
hint: Несколько генераторов вкладываются — декартово произведение.
```

```drill
type: free-form
prompt: "Напиши comprehension, который из списка результатов [{:ok,1},{:error,:e},{:ok,3}] соберёт только успешные значения. Почему {:error,:e} не вызовет ошибку?"
answer: "for {:ok, v} <- [{:ok,1},{:error,:e},{:ok,3}], do: v  # => [1, 3]. Матч в генераторе работает как фильтр: элементы, не совпавшие с образцом {:ok, v}, просто отбрасываются, а не падают MatchError."
check: manual
```

```drill
type: fill-in
prompt: "Собрать результат comprehension в мапу вместо списка: `for {k,v} <- pairs, ____: %{}, do: {k, v}`."
answer: "into"
check: fuzzy
hint: Опция меняет тип контейнера-приёмника.
```

## Контейнеры

```drill
type: multiple-choice
prompt: "Нужен тип «множество уникальных значений» с union/member?. Что взять?"
options: ["List", "Keyword list", "MapSet", "Range"]
answer: "MapSet"
check: exact
hint: Аналог идиомы map[T]struct{} из Go, но как полноценный тип.
```

```drill
type: multiple-choice
prompt: "Почему `Enum.reduce(list, [], fn x, acc -> acc ++ [x] end)` — антипаттерн?"
options: ["reduce нельзя использовать для списков", "acc ++ [x] копирует растущий acc на каждом шаге — O(n²); надо [x | acc] и в конце reverse", "Это не скомпилируется", "++ возвращает мапу"]
answer: "acc ++ [x] копирует растущий acc на каждом шаге — O(n²); надо [x | acc] и в конце reverse"
check: exact
hint: Добавление в голову O(1), в хвост O(n).
```

## Enum на каждый день

```drill
type: multiple-choice
prompt: "Нужно распечатать каждый элемент списка; результат не нужен. Что взять?"
options: ["Enum.map(xs, &IO.puts/1)", "Enum.each(xs, &IO.puts/1)", "Enum.reduce(xs, [], ...)", "for x <- xs, do: IO.puts(x)"]
answer: "Enum.each(xs, &IO.puts/1)"
check: exact
hint: "each — ради эффекта, возвращает :ok; map строил бы ненужный список."
```

```drill
type: free-form
prompt: "Надо просуммировать список, но остановиться, как только сумма превысит 1000. Напиши через reduce_while."
answer: "Enum.reduce_while(xs, 0, fn x, acc -> if acc + x > 1000, do: {:halt, acc}, else: {:cont, acc + x} end) — {:cont, acc} продолжает обход, {:halt, acc} прекращает и возвращает накопленное."
check: manual
hint: "Обычный reduce прошёл бы всю коллекцию."
```

```drill
type: fill-in
prompt: "Посчитать, сколько раз встречается каждое слово, одной функцией: Enum.____(words)."
answer: "frequencies"
check: fuzzy
hint: "Замена ручного reduce с Map.update."
```

```drill
type: multiple-choice
prompt: "Есть список пар [{:a, 1}, {:b, 2}]. Как получить мапу?"
options: ["Enum.map(pairs, & &1)", "Enum.into(pairs, %{})", "Enum.reduce(pairs, [])", "Enum.group_by(pairs, & &1)"]
answer: "Enum.into(pairs, %{})"
check: exact
hint: "Или for {k, v} <- pairs, into: %{}, do: {k, v}."
```
