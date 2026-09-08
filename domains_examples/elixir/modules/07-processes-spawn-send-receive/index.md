---
id: elixir.processes-spawn-send-receive.index
type: index
title: "Модуль 07 — Процессы: spawn, send, receive"
tags: [elixir, processes, actors, concurrency, send, receive]
status: todo
updated: 2026-09-08
---

# Модуль 07 — Процессы: spawn, send, receive

> Вот ради чего всё затевалось. Go дал тебе goroutines и каналы. BEAM даёт **процессы** —
> и это другая модель: не «потоки, общающиеся через каналы поверх общей памяти», а
> **изолированные акторы**, у каждого свой heap, общающиеся только сообщениями (копией).
> Состояние живёт *внутри* процесса (через рекурсию), а не в общей структуре под мьютексом.
> Сбой одного процесса не задевает других. Эта глава перестроит твои инстинкты конкурентности.

## Цель

После модуля ты:

1. Создаёшь процессы `spawn`, понимаешь, что это дёшево (миллионы), изолированно (свой
   heap/GC) и вытесняемо (preemptive scheduling) — и чем это отличается от goroutine.
2. Шлёшь и принимаешь сообщения: `send`/`receive`, mailbox; `receive` как pattern matching.
3. Держишь **состояние в процессе** через рекурсивный цикл с аккумулятором (предтеча
   GenServer) — без общей памяти и мьютексов.
4. Связываешь процессы: `link`, `Process.monitor`, `trap_exit`; понимаешь распространение
   сбоев и зачем это для супервизии.
5. Принял философию **«let it crash»**: изоляция + восстановление вместо защиты от каждой
   ошибки. Знаешь грабли: блокирующий `receive`, неограниченный mailbox, общее «состояние».
6. Умеешь регистрировать процессы по имени (`Process.register`/`whereis`, `name:`) и
   понимаешь, почему имя переживает рестарт, а pid — нет.
7. Различаешь причины завершения (`:normal`, исключение, `:shutdown`, свой терм) и знаешь про
   неперехватываемый `:kill`.

## Предпосылки

- Модуль 02 (pattern matching — `receive` это он), 03 (рекурсия с аккумулятором — на ней
  стоит состояние процесса).

## Структура

- [`theory.md`](./theory.md) — модель процессов, spawn/send/receive, состояние, link/monitor, let it crash.
- [`cards.md`](./cards.md) — карточки.
- [`drills.md`](./drills.md) — упражнения.
- [`lessons/01-spawn-send-receive.md`](./lessons/01-spawn-send-receive.md) — первый процесс,
  обмен сообщениями, `receive`-цикл; сравнение с goroutine+channel.
- [`lessons/02-stateful-process-and-crashes.md`](./lessons/02-stateful-process-and-crashes.md)
  — состояние через рекурсию (счётчик/стек), link vs monitor, демонстрация «let it crash».

## Порядок прохождения

1. `theory.md`.
2. Урок `lessons/01-spawn-send-receive.md`.
3. Урок `lessons/02-stateful-process-and-crashes.md`.
4. `drills.md` + карточки.
