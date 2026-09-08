---
id: elixir.processes-spawn-send-receive.lesson-02
type: lesson
title: "Урок 02 — Состояние в процессе и падения"
tags: [elixir, state, link, monitor, let-it-crash, lesson]
status: todo
updated: 2026-06-26
---

# Урок 02 — Состояние в процессе и падения

Цель: научиться держать состояние внутри процесса (через рекурсивный цикл), различать `link`
и `monitor`, и своими глазами увидеть «let it crash» — как падение изолируется и почему это
хорошо. Это прямой пролог к GenServer и супервизорам (модуль 08).

## Разогрев

- Где живёт состояние процесса? (в аргументе его рекурсивного `receive`-цикла)
- `link` vs `monitor` — кто падает вместе, кто только узнаёт? (`link` — оба; `monitor` — только узнаёт)
- Что делает `trap_exit`? (превращает сигналы выхода в сообщения `{:EXIT, ...}`)

## Шаг 1. Состояние через рекурсию: банк-счёт

```elixir
defmodule Account do
  # ── публичный API (прячет send/receive) ──
  def start(balance \\ 0), do: spawn(fn -> loop(balance) end)

  def deposit(pid, amount), do: send(pid, {:deposit, amount})

  def balance(pid) do
    send(pid, {:balance, self()})
    receive do
      {:balance, b} -> b
    after
      1_000 -> :timeout
    end
  end

  def withdraw(pid, amount) do
    send(pid, {:withdraw, amount, self()})
    receive do
      {:withdraw_result, result} -> result
    after
      1_000 -> :timeout
    end
  end

  # ── внутренний цикл: state = текущий баланс ──
  defp loop(balance) do
    receive do
      {:deposit, amount} ->
        loop(balance + amount)

      {:balance, from} ->
        send(from, {:balance, balance})
        loop(balance)

      {:withdraw, amount, from} when amount <= balance ->
        send(from, {:withdraw_result, {:ok, balance - amount}})
        loop(balance - amount)

      {:withdraw, _amount, from} ->
        send(from, {:withdraw_result, {:error, :insufficient_funds}})
        loop(balance)
    end
  end
end
```

```elixir
acc = Account.start(100)
Account.deposit(acc, 50)
Account.balance(acc)            # => 150
Account.withdraw(acc, 200)      # => {:error, :insufficient_funds}
Account.withdraw(acc, 30)       # => {:ok, 120}
Account.balance(acc)            # => 120
```

Что тут важно:
- **Состояние — это `balance`**, аргумент `loop`. «Изменение» баланса — это вызов `loop` с
  новым значением. Никакой общей памяти, никаких мьютексов.
- **Публичный API прячет протокол сообщений.** Снаружи `Account.deposit(acc, 50)` выглядит
  как обычный вызов; `send`/`receive` — деталь реализации. Ровно так оборачивает GenServer.
- **Бизнес-правило — guard на clause** (`when amount <= balance`), как в модуле 03.
- **Сериализация бесплатна.** Хоть тысяча клиентов шлёт `deposit`/`withdraw` — процесс
  разбирает их по одному, состояние всегда консистентно. В Go тут был бы мьютекс на каждый
  доступ к балансу.

> **Это и есть GenServer вручную.** В модуле 08 ты увидишь, что `loop` + сообщения = behaviour
> GenServer: `{:balance, from}` → `handle_call`, `{:deposit, amount}` → `handle_cast`,
> начальный `balance` → `init`. Сейчас ты строишь это руками, чтобы потом не было магии.

## Шаг 2. monitor: узнать о смерти, не умирая

```elixir
worker = spawn(fn ->
  receive do
    :boom -> raise "ой"      # процесс упадёт с исключением
  end
end)

ref = Process.monitor(worker)
send(worker, :boom)

receive do
  {:DOWN, ^ref, :process, ^worker, reason} ->
    IO.puts("воркер умер по причине: #{inspect(reason)}")
after
  1_000 -> IO.puts("воркер жив")
end
# => воркер умер по причине: {%RuntimeError{message: "ой"}, [...stacktrace...]}
```

Мы наблюдали падение `worker`, получив `{:DOWN, ...}`, но **сами остались живы**. Пины `^ref`
и `^worker` (модуль 02!) фильтруют именно наш мониторинг. `monitor` — выбор, когда нужно
«среагировать на смерть», но не «разделить судьбу».

## Шаг 3. link: разделить судьбу (и зачем)

