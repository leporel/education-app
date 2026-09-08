---
id: elixir.otp-genserver-supervisors-app.lesson-01
type: lesson
title: "Урок 01 — От ручного процесса к GenServer"
tags: [elixir, genserver, call, cast, lesson]
status: todo
updated: 2026-06-26
---

# Урок 01 — От ручного процесса к GenServer

Цель: переписать ручной процесс из модуля 07 в GenServer и прочувствовать, что каркас делает
за тебя. Различить `call` и `cast`. Якорь — Go: GenServer это «горутина-владелец состояния +
канал запросов», но из коробки.

## Разогрев

- Какой колбэк отвечает на синхронный запрос с результатом? (`handle_call/3`)
- Что возвращает `handle_cast`? (`{:noreply, new_state}`)
- Где живёт состояние в GenServer? (передаётся в каждый колбэк и возвращается из него)

## Шаг 1. Вспомним ручной банк-счёт (модуль 07)

Там мы руками писали `spawn`, `loop(balance)`, `send`/`receive` и таймауты. Повторять не
будем — главное помнить структуру: начальное состояние, синхронные запросы (баланс, снятие),
асинхронные команды (пополнение).

## Шаг 2. Тот же счёт как GenServer

```elixir
defmodule Account do
  use GenServer

  # ── Клиентский API (то, что видят снаружи; прячет протокол) ──
  def start_link(initial \\ 0) do
    GenServer.start_link(__MODULE__, initial, name: __MODULE__)
  end

  def deposit(amount), do: GenServer.cast(__MODULE__, {:deposit, amount})   # async
  def balance, do: GenServer.call(__MODULE__, :balance)                     # sync
  def withdraw(amount), do: GenServer.call(__MODULE__, {:withdraw, amount}) # sync (нужен результат)

  # ── Серверные колбэки (выполняются ВНУТРИ процесса, по одному) ──
  @impl true
  def init(initial), do: {:ok, initial}

  @impl true
  def handle_call(:balance, _from, balance) do
    {:reply, balance, balance}                 # {:reply, ответ, новое_состояние}
  end

  def handle_call({:withdraw, amount}, _from, balance) when amount <= balance do
    {:reply, {:ok, balance - amount}, balance - amount}
  end

  def handle_call({:withdraw, _amount}, _from, balance) do
    {:reply, {:error, :insufficient_funds}, balance}   # состояние не меняем
  end

  @impl true
  def handle_cast({:deposit, amount}, balance) do
    {:noreply, balance + amount}               # {:noreply, новое_состояние}, ответа нет
  end
end
```

```elixir
Account.start_link(100)
Account.deposit(50)             # cast — вернётся :ok мгновенно, не дожидаясь обработки
Account.balance()               # => 150  (call ждёт ответ)
Account.withdraw(200)           # => {:error, :insufficient_funds}
Account.withdraw(30)            # => {:ok, 120}
Account.balance()               # => 120
```

Сравни с модулем 07:
- `spawn`+`loop` → `use GenServer` + `init/1`. Состояние `balance` теперь приходит и
  возвращается из колбэков, а не таскается в `loop`.
- Ручной запрос-ответ (`send` + `receive` + `after`) → `GenServer.call`. Каркас сам кладёт
  тег, ждёт ответ, ставит таймаут (5 с) и **мониторит сервер**: если `Account` умрёт во
  время `call`, вызов не зависнет, а упадёт с понятной ошибкой `:noproc`/`:timeout`.
- Бизнес-правило (`amount <= balance`) — guard на clause `handle_call`, как и было.
- Multi-clause `handle_call` — тот же диспетч по образцу из модуля 03.

> **Go-параллель.** В Go этот сервис — горутина с `for { select { case <-balanceCh: ...;
> case d := <-depositCh: ... } }`, плюс руками: каналы ответа, таймауты, обработка «горутина
> уже мертва». GenServer даёт всё это как стандартный, оттестированный каркас. Ты пишешь
> только бизнес-колбэки.

