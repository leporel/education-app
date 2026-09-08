---
id: elixir.roadmap
type: roadmap
title: План обучения — elixir
tags: [elixir, roadmap]
updated: 2026-09-08
---

# План обучения

Упорядоченный план модулей. Статусы: `todo` / `in-progress` / `done`.
План — не догма: можно менять порядок, вставлять модули, резать лишние.

Базис: ученик — опытный **Go**-разработчик, Elixir нов. Единственный якорь сравнений — Go.
Учим **Elixir 1.19+ на Erlang/OTP 27+** (совместимо с OTP 28.1 / 29). Веб — только врезкой.

## Этап 1. Вход и фундамент языка

- [ ] [`01-why-elixir-and-setup`](./modules/01-why-elixir-and-setup/index.md)
      — зачем Elixir (конкурентность, отказоустойчивость BEAM, «let it crash»,
      неизменяемость, функциональность), наследие Erlang, узел/планировщики/редукции,
      динамика + set-theoretic типы, `mix`/Hex/IEx, `.ex` vs `.exs` и три способа запуска,
      первая программа, `iex`/`mix new/test/format`, тулинг vs `go mod` — **todo**.
- [ ] [`02-pattern-matching-and-immutability`](./modules/02-pattern-matching-and-immutability/index.md)
      — `=` как **match operator** (не присваивание), неизменяемость, типы данных
      (atoms, tuples, lists, maps, keyword lists, binaries/strings, charlists),
      деструктуризация, пин `^`; против присваивания и мутабельных структур Go — **todo**.
- [ ] [`03-functions-modules-guards-pipe`](./modules/03-functions-modules-guards-pipe/index.md)
      — `def`/`defp`, multi-clause + диспетч по образцу, guards, дефолтные аргументы,
      директивы `alias`/`import`/`require`, пайп `|>` (`then`/`tap`, отладка `IO.inspect`/`dbg`),
      анонимные функции и `&`, рекурсия вместо циклов, хвостовые вызовы;
      против функций/методов/`for` Go — **todo**.

## Этап 2. Поток управления и абстракции

- [ ] [`04-control-flow-with-and-errors`](./modules/04-control-flow-with-and-errors/index.md)
      — `case`/`cond`/`if`/`unless`, конвенция `{:ok, _}`/`{:error, _}`, **`with`** для
      happy-path-цепочек против `if err != nil`, `try/rescue`/`raise`, `throw`, ошибки
      как значения vs исключения — **todo**.
- [ ] [`05-collections-enum-stream-comprehensions`](./modules/05-collections-enum-stream-comprehensions/index.md)
      — `Enum` (жадный) vs `Stream` (ленивый), типичные конвейеры (`map`/`filter`/
      `reduce`), comprehensions (`for`, с `:into`/`:reduce`), `Map`/`MapSet`/keyword
      lists; против slices/maps + ручных циклов Go — **todo**.
- [ ] [`06-protocols-behaviours-structs`](./modules/06-protocols-behaviours-structs/index.md)
      — `defstruct` и структуры (это map под капотом, `@enforce_keys`, отсутствие `Access`),
      `defprotocol`/`defimpl` (полиморфизм) vs интерфейсы Go, `@behaviour` + колбэки (контракт
      модуля), `use`/`__using__` как вставка кода, `@spec` и выводимая set-theoretic
      типизация, `@derive` — **todo**.

## Этап 3. Конкурентность, OTP и реальный проект

- [ ] [`07-processes-spawn-send-receive`](./modules/07-processes-spawn-send-receive/index.md)
      — процессы BEAM (дёшевы, изолированы, per-process heap/GC, share-nothing), `spawn`,
      `send`/`receive`, mailbox и `receive` как pattern matching, состояние через
      рекурсию, `link`/`monitor`, «let it crash»; **главный контраст: акторы vs
      goroutines + каналы/CSP** — **todo**.
- [ ] [`08-otp-genserver-supervisors-app`](./modules/08-otp-genserver-supervisors-app/index.md)
      — `GenServer` (абстракция receive-цикла: `call`/`cast`/`init`/state), `Supervisor`
      и деревья супервизии (стратегии `:one_for_one` и др.), `Application` и старт дерева,
      `Task`/`Agent`, `Registry`, `:ets` обзорно; отказоустойчивость как архитектура —
      **todo**.
- [ ] [`09-tooling-testing-and-project`](./modules/09-tooling-testing-and-project/index.md)
      — ExUnit, doctests, `async: true`, фикстуры/`setup`, изоляция тестов через
      `start_supervised!`, логирование через `Logger`, структура mix-проекта, deps и
      Hex, `mix format`/Credo/Dialyzer, релизы обзорно; сквозной капстоун — супервизируемый
      **пул воркеров** (mix-приложение + дерево супервизии + Task); **врезка Phoenix +
      LiveView** как «async/real-time в проде, почему BEAM тут выигрывает»; против
      `go test` — **todo**.

## Идеи на потом

- **Phoenix + Ecto по-настоящему** — отдельным доменом: контроллеры/LiveView, схемы,
  миграции, контексты, PubSub, каналы; полноценный веб-бэкенд.
- **Распределённый Elixir** — много нод, `Node`/`:global`/`:pg`, libcluster, Horde;
  «один кластер как один компьютер».
- **GenStage / Broadway / Flow** — back-pressure и конвейеры обработки данных.
- **Метапрограммирование** — `quote`/`unquote`, макросы, как устроены `defstruct`/
  Ecto-схемы изнутри; писать свой DSL.
- **`:ets`/`:dets`/Mnesia** — встроенные хранилища BEAM; кэши и таблицы без внешней БД.
- **Nx / Nerves** — ML-числодробилка на BEAM и embedded; экзотические, но живые ветки.
- **Property-based testing** (`stream_data`/PropEr) и тестирование конкурентного кода.
- **Мост к Go-домену**: один и тот же сервис на Go и на Elixir/OTP — сравнить
  отказоустойчивость, эргономику конкурентности и перф.
