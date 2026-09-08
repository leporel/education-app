---
id: system-design.databases-replication-sharding.index
type: index
title: "Модуль 03 — Базы данных, репликация и шардирование"
tags: [system-design, databases, replication, sharding, index]
status: todo
updated: 2026-09-08
---

# Модуль 03 — Базы данных, репликация и шардирование

> Самый большой модуль домена — и самый доходный на интервью. Хранилище есть в любой задаче,
> и именно вокруг него крутятся самые интересные вопросы: где данные, сколько копий, что
> случится при отказе, как читать быстрее, чем пишем, и почему «просто добавим реплику» иногда
> ломает продукт. Теория разбита на два файла: сначала одна база, потом много.

## Цель

После модуля ты:

1. Выбираешь **семейство хранилища** под нагрузку (реляционка, KV, документная, wide-column,
   графовая, time-series, поисковая) и объясняешь выбор через профиль запросов, а не через моду.
2. Понимаешь **индексы** (B-tree-интуиция), почему запись дорожает с каждым индексом, что
   такое covering index и почему `LIKE '%x'` не индексируется.
3. Владеешь **транзакциями и уровнями изоляции**: какие аномалии бывают, что даёт
   PostgreSQL по умолчанию, чем `SELECT FOR UPDATE` отличается от оптимистичной блокировки.
4. Знаешь про **N+1** и **пул соединений** — и почему пул должен быть маленьким.
5. Объясняешь **репликацию** (leader–follower, sync/async, лаг, failover, split brain,
   кворумы) и **шардирование** (range vs hash, hot keys, вторичные индексы, решардинг).
6. Не путаешь **CAP, PACELC и модели консистентности** и умеешь говорить о них человеческим
   языком.

## Предпосылки

- Модуль 01 — [`../01-interview-framework-and-estimation/index.md`](../01-interview-framework-and-estimation/index.md)
  (оценки: объём данных и QPS решают, нужен ли шардинг).
- Модуль 02 — [`../02-networking-and-apis/index.md`](../02-networking-and-apis/index.md)
  (пагинация, идемпотентность, таймауты — они упираются в БД).

## Структура

- [`theory.md`](./theory.md) — одна база: семейства хранилищ, индексы, транзакции и ACID,
  уровни изоляции и аномалии, N+1, пул соединений, блокировки.
- [`theory-2-replication-sharding.md`](./theory-2-replication-sharding.md) — много баз:
  репликация, лаг и read-your-writes, failover и split brain, кворумы, шардирование, hot keys,
  решардинг, CAP/PACELC, модели консистентности, таблица выбора хранилища.
- [`cards.md`](./cards.md) — карточки.
- [`drills.md`](./drills.md) — упражнения.
- [`lessons/01-modeling-and-indexes-marketplace.md`](./lessons/01-modeling-and-indexes-marketplace.md)
  — модель данных и индексы для маркетплейса.
- [`lessons/02-replication-and-read-scaling.md`](./lessons/02-replication-and-read-scaling.md)
  — масштабирование чтения репликами и разбор отказов.
- [`lessons/03-sharding-users-and-messages.md`](./lessons/03-sharding-users-and-messages.md)
  — шардирование таблиц пользователей и сообщений.

## Порядок прохождения

1. `theory.md` — не спеша, это база для модулей 04–07.
2. Урок 01 (моделирование и индексы).
3. `theory-2-replication-sharding.md`.
4. Уроки 02 и 03.
5. `drills.md` + карточки в SRS.

Дальше — кэширование: [`../04-caching/index.md`](../04-caching/index.md).
