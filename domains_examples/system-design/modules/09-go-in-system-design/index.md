---
id: system-design.go-in-system-design.index
type: index
title: "Модуль 09 — Go на архитектурном интервью"
tags: [system-design, go, concurrency, performance, index]
status: todo
updated: 2026-09-08
---

# Модуль 09 — Go на архитектурном интервью

> Короткий, но очень «доходный» модуль. На интервью в Go-компанию тебя почти наверняка
> уведут с абстрактной схемы в конкретику: «твой handler делает три вызова вниз — как ты их
> запустишь?», «сколько горутин это много?», «сервис под нагрузкой съел 8 ГБ — куда
> смотришь?». Здесь — сильные ответы на эти вопросы и понимание, **почему** дефолты Go
> опасны в проде.

## Цель

После модуля ты:

1. Управляешь **ограниченной параллельностью**: worker pool на каналах, семафор,
   `errgroup.SetLimit`, и объясняешь, почему «просто запустим горутину на каждый запрос»
   плохо кончается.
2. Узнаёшь **goroutine leak** по описанию симптомов и знаешь три классические причины.
3. Свободно рассуждаешь про `context`: пропагация через слои, дедлайны и бюджет времени,
   отмена, `context.WithoutCancel` для фоновой работы.
4. Знаешь **пулы соединений**: `database/sql` (`SetMaxOpenConns`, `SetMaxIdleConns`,
   `SetConnMaxLifetime`), `http.Transport` (`MaxIdleConnsPerHost`, keep-alive), одно gRPC-
   соединение на много RPC — и почему размер пула БД должен быть небольшим.
5. Настраиваешь `http.Server` (Read/Write/Idle/ReadHeader timeouts) и умеешь объяснить, чем
   опасны нулевые дефолты.
6. Пишешь **graceful shutdown** через `signal.NotifyContext` + `Shutdown` и знаешь, как это
   связано с readiness probe в Kubernetes.
7. Уместно достаёшь `singleflight`, `x/time/rate`, `sync.Pool`, in-memory кэш — и помнишь про
   границы памяти.
8. Рассуждаешь про **GC и латентность**: GOGC, GOMEMLIMIT, давление аллокаций, p99-шипы,
   GOMAXPROCS в контейнере с CPU-квотой.
9. Ведёшь диагностику через **pprof**: что смотреть в CPU, heap, goroutine, block/mutex
   профилях и какой вывод из каждого.

## Предпосылки

- Практический Go (горутины, каналы, `context`, `database/sql`) — предполагается известным.
- [`../06-scalability-and-reliability/index.md`](../06-scalability-and-reliability/index.md) —
  таймауты, retry, circuit breaker, backpressure, load shedding: этот модуль приземляет их на код.
- [`../04-caching/index.md`](../04-caching/index.md) — cache stampede, к которому применяется `singleflight`.

## Структура

- [`theory.md`](./theory.md) — параллельность и её ограничение, goroutine leaks, `context`,
  пулы соединений, таймауты сервера, graceful shutdown.
- [`theory-2-runtime-and-diagnostics.md`](./theory-2-runtime-and-diagnostics.md) —
  `singleflight`/`x/time/rate`/`sync.Pool`/кэши, GC и латентность, GOMAXPROCS в контейнере,
  pprof под нагрузкой, типичные вопросы интервью.
- [`cards.md`](./cards.md) — карточки (числа, настройки, «что когда»).
- [`drills.md`](./drills.md) — упражнения.
- [`lessons/01-hardening-an-http-service.md`](./lessons/01-hardening-an-http-service.md) —
  укрепление HTTP-сервиса: таймауты, пулы, shutdown, эталонный `main.go`.
- [`lessons/02-fan-out-with-errgroup.md`](./lessons/02-fan-out-with-errgroup.md) — fan-out на
  `errgroup` с контекстом и обработкой частичных отказов.
- [`lessons/03-diagnosing-a-slow-service.md`](./lessons/03-diagnosing-a-slow-service.md) —
  разбор инцидента: медленный и текущий сервис под pprof.

## Порядок прохождения

1. `theory.md`, затем урок 01 (эталонный `main.go` — переписать руками, не копировать глазами).
2. Урок 02 — fan-out.
3. `theory-2-runtime-and-diagnostics.md`, затем урок 03.
4. `drills.md` + карточки. Числа (размер пула, таймауты) держать в SRS: их спрашивают дословно.

Дальше — практика по каркасу: [`../10-classic-interview-problems/index.md`](../10-classic-interview-problems/index.md).
