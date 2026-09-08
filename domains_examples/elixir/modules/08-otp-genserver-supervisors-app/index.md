---
id: elixir.otp-genserver-supervisors-app.index
type: index
title: "Модуль 08 — OTP: GenServer, супервизоры, Application"
tags: [elixir, otp, genserver, supervisor, application, task, agent]
status: todo
updated: 2026-09-08
---

# Модуль 08 — OTP: GenServer, супервизоры, Application

> В модуле 07 ты написал `receive`-цикл, состояние через рекурсию и прото-супервизор руками.
> OTP — это те же паттерны, но стандартизированные, оттестированные за 30 лет и снабжённые
> всем, что ты забыл (таймауты, корректное завершение, отладка, hot code reload). GenServer —
> это твой цикл, завёрнутый в behaviour. Supervisor — твой `trap_exit`-родитель, доросший до
> дерева перезапуска. Это и есть «суперсила Elixir», аналога которой в Go попросту нет.

## Цель

После модуля ты:

1. Пишешь **GenServer**: `init/1`, `handle_call/3` (синхронно), `handle_cast/2` (асинхронно),
   `handle_info/2`; понимаешь связь с ручным `receive`-циклом из модуля 07.
2. Строишь **деревья супервизии**: `Supervisor`, `child_spec`, стратегии (`:one_for_one`,
   `:one_for_all`, `:rest_for_one`), restart-политики — и понимаешь, как падение лечится.
3. Знаешь **Application** как корень дерева и точку старта; что такое OTP-приложение.
4. Применяешь готовые абстракции: `Task` (асинхронная работа/`async_stream`), `Agent`
   (простое состояние), `Registry`/`DynamicSupervisor`, знаешь про `:ets` обзорно.
5. Думаешь об отказоустойчивости как об **архитектуре дерева процессов**, а не как о
   `try/rescue` в каждой функции.
6. Понимаешь **child spec** (`id`/`start`/`restart`/`shutdown`/`type`) и откуда берётся
   `child_spec/1`; различаешь `start_link` и `start`.
7. Знаешь, что `init/1` обязан быть быстрым, а тяжёлая подготовка живёт в `handle_continue/2`;
   умеешь адресовать динамические процессы через `DynamicSupervisor` + `Registry`.

## Предпосылки

- Модуль 07 (процессы, состояние через цикл, link/monitor — OTP это их стандартизация),
  06 (behaviours — GenServer/Supervisor это behaviours).

## Структура

- [`theory.md`](./theory.md) — GenServer, call/cast/info, Supervisor, стратегии, Application, Task/Agent.
- [`cards.md`](./cards.md) — карточки.
- [`drills.md`](./drills.md) — упражнения.
- [`lessons/01-genserver.md`](./lessons/01-genserver.md) — переписываем ручной процесс из
  модуля 07 в GenServer; call vs cast.
- [`lessons/02-supervision-tree.md`](./lessons/02-supervision-tree.md) — Supervisor, дерево,
  стратегии, Application; наблюдаем рестарт.

## Порядок прохождения

1. `theory.md`.
2. Урок `lessons/01-genserver.md`.
3. Урок `lessons/02-supervision-tree.md`.
4. `drills.md` + карточки.
