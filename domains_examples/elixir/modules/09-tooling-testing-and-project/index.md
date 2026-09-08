---
id: elixir.tooling-testing-and-project.index
type: index
title: "Модуль 09 — Тулинг, тесты и проект"
tags: [elixir, exunit, mix, testing, project, phoenix, capstone]
status: todo
updated: 2026-09-08
---

# Модуль 09 — Тулинг, тесты и проект

> Время собрать всё в работающую систему. Ты выучил язык, процессы и OTP — теперь
> инструменты вокруг них: тесты (ExUnit, doctests, async), структура mix-проекта,
> зависимости, форматтер и анализаторы. Капстоун — супервизируемый пул воркеров,
> склеивающий модули 05–08 в одну программу. И врезка про Phoenix/LiveView — где
> отказоустойчивость BEAM превращается в реальное преимущество в проде.

## Цель

После модуля ты:

1. Пишешь тесты на **ExUnit**: `test`, `assert`/`refute`, `setup`/фикстуры, `async: true`;
   понимаешь, когда async безопасен.
2. Пишешь **doctests** — примеры в `@doc`, которые проверяются как тесты.
3. Ориентируешься в структуре mix-проекта, добавляешь зависимости через Hex (`mix.exs`),
   знаешь `mix format`/`Credo`/`Dialyzer` и обзорно — релизы.
4. Собираешь **капстоун**: OTP-приложение с супервизором и пулом воркеров (`Task`/
   `DynamicSupervisor`), обрабатывающее задания конкурентно и переживающее падения.
5. Понимаешь (врезка), почему **Phoenix + LiveView** — естественная витрина Elixir в проде:
   процесс на соединение, real-time без церемоний, отказоустойчивость из коробки.
6. Делаешь тесты независимыми через `start_supervised!/1` (и понимаешь, почему общий
   именованный процесс запрещает `async: true`); знаешь теги и полезные флаги `mix test`.
7. Логируешь через **`Logger`** (уровни, метаданные процесса, `require`), а не `IO.inspect`.

## Предпосылки

- Все модули 01–08. Капстоун опирается на `Enum`/`Stream` (05), GenServer/Supervisor/Task (08).

## Структура

- [`theory.md`](./theory.md) — ExUnit, doctests, mix/deps/Hex, format/Credo/Dialyzer, релизы, Phoenix-врезка.
- [`cards.md`](./cards.md) — карточки.
- [`drills.md`](./drills.md) — упражнения.
- [`lessons/01-capstone-worker-pool.md`](./lessons/01-capstone-worker-pool.md) — сквозной
  проект: супервизируемый пул воркеров + тесты; финал — Phoenix/LiveView врезкой.

## Порядок прохождения

1. `theory.md`.
2. Урок `lessons/01-capstone-worker-pool.md` (делай руками в mix-проекте).
3. `drills.md` + карточки.
