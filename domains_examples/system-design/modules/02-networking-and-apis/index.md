---
id: system-design.networking-and-apis.index
type: index
title: "Модуль 02 — Сеть и API"
tags: [system-design, networking, api, index]
status: todo
updated: 2026-09-08
---

# Модуль 02 — Сеть и API

> Модуль отвечает на вопрос, который на интервью задают почти всем: **«что происходит после
> того, как пользователь нажал Enter в браузере?»** Это не проверка эрудиции — это проверка,
> понимаешь ли ты, откуда в системе берутся задержки, соединения и точки отказа. Второй
> половина модуля — про то, как спроектировать API, который не развалится при первом retry.

## Цель

После модуля ты:

1. Проходишь путь запроса от DNS до ответа: **DNS → TCP → TLS → HTTP → балансировщик →
   сервис**, и знаешь, сколько round trip'ов стоит каждый шаг.
2. Различаешь **TCP и UDP**, понимаешь handshake, зачем видео и QUIC живут на UDP, и что
   такое head-of-line blocking в HTTP/1.1 и в TCP.
3. Осознанно выбираешь между **REST, gRPC, GraphQL** и между **WebSocket, SSE, long polling**
   — с критериями, а не по привычке.
4. Проектируешь API: ресурсы, **идемпотентность и `Idempotency-Key`**, курсорная пагинация,
   версионирование, формат ошибок, заголовки rate limit.
5. Понимаешь, что реально делает **балансировщик** (L4 vs L7), какие есть алгоритмы,
   как работают health checks, зачем reverse proxy, API gateway и CDN.

## Предпосылки

- Модуль 01 — [`../01-interview-framework-and-estimation/index.md`](../01-interview-framework-and-estimation/index.md)
  (каркас ответа, latency numbers: без них разговор про сеть теряет половину смысла).

## Структура

- [`theory.md`](./theory.md) — путь запроса, TCP/UDP/TLS, HTTP/1.1–2–3, стили API,
  realtime-транспорты, дизайн API, балансировщики и CDN.
- [`cards.md`](./cards.md) — карточки: числа, определения, «что когда выбирать».
- [`drills.md`](./drills.md) — упражнения, включая проектирование API вслух.
- [`lessons/01-request-path-end-to-end.md`](./lessons/01-request-path-end-to-end.md) — путь
  запроса целиком, по шагам, с диаграммой последовательности и бюджетом задержки.
- [`lessons/02-choosing-api-style.md`](./lessons/02-choosing-api-style.md) — выбор стиля API
  под конкретные сценарии.
- [`lessons/03-designing-order-api.md`](./lessons/03-designing-order-api.md) — дизайн API
  сервиса заказов: идемпотентность, пагинация, ошибки, версии.

## Порядок прохождения

1. `theory.md`.
2. Урок 01 — путь запроса (обязательно проговорить вслух: это буквально вопрос с интервью).
3. Урок 02 — выбор стиля API.
4. Урок 03 — практический дизайн API.
5. `drills.md` + карточки в SRS.

Дальше — хранилища: [`../03-databases-replication-sharding/index.md`](../03-databases-replication-sharding/index.md).
