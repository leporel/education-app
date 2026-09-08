---
id: system-design.roadmap
type: roadmap
title: План обучения — system-design
tags: [system-design, roadmap]
updated: 2026-09-08
---

# План обучения

Упорядоченный план модулей. Статусы: `todo` / `in-progress` / `done`.
План — не догма: можно менять порядок, вставлять модули, резать лишние.

Базис: ученик — практикующий **Go**-разработчик, system design как дисциплина нов.
Цель — уверенно проходить system design интервью на Go-бэкендера и защищать trade-off'ы.

## Этап 1. Каркас интервью

- [ ] [`01-interview-framework-and-estimation`](./modules/01-interview-framework-and-estimation/index.md)
      — что такое system design и зачем его спрашивают, формат 45–60 минут, каркас
      ответа (требования → оценки → high-level → deep dive → trade-off'ы),
      функциональные vs нефункциональные требования, back-of-envelope, latency numbers,
      как говорить и как не молчать — **todo**.

## Этап 2. Строительные блоки

- [ ] [`02-networking-and-apis`](./modules/02-networking-and-apis/index.md)
      — что происходит после нажатия Enter: DNS, TCP/UDP, TLS, HTTP/1.1–2–3; REST vs
      gRPC vs GraphQL; WebSocket/SSE/long polling; дизайн API (идемпотентность,
      пагинация, версионирование); балансировщики L4/L7, reverse proxy, CDN — **todo**.
- [ ] [`03-databases-replication-sharding`](./modules/03-databases-replication-sharding/index.md)
      — SQL vs NoSQL (KV/document/wide-column/graph/time-series), индексы (B-tree),
      транзакции/ACID, уровни изоляции, N+1, пул соединений; репликация (leader–follower,
      sync/async, lag), партиционирование/шардирование (hash/range, hot keys,
      решардинг), CAP/PACELC, модели консистентности, «какую БД выбрать» — **todo**.
- [ ] [`04-caching`](./modules/04-caching/index.md)
      — зачем кэш, где живёт (клиент/CDN/приложение/БД), Redis vs Memcached, стратегии
      (cache-aside, read-through, write-through, write-behind), TTL, eviction (LRU/LFU),
      инвалидация, stampede/thundering herd и `singleflight`, consistent hashing,
      hot keys — **todo**.
- [ ] [`05-queues-and-async`](./modules/05-queues-and-async/index.md)
      — sync vs async, очередь vs лог (RabbitMQ/NATS vs Kafka), at-most/at-least/
      exactly-once, идемпотентность, порядок и партиции, consumer groups, retry/backoff/
      DLQ, transactional outbox, CDC, event-driven архитектура — **todo**.
- [ ] [`06-scalability-and-reliability`](./modules/06-scalability-and-reliability/index.md)
      — вертикальное/горизонтальное масштабирование, stateless-сервисы, доступность и
      «девятки», SLA/SLO/SLI, таймауты, retry с jitter, circuit breaker, bulkhead,
      rate limiting (token/leaky bucket, sliding window), backpressure, load shedding,
      graceful shutdown, health checks, failover/DR, observability — **todo**.
- [ ] [`07-distributed-systems`](./modules/07-distributed-systems/index.md)
      — сетевые разделения и частичные отказы, время (NTP, Lamport/vector clocks),
      консенсус (Raft, etcd/ZooKeeper), выбор лидера, распределённые блокировки,
      распределённые транзакции (2PC vs saga), CQRS, event sourcing, генерация ID
      (UUID v7, Snowflake), миф exactly-once — **todo**.
- [ ] [`08-architecture-microservices-security`](./modules/08-architecture-microservices-security/index.md)
      — монолит vs модульный монолит vs микросервисы, границы (DDD-lite), API gateway,
      service discovery, service mesh обзорно, 12-factor, контейнеры/k8s обзорно, слои
      Go-сервиса (clean/hexagonal), auth (sessions, JWT, OAuth2/OIDC), базовая
      безопасность (TLS, секреты, OWASP), деплой (blue-green, canary) — **todo**.

## Этап 3. Go и практика

- [ ] [`09-go-in-system-design`](./modules/09-go-in-system-design/index.md)
      — worker pools и goroutine leaks, `context` и отмена, пулы `database/sql` и
      `http.Transport`, graceful shutdown, `singleflight`, `x/time/rate`, `errgroup`,
      GC и латентность, pprof; типичные Go-вопросы на архитектурном интервью — **todo**.
- [ ] [`10-classic-interview-problems`](./modules/10-classic-interview-problems/index.md)
      — разборы по каркасу: URL shortener, rate limiter, key-value store, чат, лента
      новостей, нотификации, файловое хранилище, автодополнение, бронирование билетов,
      платежи/ledger, пайплайн метрик/логов — **todo**.

## Идеи на потом

- Mock-интервью: серия сессий, где Claude играет интервьюера и оценивает по рубрике.
- Отдельный модуль по observability вглубь (OpenTelemetry, SLO-алертинг, on-call).
- Data engineering: batch vs stream, Spark/Flink, data lake — если интервью потребует.
- Kubernetes по-настоящему (deployments, HPA, service mesh) — отдельный домен.
- Behavioral-часть интервью (STAR, рассказ о проектах) — не про system design, но рядом.
