---
id: elixir.collections-enum-stream-comprehensions.cards
type: cards
title: "Коллекции: Enum, Stream, comprehensions — карточки"
tags: [elixir, enum, stream, comprehensions, cards]
status: todo
updated: 2026-09-08
---

# Карточки

## Enum

```card
front: Что такое Enum и что он заменяет из Go?
back: "Модуль функций над любым перечислимым (Enumerable): map/filter/reduce/sort/group_by и т.д. Заменяет ручные циклы for: вместо мутации счётчика/аккумулятора описываешь, ЧТО сделать с коллекцией. Декларативно."
tags: [elixir, enum]
```

```card
front: Главный минус цепочки Enum на больших данных?
back: Каждый шаг Enum создаёт новый ПОЛНЫЙ список. filter материализует список, потом map материализует ещё один. Лишние проходы и аллокации. На больших данных — использовать Stream (ленивый, без промежуточных списков).
tags: [elixir, enum, performance]
```

```card
front: Что делает Enum.reduce и почему он «мать всех свёрток»?
back: Берёт коллекцию, начальный аккумулятор и функцию (элемент, acc) -> новый_acc. map/filter/sum/count — частные случаи reduce. Это обобщённая рекурсия с аккумулятором из модуля 03.
tags: [elixir, reduce]
```

```card
front: Как посчитать частоты слов через reduce?
back: Enum.reduce(words, %{}, fn w, acc -> Map.update(acc, w, 1, &(&1 + 1)) end). Аккумулятор — мапа слово→счётчик; Map.update с дефолтом 1 инкрементит существующее или ставит 1.
tags: [elixir, reduce, map]
```

## Stream

```card
front: Чем Stream отличается от Enum?
back: "Stream предоставляет те же операции, но ленивые: ничего не вычисляет, пока не понадобится результат. Прогоняет элементы по одному через всю цепочку без промежуточных списков. Вычисление запускает терминальная Enum-операция (to_list/take/sum)."
tags: [elixir, stream]
```

```card
front: Когда брать Stream вместо Enum?
back: Когда источник большой/бесконечный, нужна ранняя остановка (take), или хочешь избежать промежуточных списков в длинной цепочке. На маленьких данных Enum проще и даже быстрее (ленивость не бесплатна). Не «всегда Stream».
tags: [elixir, stream, enum]
```

```card
front: Что выведет `1..1_000_000 |> Stream.map(&(&1*2)) |> Enum.take(3)` и почему это важно?
back: "[2, 4, 6]. Stream обработает ровно 3 элемента, а не миллион — лень + ранняя остановка. С Enum.map тот же код сначала построил бы список из миллиона удвоенных, потом взял три."
tags: [elixir, stream, lazy]
```

```card
front: Что общего у Stream с конвейером горутин/каналов в Go и в чём разница?
back: "Общее: данные текут по одному, обрабатываются на лету (ленивый конвейер). Разница: Stream — это просто ленивость в ОДНОМ процессе, без конкурентности. Параллельную обработку даёт Task.async_stream, а не Stream сам по себе."
tags: [elixir, stream, go, concurrency]
```

```card
front: Что будет, если у Stream забыть терминальную операцию?
back: Ничего не вычислится. Цепочка Stream.map |> Stream.filter — это «ленивый рецепт» (структура), а не результат. Нужен Enum.to_list/take/sum/count, чтобы прогнать данные.
tags: [elixir, stream, pitfall]
```

## Comprehensions

```card
front: Что такое for в Elixir (это не цикл со счётчиком)?
back: "Comprehension: генераторы `x <- enum` + фильтры (булевы выражения) → новая коллекция. Несколько генераторов вкладываются (декартово произведение). Например `for x <- 1..3, y <- 1..3, do: {x,y}`."
tags: [elixir, comprehension, for]
```

```card
front: Что делают :into и :reduce в comprehension?
back: ":into меняет тип результирующего контейнера (например into: %{} собирает в мапу вместо списка). :reduce превращает for в свёртку с аккумулятором. По умолчанию for собирает список."
tags: [elixir, comprehension]
```

```card
front: "Что вернёт `for {:ok, v} <- [{:ok,1},{:error,:x},{:ok,3}], do: v`?"
back: "[1, 3]. Несовпавшие с образцом генератора элементы (тут {:error,:x}) просто ОТБРАСЫВАЮТСЯ, а не падают. Матч в генераторе работает как фильтр."
tags: [elixir, comprehension, match]
```

## Контейнеры

```card
front: Что такое MapSet и аналог в Go?
back: "Тип-множество уникальных значений: MapSet.new, member?, union/intersection. Аналог идиомы map[T]struct{} в Go, но как полноценный тип с операциями над множествами."
tags: [elixir, mapset, set]
```

```card
front: Почему `acc ++ [x]` в свёртке — плохо, а `[x | acc]` — хорошо?
back: ++ конкатенирует в хвост, копируя левый список — O(n), в цикле O(n²). Добавление в голову [x | acc] — O(1). Накапливай в голову, в конце Enum.reverse, либо используй reduce/for напрямую.
tags: [elixir, list, performance]
```

## Enum на каждый день

```card
front: "Enum.each или Enum.map — когда что?"
back: "each нужен только ради побочного эффекта (печать, отправка) и возвращает :ok. map возвращает новый список результатов. Использовать map ради эффекта и выбрасывать результат — лишняя работа и путаница для читателя."
tags: [elixir, enum]
```

```card
front: "Как свернуть коллекцию с досрочным выходом?"
back: "Enum.reduce_while(enum, acc0, fn x, acc -> {:cont, new_acc} | {:halt, acc} end). {:cont, acc} продолжает обход, {:halt, acc} останавливает и возвращает acc. Обычный reduce всегда проходит всё до конца."
tags: [elixir, reduce, reduce-while]
```

```card
front: "Чем полезны frequencies, group_by и split_with?"
back: "frequencies(enum) считает, сколько раз встретился каждый элемент (частоты одной функцией вместо reduce с Map.update). group_by(enum, fun) собирает мапу ключ → список элементов. split_with(enum, fun) делит на два списка: подошедшие и остальные."
tags: [elixir, enum, aggregate]
```

```card
front: "Что делают Enum.into/2 и опция :into в comprehension?"
back: "Собирают перечислимое в другой контейнер через протокол Collectable: Enum.into(pairs, %{}) даст мапу, а for ..., into: %{}, do: {k, v} — то же самое внутри comprehension. Так превращают список пар в мапу, поток в множество и т.д."
tags: [elixir, enum, collectable]
```

## Перечислимость

```card
front: "Почему Enum одинаково работает со списком, мапой, Range и Stream?"
back: "Все они реализуют протокол Enumerable (модуль 06) — «по мне можно пройтись». Enum написан против протокола, а не против конкретного типа; поэтому свой тип тоже можно сделать перечислимым, реализовав Enumerable."
tags: [elixir, enumerable, protocol]
```
