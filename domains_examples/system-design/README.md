---
id: system-design.index
type: index
title: System Design
tags: [system-design]
updated: 2026-09-08
---

# System Design

Учебный домен: подготовка к **собеседованиям по system design на позицию Go-разработчика**
(middle → senior). Для практикующего Go-бэкендера, который писал сервисы, ходил в
PostgreSQL и Redis, но никогда не проходил «архитектурное» интервью и лишь смутно
представляет репликацию, шардирование, модели консистентности, брокеры сообщений и
back-of-envelope оценки.

Упор: объяснить каждое понятие **сначала простыми словами**, потом точно, потом — как
его спрашивают на собеседовании и как звучит сильный ответ. Всегда через trade-off'ы,
всегда с числами, всегда с вопросом «а что будет, когда это упадёт?». Схемы — в виде
`mermaid`-диаграмм прямо в тексте.

Дефолтный стек примеров: PostgreSQL, Redis, Kafka/NATS, etcd, gRPC, Kubernetes.

## Файлы

- [`CLAUDE.md`](./CLAUDE.md) — инструкции для Claude по этому домену.
- [`memory.md`](./memory.md) — память: что выучено, слабости, рабочие приёмы.
- [`roadmap.md`](./roadmap.md) — план обучения.

## Модули

1. [`01-interview-framework-and-estimation`](./modules/01-interview-framework-and-estimation/index.md) — что такое system design, формат интервью, каркас ответа (требования → оценки → high-level → deep dive → trade-off'ы), back-of-envelope, latency numbers.
2. [`02-networking-and-apis`](./modules/02-networking-and-apis/index.md) — DNS, TCP/UDP, TLS, HTTP/1.1–3, REST vs gRPC vs GraphQL, WebSocket/SSE/long polling, дизайн API, балансировщики L4/L7, reverse proxy, CDN.
3. [`03-databases-replication-sharding`](./modules/03-databases-replication-sharding/index.md) — SQL vs NoSQL, индексы, транзакции и ACID, уровни изоляции, пул соединений, репликация, партиционирование/шардирование, CAP/PACELC, модели консистентности, выбор БД.
4. [`04-caching`](./modules/04-caching/index.md) — зачем кэш и где он живёт, Redis/Memcached, cache-aside/read-through/write-through/write-behind, TTL, eviction, инвалидация, cache stampede и `singleflight`, consistent hashing, hot keys.
5. [`05-queues-and-async`](./modules/05-queues-and-async/index.md) — sync vs async, очереди vs логи (RabbitMQ/NATS vs Kafka), семантики доставки, идемпотентность, порядок и партиции, consumer groups, retry/backoff/DLQ, outbox, CDC, event-driven.
6. [`06-scalability-and-reliability`](./modules/06-scalability-and-reliability/index.md) — вертикальное/горизонтальное масштабирование, stateless, доступность и «девятки», SLA/SLO/SLI, таймауты, retry с jitter, circuit breaker, bulkhead, rate limiting, backpressure, graceful shutdown, health checks, observability.
7. [`07-distributed-systems`](./modules/07-distributed-systems/index.md) — почему распределённое сложно: сетевые разделения, время и часы, консенсус (Raft/etcd), выбор лидера, распределённые блокировки, 2PC vs saga, CQRS, event sourcing, генерация ID.
8. [`08-architecture-microservices-security`](./modules/08-architecture-microservices-security/index.md) — монолит vs модульный монолит vs микросервисы, границы сервисов, API gateway, service discovery, 12-factor, контейнеры/k8s обзорно, слои в Go-сервисе, auth (sessions/JWT/OAuth2), базовая безопасность, деплой (blue-green/canary).
9. [`09-go-in-system-design`](./modules/09-go-in-system-design/index.md) — как Go всплывает на архитектурном интервью: goroutine worker pools, `context`, пулы соединений `database/sql`/`http.Transport`, graceful shutdown, `singleflight`, `x/time/rate`, `errgroup`, GC и латентность, pprof, типичные Go-вопросы «а как поведёт себя сервис под нагрузкой».
10. [`10-classic-interview-problems`](./modules/10-classic-interview-problems/index.md) — разборы классических задач по каркасу: URL shortener, rate limiter, key-value store, чат, лента новостей, нотификации, файловое хранилище, автодополнение поиска, бронирование билетов, платежи/ledger, пайплайн метрик/логов.

## Как проходить

По порядку: модуль 01 задаёт каркас, которым потом решается каждая задача из модуля 10.
Модули 02–08 — «строительные блоки»; их можно проходить и выборочно перед конкретным
собеседованием, но первый раз — подряд. Модуль 09 — короткий, читать перед интервью
в Go-компанию. Внутри модуля: `theory.md` → `lessons/` → `drills.md`, карточки
`cards.md` держать в SRS параллельно. Главный тренажёр — **говорить вслух**: каждую
`free-form` задачу проговаривать за 10–15 минут, как на реальном интервью.
