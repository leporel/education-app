---
id: elixir.index
type: index
title: Elixir
tags: [elixir]
updated: 2026-09-08
---

# Elixir

Учебный домен: от нуля до самостоятельного письма программ на Elixir. Для человека с
сильным опытом **Go**, которому Elixir нов. Упор на ментальные модели и «почему так
сделано», постоянные сравнения с Go, и — главное — на **модель процессов/акторов и
OTP** (изоляция, обмен сообщениями, «let it crash», супервизоры). Синтаксис — это лишь
способ разговаривать с рантаймом BEAM; настоящий герой курса — сам рантайм.

Учим **Elixir 1.19+ на Erlang/OTP 27+** (совместимо с OTP 28.1 / 29). Веб (Phoenix +
LiveView) — только врезкой в капстоуне.

## Файлы

- [`CLAUDE.md`](./CLAUDE.md) — инструкции для Claude по этому домену.
- [`memory.md`](./memory.md) — память: что выучено, слабости, рабочие приёмы.
- [`roadmap.md`](./roadmap.md) — план обучения.

## Модули

1. [`01-why-elixir-and-setup`](./modules/01-why-elixir-and-setup/index.md) — зачем Elixir/BEAM (конкурентность, отказоустойчивость, «let it crash», неизменяемость, функциональность); наследие Erlang; узел, планировщики и редукции; динамика + растущая set-theoretic типизация; `mix`/Hex/IEx; `.ex` vs `.exs` и способы запуска; первая программа; тулинг vs `go mod`.
2. [`02-pattern-matching-and-immutability`](./modules/02-pattern-matching-and-immutability/index.md) — `=` это **оператор сопоставления**, а не присваивание; неизменяемость; типы данных (atoms, tuples, lists, maps, keyword lists, binaries/strings); деструктуризация; пин `^`.
3. [`03-functions-modules-guards-pipe`](./modules/03-functions-modules-guards-pipe/index.md) — `def`/`defp`, multi-clause функции + диспетч по образцу, guards, аргументы по умолчанию, `alias`/`import`/`require`, пайп `|>` (+ `then`/`tap`, отладка через `IO.inspect`/`dbg`), рекурсия вместо циклов, хвостовые вызовы.
4. [`04-control-flow-with-and-errors`](./modules/04-control-flow-with-and-errors/index.md) — `case`/`cond`/`if`/`unless`; конвенция `{:ok, _}`/`{:error, _}`; **`with`** для happy-path против `if err != nil`; `try/rescue` против `raise`; ошибки-значения.
5. [`05-collections-enum-stream-comprehensions`](./modules/05-collections-enum-stream-comprehensions/index.md) — `Enum` (жадный) vs `Stream` (ленивый), типичные конвейеры, comprehensions (`for`), `Map`/`MapSet`/keyword lists; против slices/maps + ручных циклов.
6. [`06-protocols-behaviours-structs`](./modules/06-protocols-behaviours-structs/index.md) — `defstruct` (+ `@enforce_keys`), `defprotocol`/`defimpl` (полиморфизм) vs интерфейсы Go; `@behaviour` + колбэки; что делает `use`/`__using__`; `@spec` и выводимая типизация; `@derive`.
7. [`07-processes-spawn-send-receive`](./modules/07-processes-spawn-send-receive/index.md) — процессы BEAM (дёшевы, изолированы, share-nothing); `spawn`, `send`/`receive`, mailbox; links и monitors; состояние через рекурсию; «let it crash». Главный контраст: акторы vs goroutines + каналы/CSP.
8. [`08-otp-genserver-supervisors-app`](./modules/08-otp-genserver-supervisors-app/index.md) — `GenServer` (абстракция receive-цикла), `Supervisor` + деревья супервизии, `Application`, `Task`/`Agent`, `Registry`; стратегии отказоустойчивости. Суперсила Elixir; аналога в Go нет.
9. [`09-tooling-testing-and-project`](./modules/09-tooling-testing-and-project/index.md) — ExUnit, doctests, async-тесты и изоляция через `start_supervised!`, `Logger`, структура mix-проекта, deps/Hex, `mix format`/Credo/Dialyzer; сквозной капстоун — супервизируемый пул воркеров; врезка **Phoenix/LiveView** «async в проде». Против `go test`.

## Как проходить

Строго по порядку. Модуль **02 (pattern matching + неизменяемость)** — позвоночник всего
курса: функции, `case`, `receive` — это всё сопоставление с образцом в разных шляпах; не
пропускать. Модули **07–08 (процессы и OTP)** — кульминация и главная причина учить Elixir;
до них всё остальное лишь готовит почву. Внутри модуля: `theory.md` → `lessons/` →
`drills.md`, карточки `cards.md` держать в SRS параллельно. Код запускать локально через
`iex`/`mix` (поставь Elixir + Erlang/OTP) или щупать в IEx. Каждый раз, когда что-то
падает — **читай стектрейс и причину**: в Elixir падение процесса часто и есть штатный путь.
