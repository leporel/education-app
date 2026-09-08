---
id: system-design.scalability-and-reliability.index
type: index
title: "Модуль 06 — Масштабирование и надёжность"
tags: [system-design, scalability, reliability, index]
status: todo
updated: 2026-09-08
---

# Модуль 06 — Масштабирование и надёжность

> Система не «работает» или «не работает» — она работает на 99.9 %, отвечает за 40 мс в
> медиане и за 2 секунды в хвосте, и падает целиком, когда один медленный сервис забирает
> все горутины. Этот модуль — про то, как проектировать деградацию: чтобы система умела
> становиться медленнее и беднее, но не умирать целиком.

## Цель

После модуля ты:

1. Объясняешь разницу вертикального и горизонтального масштабирования и делаешь сервис
   **stateless**, называя, куда уехало состояние.
2. Читаешь таблицу «девяток», различаешь **SLA / SLO / SLI**, считаешь error budget и
   объясняешь, почему среднее время ответа врёт, а p99 — нет.
3. Расставляешь **таймауты** везде (`context`, `http.Client`), делаешь retry с
   экспоненциальным backoff и jitter, и знаешь, что такое retry storm и retry budget.
4. Применяешь стабилизирующие паттерны Nygard: **circuit breaker**, **bulkhead**, fail-fast,
   load shedding.
5. Выбираешь алгоритм **rate limiting** (token bucket, leaky bucket, fixed/sliding window,
   sliding log) и умеешь сделать его распределённым.
6. Делаешь корректный **graceful shutdown** и health checks (liveness/readiness), понимаешь
   failover, multi-AZ, RPO/RTO.
7. Проектируешь наблюдаемость: логи, метрики, трейсы — и знаешь, на что вообще стоит алертить.

## Предпосылки

- Модуль [`01-interview-framework-and-estimation`](../01-interview-framework-and-estimation/index.md)
  — оценки и latency numbers.
- Модуль [`04-caching`](../04-caching/index.md) — stampede и деградация при падении кэша.
- Модуль [`05-queues-and-async`](../05-queues-and-async/index.md) — backpressure и лаг.

## Структура

- [`theory.md`](./theory.md) — масштабирование, stateless, сессии, девятки, SLA/SLO/SLI,
  error budget, перцентили, capacity planning, observability.
- [`theory-2-resilience-and-limits.md`](./theory-2-resilience-and-limits.md) — таймауты,
  retry и backoff, circuit breaker, bulkhead, rate limiting, load shedding, graceful
  shutdown, health checks, failover и DR.
- [`cards.md`](./cards.md) — карточки.
- [`drills.md`](./drills.md) — упражнения.
- [`lessons/01-taming-a-flaky-dependency.md`](./lessons/01-taming-a-flaky-dependency.md) —
  делаем «мигающую» зависимость безопасной.
- [`lessons/02-design-a-rate-limiter.md`](./lessons/02-design-a-rate-limiter.md) — rate
  limiter: один узел → распределённый на Redis.
- [`lessons/03-slo-and-observability.md`](./lessons/03-slo-and-observability.md) — SLO и
  наблюдаемость для checkout-сервиса.

## Порядок прохождения

1. `theory.md` → `theory-2-resilience-and-limits.md`.
2. Урок 01 → урок 02 → урок 03.
3. `drills.md` + карточки в SRS. Контрольный вопрос модуля: «зависимость стала отвечать за
   10 секунд вместо 50 мс — что произойдёт с вашим сервисом?» Сильный ответ содержит слова
   таймаут, circuit breaker, bulkhead, load shedding и «деградируем частично».
