---
id: elixir.functions-modules-guards-pipe.lesson-01
type: lesson
title: "Урок 01 — Multi-clause, guards и пайп"
tags: [elixir, multiclause, guards, pipe, recursion, lesson]
status: todo
updated: 2026-06-26
---

# Урок 01 — Multi-clause, guards и пайп

Цель: научиться писать функции «по-эликсировски» — диспетч через multi-clause вместо
`if/switch`, guards для условий, пайп для конвейеров, и рекурсию с аккумулятором вместо
цикла. Якорь — Go: тот же код, но без `switch`, `for` и временных переменных.

## Разогрев

- Как выбирается нужная clause из нескольких? (сверху вниз, первая совпавшая по образцу+guard)
- Чем `f.(x)` отличается от `f(x)`? (точка — вызов анонимной функции-значения)
- Что подставляет пайп `x |> f(y)`? (x первым аргументом: `f(x, y)`)

## Шаг 1. От switch к multi-clause

Go-шный разбор статуса:

```go
// Go
func statusText(code int) string {
    switch {
    case code == 200: return "OK"
    case code == 404: return "Not Found"
    case code >= 500: return "Server Error"
    default:          return "Unknown"
    }
}
```

Elixir разносит ветки по «головам» функции:

```elixir
defmodule Http do
  def status_text(200), do: "OK"
  def status_text(404), do: "Not Found"
  def status_text(code) when code >= 500, do: "Server Error (#{code})"
  def status_text(_code), do: "Unknown"
end

Http.status_text(200)   # => "OK"
Http.status_text(503)   # => "Server Error (503)"
Http.status_text(301)   # => "Unknown"
```

Образец `200`/`404` сопоставляется с аргументом; guard `when code >= 500` ловит диапазон;
`_code` — «всё остальное». Читается как таблица решений. **Порядок важен**: переставь `_code`
наверх — и он перехватит всё, остальные ветки умрут (компилятор, кстати, предупредит о
недостижимой clause).

## Шаг 2. Диспетч по тегированному результату

Та самая конвенция `{:ok, _}` / `{:error, _}` из модуля 02 раскрывается тут во всей красе:

```elixir
defmodule Account do
  def withdraw(balance, amount) when amount <= balance do
    {:ok, balance - amount}
  end

  def withdraw(_balance, _amount) do
    {:error, :insufficient_funds}
  end

  # отдельная функция, диспетчеризующая по результату:
  def describe({:ok, new_balance}), do: "Остаток: #{new_balance}"
  def describe({:error, reason}),   do: "Отказ: #{reason}"
end

Account.withdraw(100, 30) |> Account.describe()   # => "Остаток: 70"
Account.withdraw(100, 200) |> Account.describe()  # => "Отказ: insufficient_funds"
```

Заметь: ни одного `if`. Бизнес-условие («хватает ли денег») выражено guard'ом на clause, а
разбор результата — сопоставлением. И всё это соединено пайпом.

## Шаг 3. Пайп-конвейеры

Сравни матрёшку и конвейер — поведение одинаковое, читаемость нет:

```elixir
# изнутри наружу (как в Go: f(g(h(x))))
Enum.sum(Enum.map(Enum.filter([1, -2, 3, -4], fn x -> x > 0 end), fn x -> x * x end))

# конвейером
[1, -2, 3, -4]
|> Enum.filter(fn x -> x > 0 end)   # [1, 3]
|> Enum.map(fn x -> x * x end)      # [1, 9]
|> Enum.sum()                       # 10
```

И покороче, через capture:

```elixir
[1, -2, 3, -4]
|> Enum.filter(&(&1 > 0))
|> Enum.map(&(&1 * &1))
|> Enum.sum()
```

Правило пайпа одно: левое значение становится **первым** аргументом правой функции. Поэтому
`Enum.filter(list, fun)` и работает с пайпом — `list` первым. Если функция ждёт данные не
первым аргументом, пайп станет неуклюжим — это сигнал, что функция спроектирована не
«data-first».

## Шаг 4. Анонимные функции: fn и &

```elixir
# полная форма
add = fn a, b -> a + b end
add.(2, 3)            # => 5  (точка!)

# capture
inc = &(&1 + 1)
inc.(9)              # => 10

# захват именованной функции
upcase = &String.upcase/1
upcase.("hi")        # => "HI"
Enum.map(["a", "b"], &String.upcase/1)   # => ["A", "B"]
```

Частая ошибка из Go-головы — звать `add(2, 3)`: это попытка вызвать **именованную** функцию
`add/2`, которой нет. Анонимная функция — значение в переменной, и вызывается через `.()`.

## Шаг 5. Рекурсия вместо цикла

Задача: суммировать положительные числа списка. В Go — `for` с аккумулятором-переменной. В
Elixir — рекурсия с аккумулятором-аргументом:

```elixir
defmodule Pos do
  def sum(list), do: sum(list, 0)             # вход: заводим аккумулятор

  defp sum([], acc), do: acc                   # база: список пуст → отдаём acc
  defp sum([h | t], acc) when h > 0,           # шаг: голова положительна — прибавить
    do: sum(t, acc + h)
  defp sum([_h | t], acc),                      # шаг: иначе — пропустить голову
    do: sum(t, acc)
end

Pos.sum([1, -2, 3, -4, 5])   # => 9
```

Три clause: база + два варианта шага (положительная голова / прочая). Аккумулятор
`acc` — неизменяемый: каждый вызов получает *новое* значение, мутации нет. Рекурсивный
вызов стоит последним → хвостовой → стек не растёт.

На практике это короче через `Enum`:

```elixir
[1, -2, 3, -4, 5] |> Enum.filter(&(&1 > 0)) |> Enum.sum()   # => 9
```

…но `Enum` внутри устроен ровно так — рекурсия по списку. Понимать механизм важно: на нём
же стоит цикл состояния процесса в модуле 07.

## Mini-drill

```drill
type: free-form
prompt: "Перепиши на Elixir Go-функцию: для чётного n вернуть :even, для нечётного :odd (n — целое). Используй guard rem/2."
answer: "def parity(n) when rem(n, 2) == 0, do: :even\ndef parity(_n), do: :odd\n(или вторая clause с guard rem(n,2)==1). rem(n,2) разрешён в guard — это безопасная арифметика."
check: manual
```

```drill
type: multiple-choice
prompt: "double = &(&1 * 2). Какой вызов корректен?"
options: ["double(21)", "double 21", "double.(21)", "double[21]"]
answer: "double.(21)"
check: exact
hint: Анонимные функции — через точку.
```

```drill
type: free-form
prompt: "Почему `[1,2,3] |> Enum.sum` работает, а если бы Enum.sum принимал список ВТОРЫМ аргументом — пайп стал бы неудобным?"
answer: "Пайп подставляет левое значение первым аргументом. Enum.sum(list) ждёт список первым — пайп ложится идеально. Если бы сигнатура была sum(opts, list), пайп подставил бы список на место opts — пришлось бы ломать конвейер или городить анонимную функцию. Поэтому стдлиб «data-first»."
check: manual
```

## Итог

Функции в Elixir — это pattern matching в действии: **multi-clause** заменяет `if/switch`,
**guards** добавляют условия на значения, **пайп** превращает вложенные вызовы в конвейер
(потому стдлиб «data-first»), **анонимные функции** зовутся через `.()`, а **рекурсия с
аккумулятором** заменяет цикл (с хвостовым вызовом — без роста стека). Дальше — поток
управления и обработка ошибок: `case`, `cond`, `with` и конвенция `{:ok, _}`/`{:error, _}`
против `if err != nil`.
