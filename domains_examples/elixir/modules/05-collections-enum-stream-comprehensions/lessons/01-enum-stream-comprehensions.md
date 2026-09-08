---
id: elixir.collections-enum-stream-comprehensions.lesson-01
type: lesson
title: "Урок 01 — Enum, Stream и comprehensions на практике"
tags: [elixir, enum, stream, comprehensions, reduce, lesson]
status: todo
updated: 2026-06-26
---

# Урок 01 — Enum, Stream и comprehensions на практике

Цель: уверенно строить пайплайны `Enum`, видеть в `reduce` универсальную свёртку, чувствовать
момент «здесь нужен `Stream`», и писать `for`-comprehension там, где он яснее. Якорь — Go:
каждый пример — это цикл `for`, которого мы не пишем.

## Разогрев

- Чем отличается `Enum.map` от `Stream.map` по моменту вычисления? (жадно сразу / лениво по требованию)
- Что запускает вычисление у `Stream`? (терминальная `Enum`-операция)
- `for` в Elixir — это цикл со счётчиком? (нет, comprehension: генераторы + фильтры → коллекция)

## Шаг 1. Пайплайн Enum вместо цикла for

Задача: из списка пользователей взять активных, вытащить возраст, посчитать средний.

```elixir
users = [
  %{name: "A", age: 30, active: true},
  %{name: "B", age: 20, active: false},
  %{name: "C", age: 40, active: true}
]

active_ages =
  users
  |> Enum.filter(& &1.active)        # только активные
  |> Enum.map(& &1.age)             # [30, 40]

avg = Enum.sum(active_ages) / length(active_ages)   # => 35.0
```

В Go это цикл с `if u.active`, накоплением суммы и счётчика. Здесь — конвейер. `& &1.active` —
capture-функция «достань поле active» (пробел между `&` и `&1` нужен, чтобы не спутать с
`&&1`).

## Шаг 2. reduce как универсальный инструмент

Когда готового `Enum.что-то` нет, пиши `reduce`. Сгруппируем заказы по статусу и посчитаем
суммы:

```elixir
orders = [
  %{status: :paid, total: 100},
  %{status: :paid, total: 50},
  %{status: :cancelled, total: 30}
]

totals =
  Enum.reduce(orders, %{}, fn order, acc ->
    Map.update(acc, order.status, order.total, &(&1 + order.total))
  end)
# => %{paid: 150, cancelled: 30}
```

`Map.update(acc, key, default, fun)`: если ключа нет — кладёт `default`; если есть — применяет
`fun` к старому значению. Классическая идиома агрегации. Тот же результат дал бы
`Enum.group_by` + `Enum.map`, но `reduce` показывает механику: аккумулятор-мапа, по элементу
за раз — ровно рекурсия из модуля 03.

## Шаг 3. Когда Enum мало: Stream

Представь файл-лог на много гигабайт. Нужно: найти строки с "ERROR", взять первые 5.

```elixir
# ПЛОХО: грузит весь файл в память
File.read!("app.log")
|> String.split("\n")
|> Enum.filter(&String.contains?(&1, "ERROR"))
|> Enum.take(5)

# ХОРОШО: ленивое построчное чтение, останавливается после 5 совпадений
"app.log"
|> File.stream!()                                   # ленивый поток строк
|> Stream.filter(&String.contains?(&1, "ERROR"))    # фильтр на лету, без накопления
|> Enum.take(5)                                      # терминал: тянет ровно до 5 строк
```

Ленивая версия прочитает файл ровно до пятой "ERROR"-строки и остановится; память не зависит
от размера файла. Это типовой выигрыш `Stream`: **большой/потоковый источник + ранняя
остановка**.

Бесконечные потоки — туда же:

```elixir
# первые 5 степеней двойки
Stream.iterate(1, &(&1 * 2)) |> Enum.take(5)    # => [1, 2, 4, 8, 16]

# первые 10 чётных квадратов
Stream.iterate(1, &(&1 + 1))
|> Stream.filter(&(rem(&1, 2) == 0))
|> Stream.map(&(&1 * &1))
|> Enum.take(10)
```

С `Enum` бесконечный источник просто завис бы навсегда. Со `Stream` — берём сколько надо.

> **Когда НЕ Stream.** На списке из 10 элементов `Stream` только добавит накладных расходов.
> Правило: маленькие/обычные коллекции — `Enum`; большие/бесконечные/ранняя остановка —
> `Stream`.

## Шаг 4. Comprehensions: когда for читается лучше

Декартово произведение и матч-фильтрация — territory `for`:

```elixir
# все клетки шахматной доски
for file <- ?a..?h, rank <- 1..8, do: "#{<<file>>}#{rank}"
# => ["a1", "a2", ..., "h8"]  (64 строки)

# распарсить только успешные результаты, собрать в мапу id => value
results = [{:ok, {1, "Sam"}}, {:error, :bad}, {:ok, {2, "Bob"}}]
for {:ok, {id, name}} <- results, into: %{}, do: {id, name}
# => %{1 => "Sam", 2 => "Bob"}   ({:error, :bad} отброшен матчем генератора
```

И `:reduce`-форма, когда comprehension должен свернуть, а не собрать:

```elixir
for word <- ~w(go go elixir go elixir), reduce: %{} do
  acc -> Map.update(acc, word, 1, &(&1 + 1))
end
# => %{"go" => 3, "elixir" => 2}
```

Тот же подсчёт частот, что в шаге 2 через `reduce`, — выбирай форму по вкусу и читаемости.

## Mini-drill

```drill
type: free-form
prompt: "Напиши пайплайн Enum: из списка строк ~w(go GO Rust go) посчитать, сколько раз (без учёта регистра) встречается \"go\". Подсказка: downcase + filter + count, или frequencies."
answer: "~w(go GO Rust go) |> Enum.map(&String.downcase/1) |> Enum.count(&(&1 == \"go\"))  # => 3. Альтернатива: Enum.frequencies(Enum.map(words, &String.downcase/1))[\"go\"]."
check: manual
```

```drill
type: multiple-choice
prompt: "Бесконечный источник Stream.cycle([:a,:b]). Какой код корректен и завершится?"
options: ["Enum.map(Stream.cycle([:a,:b]), &(&1))", "Stream.cycle([:a,:b]) |> Enum.take(4)", "Enum.to_list(Stream.cycle([:a,:b]))", "Enum.count(Stream.cycle([:a,:b]))"]
answer: "Stream.cycle([:a,:b]) |> Enum.take(4)"
check: exact
hint: Из бесконечного потока можно только брать конечное число (take), но не материализовать целиком.
```

```drill
type: free-form
prompt: "Перепиши через for-comprehension с :into: из мапы %{a: 1, b: 2, c: 3} оставить пары со значением > 1 и удесятерить значения, собрав в мапу."
answer: "for {k, v} <- %{a: 1, b: 2, c: 3}, v > 1, into: %{}, do: {k, v * 10}  # => %{b: 20, c: 30}. Генератор перебирает пары, фильтр v > 1 отсекает a, into: %{} собирает в мапу."
check: manual
```

## Итог

`Enum` — твой декларативный цикл (но жадный: промежуточные списки). `reduce` — универсальная
свёртка, в которой видна рекурсия с аккумулятором. `Stream` — ленивый брат `Enum` для
больших/бесконечных источников и ранней остановки (не забудь терминал!). `for` — comprehension
с генераторами, фильтрами, `:into`/`:reduce` и матч-фильтрацией. Дальше — полиморфизм:
структуры, протоколы и behaviours, то есть «интерфейсы по-эликсировски».