## Шаг 3. call vs cast — почувствуй разницу

```elixir
Account.deposit(10)   # cast: клиент НЕ ждёт; команда уйдёт в mailbox и обработается позже
Account.balance()     # call: клиент ЖДЁТ, пока сервер обработает и ответит
```

`deposit` через `cast` — потому что ответ не нужен. Но осторожно: если бы тысячи клиентов
лупили `deposit` быстрее, чем сервер успевает, mailbox бы рос (back-pressure нет). Если важен
контроль темпа или подтверждение — делай `deposit` через `call`, возвращая `:ok`. **Правило:
сомневаешься — `call`.** `cast` — осознанная оптимизация для честного «огонь и забыл».

## Шаг 4. handle_info: сообщения мимо call/cast

Что, если процессу прилетит сообщение не через GenServer-API — например, от таймера? Его
ловит `handle_info`. Добавим авто-начисление процентов раз в интервал:

```elixir
defmodule Account do
  use GenServer
  # ... start_link/deposit/balance как выше ...

  @impl true
  def init(initial) do
    schedule_interest()                       # запланировать первое начисление
    {:ok, initial}
  end

  @impl true
  def handle_info(:apply_interest, balance) do
    schedule_interest()                       # запланировать следующее
    {:noreply, round(balance * 1.01)}         # +1%
  end

  defp schedule_interest do
    Process.send_after(self(), :apply_interest, 60_000)   # себе, через 60 с
  end
end
```

`Process.send_after` шлёт `:apply_interest` самому себе через минуту; это сообщение не call и
не cast, поэтому попадает в `handle_info`. Там же ловят `{:DOWN, ...}` от мониторов и любые
чужие `send`. Это «прочая почта» из модуля 07, теперь — отдельный колбэк.

## Шаг 5. Не блокируй сервер

Критичная привычка: GenServer однопоточен по сообщениям. Такой колбэк — яд:

```elixir
def handle_call(:report, _from, state) do
  result = very_slow_computation(state)   # ❌ блокирует ВЕСЬ сервер на всё время
  {:reply, result, state}
end
```

Пока считается `very_slow_computation`, сервер не обрабатывает другие `call`/`cast`, mailbox
копится, клиенты упираются в таймаут. Лечение — вынести тяжёлое в `Task` (урок про
параллелизм/капстоун) или отдать работу отдельному процессу и ответить позже. Сервер должен
быстро принять, быстро ответить, состояние держать маленьким.

## Mini-drill

```drill
type: free-form
prompt: "В Account.withdraw используется call, а в deposit — cast. Объясни, почему именно так, и когда стоило бы и deposit сделать call."
answer: "withdraw возвращает результат ({:ok, _} / {:error, :insufficient_funds}), который клиенту нужен — это синхронный запрос, значит call. deposit ответа не требует, поэтому cast (быстро, не ждём). НО если depositов очень много и есть риск перегнать сервер (mailbox растёт без back-pressure) или нужно подтверждение успеха/контроль темпа — deposit стоит сделать call, возвращающим :ok: синхронность даст естественное торможение клиента."
check: manual
```

```drill
type: multiple-choice
prompt: "Process.send_after(self(), :tick, 1000) — в каком колбэке обработается :tick?"
options: ["handle_call", "handle_cast", "handle_info", "init"]
answer: "handle_info"
check: exact
hint: Это не call и не cast — «прочая почта».
```

## Итог

GenServer — это ручной `receive`-цикл из модуля 07, ставший стандартным behaviour: `init`
задаёт состояние, `handle_call` отвечает синхронно (с таймаутом и мониторингом),
`handle_cast` — асинхронно, `handle_info` ловит прочую почту, а состояние течёт через
колбэки. Выбор `call`/`cast` — это выбор про back-pressure. Не блокируй сервер тяжёлой
работой. Дальше — Supervisor и Application: дадим этим серверам присмотр и самовосстановление.
