---
id: system-design.queues-and-async.index
type: index
title: "Модуль 05 — Очереди и асинхронность"
tags: [system-design, queues, kafka, async, index]
status: todo
updated: 2026-09-08
---

# Модуль 05 — Очереди и асинхронность

> Очередь — это почта. Ты бросаешь письмо в ящик и уходишь, не дожидаясь, пока адресат
> прочитает. Взамен получаешь скорость и устойчивость — и целый мешок новых вопросов:
> а письмо точно дойдёт? а если дойдёт дважды? а в том ли порядке? а если адресат уехал
> на месяц? Именно эти вопросы интервьюер задаёт после фразы «отправим в Kafka».

## Цель

После модуля ты:

1. Решаешь осознанно, что делать **синхронно**, а что **асинхронно**, и называешь цену
   асинхронности (сложность, eventual consistency, отладка).
2. Различаешь **очередь** (RabbitMQ, NATS) и **лог** (Kafka): retention, replay, consumer
   groups, партиции, offset'ы — и выбираешь под задачу.
3. Объясняешь at-most-once / at-least-once / «exactly-once» и почему на практике это
   **at-least-once + идемпотентность и дедупликация**.
4. Проектируешь порядок через **ключ партиции**, retry с backoff, DLQ и обработку poison
   messages.
5. Умеешь надёжно публиковать события: **transactional outbox** и CDC (Debezium) — и
   объясняешь, почему «записал в БД и отправил в брокер» ломается.
6. Пишешь consumer на Go с worker pool, ограничением параллелизма и graceful stop.

## Предпосылки

- Модуль [`03-databases-replication-sharding`](../03-databases-replication-sharding/index.md)
  — транзакции и партиционирование (ключ партиции здесь тот же ход мыслей).
- Модуль [`04-caching`](../04-caching/index.md) — инвалидация через события, hot key.

## Структура

- [`theory.md`](./theory.md) — sync vs async, очередь vs лог, семантики доставки,
  идемпотентность, порядок и партиции, retry/DLQ, outbox и CDC, event-driven, backpressure,
  эволюция схем, Go-consumer.
- [`cards.md`](./cards.md) — карточки.
- [`drills.md`](./drills.md) — упражнения, включая «объясни вслух».
- [`lessons/01-order-placed-events.md`](./lessons/01-order-placed-events.md) — «заказ создан»
  → письмо + резерв склада: выбор брокера и разбор отказов.
- [`lessons/02-idempotent-consumer-and-outbox.md`](./lessons/02-idempotent-consumer-and-outbox.md)
  — идемпотентный consumer и transactional outbox.
- [`lessons/03-kafka-partitions-walkthrough.md`](./lessons/03-kafka-partitions-walkthrough.md)
  — партиции, ключи, consumer groups и rebalance по шагам.

## Порядок прохождения

1. `theory.md` целиком.
2. Урок 01 → урок 02 → урок 03.
3. `drills.md` + карточки в SRS. Контрольный вопрос модуля: «твоё сообщение пришло дважды —
   что произойдёт?» Ответ должен быть не «такого не бывает», а конкретный ключ
   идемпотентности и место его проверки.