```elixir
# spawn_link связывает нас с воркером
parent = self()

spawn(fn ->
  Process.flag(:trap_exit, true)        # ловим выходы связанных как сообщения
  child = spawn_link(fn -> raise "падаю" end)

  receive do
    {:EXIT, ^child, reason} ->
      send(parent, {:child_died, reason})
  end
end)

receive do
  {:child_died, reason} -> IO.puts("родитель узнал о смерти ребёнка: #{inspect(reason)}")
end
```

Без `trap_exit` падение `spawn_link`-ребёнка уронило бы и родителя (это поведение по
умолчанию — связанные падают вместе). С `trap_exit` родитель **ловит** падение как
`{:EXIT, child, reason}` и решает, что делать. Это **ровно** механизм супервизора: он
связывается с детьми, ловит их выходы и перезапускает. Ты только что собрал прото-супервизор.

> **Go-контраст.** В Go нет встроенного «падения вместе» или «уведомления о смерти горутины».
> Паника в горутине без `recover` кладёт весь процесс ОС; чтобы узнать о завершении, городишь
> `done`-каналы/`WaitGroup`. `link`/`monitor`/`trap_exit` — встроенный, единообразный
> механизм рантайма, на котором OTP строит деревья супервизии.

## Шаг 4. «Let it crash» вживую

Заметь, что в `Account` (шаг 1) **нет** оборонительного кода на «а вдруг придёт мусорное
сообщение». Что будет, если послать кривое?

```elixir
acc = Account.start(100)
send(acc, :garbage)          # не совпадёт ни с одним образцом receive
# ...останется в mailbox навсегда (селективный receive его игнорирует)
```

А если бы сообщение вызывало ошибку (скажем, `{:deposit, "не число"}` и мы бы делали
арифметику) — процесс **упал бы**. И это нормально: в реальной системе `Account` сидел бы под
супервизором, который поднял бы свежий процесс. Мы не обвешиваем каждую операцию `try/rescue`
«на всякий случай» — пусть непредвиденное роняет процесс, а супервизор лечит рестартом.
Ожидаемое же (нехватка средств) мы вернули значением `{:error, :insufficient_funds}` — это не
повод падать.

Граница простая:
- **`{:error, reason}`** — ожидаемая ветка (нехватка средств, нет ключа). Обрабатываем.
- **Падение** — непредвиденное (битые данные, баг, нарушенный инвариант). Пусть упадёт,
  супервизор поднимет в чистое состояние.

## Mini-drill

```drill
type: free-form
prompt: "В Account состояние — это balance в loop. Объясни, что физически происходит при Account.deposit(acc, 50), шаг за шагом."
answer: "1) deposit/2 делает send(acc, {:deposit, 50}) и сразу возвращается. 2) Сообщение попадает в mailbox процесса acc. 3) Его receive-цикл матчит {:deposit, amount} и вызывает loop(balance + 50) — то есть входит в новый виток рекурсии с новым значением balance. Старое значение balance не «изменилось» — просто следующий виток loop получил новое. Состояние неизменяемо, обновление = новый виток цикла."
check: manual
```

```drill
type: multiple-choice
prompt: "spawn_link-ребёнок упал, а у родителя НЕ выставлен trap_exit. Что с родителем?"
options: ["Родитель получит {:EXIT, ...} сообщением", "Родитель тоже упадёт (поведение link по умолчанию)", "Ничего, link односторонний", "Родитель получит {:DOWN, ...}"]
answer: "Родитель тоже упадёт (поведение link по умолчанию)"
check: exact
hint: trap_exit превращает выход в сообщение; без него связанные падают вместе.
```

```drill
type: free-form
prompt: "Почему в Account нехватку средств вернули как {:error, :insufficient_funds}, а не дали процессу упасть?"
answer: "Нехватка средств — ОЖИДАЕМАЯ бизнес-ветка, а не сбой: вызывающий должен её штатно обработать. Падение зарезервировано для НЕПРЕДВИДЕННОГО (битые данные, баг, нарушенный инвариант), где рестарт супервизором в чистое состояние уместен. Ронять процесс на штатном «денег не хватило» — потерять состояние счёта и нагрузить супервизор без причины."
check: manual
```

## Итог

Состояние процесса живёт в аргументе его `receive`-цикла; «изменение» — это новый виток
`loop` с новым значением, а публичный API прячет `send`/`receive` (предтеча GenServer).
`monitor` даёт узнать о смерти не умирая, `link` + `trap_exit` — поймать падение ребёнка и
среагировать (прото-супервизор). «Let it crash» означает: ожидаемое — значениями `{:error, _}`,
непредвиденное — падением под присмотром супервизора. Дальше — OTP: GenServer и Supervisor
превратят всё это руками-написанное в стандартные, проверенные кирпичи.
