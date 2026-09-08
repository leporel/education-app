---
id: system-design.architecture-microservices-security.index
type: index
title: "Модуль 08 — Архитектура, микросервисы и безопасность"
tags: [system-design, architecture, microservices, security, index]
status: todo
updated: 2026-09-08
---

# Модуль 08 — Архитектура, микросервисы и безопасность

> Это модуль про то, **как код разложен по процессам и репозиториям**, кто кому звонит,
> кто чем владеет, как всё это задеплоить не уронив, и как не отдать данные первому
> желающему. Тут больше всего мифов: «микросервисы = современно», «JWT = безопасно»,
> «Kubernetes сам всё масштабирует». Разбираем честно, с ценниками.

## Цель

После модуля ты:

1. Можешь **защитить выбор** монолита, модульного монолита или микросервисов — через размер
   команды, независимость деплоя и операционную стоимость, а не через моду.
2. Умеешь **резать систему на границы**: bounded context, владение данными, «никакой общей
   БД», и понимаешь, что бывает хуже монолита (распределённый монолит).
3. Знаешь роли инфраструктурных «коробок»: API gateway, BFF, service discovery, service
   mesh, — и что делает Kubernetes (pod, deployment, service, HPA, probes) обзорно.
4. Раскладываешь Go-сервис по слоям (handler → service → repository) и объясняешь, где
   стоят интерфейсы и почему.
5. Отвечаешь на вопросы про **auth**: sessions vs JWT (и почему JWT — не серебряная пуля),
   OAuth2/OIDC простыми словами, API keys, mTLS между сервисами.
6. Проходишь блок «базовая безопасность»: TLS, валидация ввода, SQL-инъекции, секреты,
   least privilege, OWASP Top 10, rate limiting как защита от абьюза, PII и шифрование.
7. Умеешь описать **деплой без простоя**: rolling / blue-green / canary, feature flags и
   миграции схемы по схеме expand → migrate → contract.

## Предпосылки

- [`../01-interview-framework-and-estimation/index.md`](../01-interview-framework-and-estimation/index.md) — каркас ответа.
- [`../02-networking-and-apis/index.md`](../02-networking-and-apis/index.md) — REST/gRPC, балансировщики, TLS.
- [`../05-queues-and-async/index.md`](../05-queues-and-async/index.md) — асинхронное общение, outbox.
- [`../06-scalability-and-reliability/index.md`](../06-scalability-and-reliability/index.md) — таймауты, retry, rate limiting, health checks.

## Структура

- [`theory.md`](./theory.md) — монолит vs микросервисы, границы и DDD-lite, общение между
  сервисами, gateway/BFF/discovery/mesh, config и 12-factor, контейнеры и k8s, слои Go-сервиса.
- [`theory-2-security-and-deploy.md`](./theory-2-security-and-deploy.md) — auth (sessions,
  JWT, OAuth2/OIDC, API keys, mTLS), базовая безопасность, стратегии деплоя и миграции без простоя.
- [`cards.md`](./cards.md) — карточки.
- [`drills.md`](./drills.md) — упражнения, включая проговаривание вслух.
- [`lessons/01-splitting-a-monolith.md`](./lessons/01-splitting-a-monolith.md) — как найти
  границы и что **не** надо выносить.
- [`lessons/02-auth-for-public-api-and-services.md`](./lessons/02-auth-for-public-api-and-services.md)
  — auth для публичного API и для внутренних сервисов.
- [`lessons/03-zero-downtime-deploy.md`](./lessons/03-zero-downtime-deploy.md) — деплой с
  изменением схемы БД без простоя.

## Порядок прохождения

1. `theory.md` — архитектура и инфраструктура.
2. Урок 01 — распил монолита на бумаге.
3. `theory-2-security-and-deploy.md` — auth, безопасность, деплой.
4. Уроки 02 и 03.
5. `drills.md` + карточки в SRS.

Дальше — Go под нагрузкой: [`../09-go-in-system-design/index.md`](../09-go-in-system-design/index.md).
