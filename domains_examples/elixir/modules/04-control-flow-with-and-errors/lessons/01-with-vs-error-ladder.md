---
id: elixir.control-flow-with-and-errors.lesson-01
type: lesson
title: "Урок 01 — with против лестницы if err != nil"
tags: [elixir, with, case, errors, lesson]
status: todo
updated: 2026-06-26
---

# Урок 01 — `with` против лестницы `if err != nil`

Цель: прочувствовать, как `with` сворачивает Go-шную лестницу обработки ошибок в линейный
happy-path, и научиться разбирать `{:ok, _}`/`{:error, _}` через `case`. Сквозной пример —
оформление заказа.

## Разогрев

- Чем `<-` отличается от `=` внутри `with`? (`<-` — ранний выход при несовпадении; `=` — жёсткий матч)
- Что считается ложным в `if`? (только `false` и `nil`)
- Что вернёт `with` без `else`, если шаг не совпал? (само несовпавшее значение)

## Шаг 1. Заготовки: функции, возвращающие тегированные кортежи

```elixir
defmodule Orders do
  # Каждая функция возвращает {:ok, _} или {:error, reason}
  def find_user(0), do: {:error, :user_not_found}
  def find_user(id), do: {:ok, %{id: id, name: "User#{id}"}}

  def find_cart(%{id: id}) when rem(id, 2) == 0, do: {:error, :empty_cart}
  def find_cart(%{id: id}), do: {:ok, %{items: id, total: id * 100}}

  def charge(%{total: total}) when total > 250, do: {:error, :payment_declined}
  def charge(%{total: total}), do: {:ok, %{charged: total}}
end
```

## Шаг 2. Как это выглядело бы лестницей (вложенные case)

Без `with` последовательные шаги превращаются в «стрелку судного дня»:

```elixir
def checkout_nested(id) do
  case Orders.find_user(id) do
    {:ok, user} ->
      case Orders.find_cart(user) do
        {:ok, cart} ->
          case Orders.charge(cart) do
            {:ok, receipt} -> {:ok, receipt}
            {:error, reason} -> {:error, reason}
          end
        {:error, reason} -> {:error, reason}
      end
    {:error, reason} -> {:error, reason}
  end
end
```

Узнаёшь Go-шный `if err != nil { return err }` × 3, только с отступами вправо. Работает, но
читать больно, и обработка ошибок дублируется на каждом уровне.

## Шаг 3. То же через `with` — линейно

```elixir
def checkout(id) do
  with {:ok, user}    <- Orders.find_user(id),
       {:ok, cart}    <- Orders.find_cart(user),
       {:ok, receipt} <- Orders.charge(cart) do
    {:ok, receipt}
  else
    {:error, :user_not_found} -> {:error, "Пользователь не найден"}
    {:error, :empty_cart}     -> {:error, "Корзина пуста"}
    {:error, reason}          -> {:error, "Не удалось: #{reason}"}
  end
end
```

Happy-path читается сверху вниз как список шагов. Каждый `<-` говорит: «жду `{:ok, x}`; если
пришло — связываю и иду дальше; если нет — `with` останавливается и отдаёт это значение в
`else`». Вся обработка ошибок — в одном `else`, а не размазана.

Проверим в голове:

```elixir
Orders.checkout(1)
# find_user(1) -> {:ok, user(id:1)}
# find_cart(user id:1, нечётный) -> {:ok, cart(total:100)}
# charge(total:100 ≤ 250) -> {:ok, %{charged: 100}}
# => {:ok, %{charged: 100}}

Orders.checkout(0)    # find_user(0) -> {:error, :user_not_found}
# первый же <- не совпал → with идёт в else → {:error, "Пользователь не найден"}

Orders.checkout(2)    # find_cart(чётный id) -> {:error, :empty_cart}
# => {:error, "Корзина пуста"}

Orders.checkout(3)    # cart total = 300 > 250 → charge -> {:error, :payment_declined}
# => {:error, "Не удалось: payment_declined"}
```

Один `with`, четыре исхода, ноль вложенности.

## Шаг 4. `with` без `else`

Если тебе не нужно *преобразовывать* ошибки, `else` можно опустить — несовпавшее значение
само станет результатом:

```elixir
def checkout_passthrough(id) do
  with {:ok, user}    <- Orders.find_user(id),
       {:ok, cart}    <- Orders.find_cart(user),
       {:ok, receipt} <- Orders.charge(cart) do
    {:ok, receipt}
  end
  # при ошибке вернётся ровно тот {:error, reason}, что дал упавший шаг
end
```

Это частый идиоматичный вид: «прокинь исходную ошибку наверх как есть». Чисто, и вызывающий
дальше сам разберётся `case`'ом.

## Шаг 5. Осторожно: `=` внутри `with`

`<-` — мягкий (ранний выход). А `=` внутри `with` — **жёсткий** матч: не совпало → `MatchError`,
который `else` НЕ ловит и который уронит вызов.

```elixir
with {:ok, user} <- Orders.find_user(id),
     %{name: name} = user do          # = , не <-
  {:ok, name}
end
```

Здесь `%{name: name} = user` — мы *уверены*, что user это мапа с `:name`, и хотим достать имя.
Если вдруг нет — это баг, и `MatchError` (падение) тут уместен. Правило: `<-` для шагов,
которые *штатно* могут вернуть ошибку; `=` для «обязано совпасть, иначе сломано».

## Mini-drill

```drill
type: free-form
prompt: "Дано три функции parse/1, validate/1, save/1, каждая возвращает {:ok,_}/{:error,_}. Напиши with, который на успехе возвращает {:ok, saved}, а любую ошибку прокидывает как есть (без else)."
answer: "with {:ok, parsed} <- parse(input),\n     {:ok, valid}  <- validate(parsed),\n     {:ok, saved}  <- save(valid) do\n  {:ok, saved}\nend\nБез else несовпавший {:error, reason} от любого шага станет результатом with."
check: manual
```

```drill
type: multiple-choice
prompt: "В with шаг написан `count = String.length(name)` (через =). name оказался nil. Что произойдёт?"
options: ["with уйдёт в else", "with вернёт nil", "Исключение (FunctionClauseError/ArgumentError) — String.length не примет nil; это не ловится else", "count станет 0"]
answer: "Исключение (FunctionClauseError/ArgumentError) — String.length не примет nil; это не ловится else"
check: exact
hint: "`=` и обычные вызовы внутри with не дают «ранний выход»; только `<-` ловится else."
```

## Итог

`with` — это эликсировский ответ на лестницу `if err != nil`: последовательность шагов через
`<-`, линейный happy-path, ранний выход на первой ошибке и (опционально) централизованный
`else` для преобразования ошибок. `case` разбирает отдельные тегированные результаты, `=`
внутри `with` — для «обязано совпасть». Дальше — коллекции: `Enum`, `Stream` и
comprehensions, где пайплайны из модуля 03 раскрываются на полную.
