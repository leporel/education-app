---
id: elixir.protocols-behaviours-structs.lesson-01
type: lesson
title: "Урок 01 — Протоколы и behaviours на практике"
tags: [elixir, structs, protocols, behaviours, lesson]
status: todo
updated: 2026-06-26
---

# Урок 01 — Протоколы и behaviours на практике

Цель: на одном сквозном примере увидеть три механизма — структуру, протокол (диспетч по
данным) и behaviour (контракт модуля) — и понять, какой из них в каком месте Go-интерфейса
сидит. Делаем мини-систему уведомлений.

## Разогрев

- Структура — это что под капотом? (мапа с тегом `__struct__`)
- Протокол диспетчеризуется по чему? (по типу первого аргумента, в рантайме)
- Behaviour — это полиморфизм по чему? (по модулю)

## Шаг 1. Структуры с тегом типа

```elixir
defmodule Email do
  defstruct [:to, :subject, :body]
end

defmodule SMS do
  defstruct [:phone, :text]
end

defmodule Push do
  defstruct [:device_token, :title, :message]
end
```

Три разных типа сообщений. Каждый — мапа с тегом (`%Email{}`, `%SMS{}`, `%Push{}`), и матч по
тегу позволит различать их в multi-clause.

## Шаг 2. Протокол: «как отрендерить ЛЮБОЕ сообщение»

Нам нужно единое действие `render/1` для разных типов данных. Это полиморфизм по данным →
протокол.

```elixir
defprotocol Renderable do
  @doc "Краткий текст для лога/превью."
  def render(message)
end

defimpl Renderable, for: Email do
  def render(%Email{to: to, subject: s}), do: "Email → #{to}: #{s}"
end

defimpl Renderable, for: SMS do
  def render(%SMS{phone: p, text: t}), do: "SMS → #{p}: #{t}"
end

defimpl Renderable, for: Push do
  def render(%Push{title: title}), do: "Push: #{title}"
end
```

```elixir
Renderable.render(%Email{to: "a@b.c", subject: "Привет"})  # => "Email → a@b.c: Привет"
Renderable.render(%SMS{phone: "+1", text: "ok"})           # => "SMS → +1: ok"
```

Реализация выбирается **по типу значения в рантайме**. И — фокус, недоступный Go-интерфейсам —
можно добавить рендер для **чужого** типа, не трогая его код:

```elixir
defimpl Renderable, for: BitString do
  def render(s), do: "Raw: #{s}"
end

Renderable.render("просто строка")   # => "Raw: просто строка"
```

> **Go-контраст.** В Go, чтобы `string` удовлетворял интерфейсу, ты не можешь добавить ему
> метод (тип чужой). В Elixir `defimpl ... for: BitString` расширяет поведение встроенного
> типа снаружи. Это open polymorphism.

## Шаг 3. Behaviour: «контракт для модулей-каналов доставки»

Теперь другая ось полиморфизма: разные **модули**, которые умеют *доставлять* сообщение по
своему каналу. Это контракт модуля → behaviour.

```elixir
defmodule Channel do
  @callback deliver(message :: struct()) :: :ok | {:error, term()}
  @callback name() :: String.t()
end

defmodule EmailChannel do
  @behaviour Channel

  @impl Channel
  def deliver(%Email{} = msg), do: IO.puts("отправляю #{Renderable.render(msg)}") && :ok

  @impl Channel
  def name(), do: "email"
end

defmodule SMSChannel do
  @behaviour Channel

  @impl Channel
  def deliver(%SMS{} = msg), do: IO.puts("шлю #{Renderable.render(msg)}") && :ok

  @impl Channel
  def name(), do: "sms"
end
```

`@behaviour Channel` включает проверку: забудь `name/0` — компилятор предупредит. `@impl
Channel` помечает реализацию колбэка (опечатка в имени поймается). Модули взаимозаменяемы,
потому что соблюдают один контракт.

## Шаг 4. Используем оба вместе

Behaviour позволяет выбирать канал-модуль динамически, протокол — единообразно рендерить
данные:

```elixir
defmodule Dispatcher do
  @spec send_via(module(), struct()) :: :ok | {:error, term()}
  def send_via(channel_module, message) do
    # channel_module — любой модуль, реализующий behaviour Channel
    channel_module.deliver(message)
  end
end

Dispatcher.send_via(EmailChannel, %Email{to: "x@y.z", subject: "Hi"})
# печатает: отправляю Email → x@y.z: Hi  ; возвращает :ok
Dispatcher.send_via(SMSChannel, %SMS{phone: "+1", text: "yo"})
# печатает: шлю SMS → +1: yo ; :ok
```

`channel_module` — это просто атом-имя модуля, переданный как значение (модули — атомы,
модуль 02). `Dispatcher` не знает конкретных каналов, только контракт `Channel`. Это и есть
«подключаемые стратегии» — классическое применение behaviours (и ровно так устроен OTP:
ты передаёшь свой модуль-реализатор в `GenServer`/`Supervisor`).

## Шаг 5. Когда что

- Нужно **одно действие для разных типов данных** (render, encode, size) → **протокол**.
- Нужен **взаимозаменяемый модуль под общий контракт** (канал доставки, парсер, OTP-сервер)
  → **behaviour**.
- Нужны **данные с фиксированными полями и тегом типа** → **структура**.

Go свёл бы это всё к интерфейсам; Elixir даёт три специализированных инструмента, и каждый
точнее в своей нише.

## Mini-drill

```drill
type: multiple-choice
prompt: "Хочешь, чтобы любой свой тип данных умел отдавать свой «вес» через одну функцию weight/1. Что выбрать?"
options: ["Behaviour weight", "Протокол с def weight(value) и defimpl для каждого типа", "defstruct weight", "if/case по типу"]
answer: "Протокол с def weight(value) и defimpl для каждого типа"
check: exact
hint: Одно действие, много типов данных, диспетч по типу — это протокол.
```

```drill
type: free-form
prompt: "Почему `Dispatcher.send_via/2` принимает channel_module первым аргументом-атомом, и как это связано с behaviour Channel?"
answer: "Имена модулей в Elixir — атомы, их можно передавать как значения. send_via получает модуль, реализующий behaviour Channel, и вызывает channel_module.deliver(message). Behaviour гарантирует, что у любого такого модуля есть deliver/1 (и name/0) с нужной подписью, поэтому Dispatcher работает с любым каналом, не зная конкретного — полиморфизм по модулю. Так же OTP принимает твой модуль-реализатор колбэков."
check: manual
```

## Итог

Три инструмента вместо одного Go-интерфейса: **структура** (данные с тегом типа),
**протокол** (одно действие для разных типов данных, открытый диспетч в рантайме, можно для
чужих типов), **behaviour** (контракт для взаимозаменяемых модулей, фундамент OTP). Запомни
ось: протокол — по данным, behaviour — по модулю. Дальше — кульминация курса: процессы,
сообщения и «let it crash», то, ради чего всё и затевалось.
