---
id: system-design.caching.index
type: index
title: "Модуль 04 — Кэширование"
tags: [system-design, caching, redis, index]
status: todo
updated: 2026-09-08
---

# Модуль 04 — Кэширование

> Кэш — самый дешёвый способ сделать систему быстрее и самый дешёвый способ сделать её
> непредсказуемой. На собеседовании фраза «добавим Redis» без объяснения стратегии,
> TTL и инвалидации — почти гарантированный минус. Этот модуль про то, чтобы у тебя
> всегда был ответ на «а как ты его инвалидируешь?».

## Цель

После модуля ты:

1. Объясняешь **зачем** кэш в конкретной точке системы: латентность, снятие нагрузки с БД,
   деньги — и подтверждаешь числами.
2. Знаешь все уровни, где живёт кэш (браузер → CDN → gateway → in-process → Redis →
   buffer pool БД), и выбираешь нужный, а не «просто Redis».
3. Свободно сравниваешь **cache-aside / read-through / write-through / write-behind** и
   называешь, где каждый ломается.
4. Проектируешь TTL, eviction (`maxmemory-policy`) и инвалидацию; понимаешь, почему
   консистентность кэша и БД — это про порядок операций, а не про удачу.
5. Узнаёшь **cache stampede** по описанию симптома и чинишь его (`singleflight`, лок,
   early refresh, jitter), а hot key — локальным кэшем и разбиением ключа.
6. Оцениваешь hit ratio и эффект кэша на p99 «на салфетке».

## Предпосылки

- Модуль [`01-interview-framework-and-estimation`](../01-interview-framework-and-estimation/index.md)
  — каркас ответа и back-of-envelope.
- Модуль [`03-databases-replication-sharding`](../03-databases-replication-sharding/index.md)
  — что именно мы разгружаем кэшем и что такое реплики/шардирование.

## Структура

- [`theory.md`](./theory.md) — зачем и где кэш, Redis vs Memcached, стратегии, TTL,
  eviction, инвалидация, stampede, hot keys, consistent hashing, hit ratio.
- [`cards.md`](./cards.md) — карточки.
- [`drills.md`](./drills.md) — упражнения, включая «объясни вслух».
- [`lessons/01-cache-a-product-page.md`](./lessons/01-cache-a-product-page.md) — кэшируем
  страницу товара: стратегия, ключи, TTL, инвалидация.
- [`lessons/02-stampede-lab.md`](./lessons/02-stampede-lab.md) — лаборатория stampede и
  `singleflight` в Go.
- [`lessons/03-redis-in-practice.md`](./lessons/03-redis-in-practice.md) — Redis под сессии,
  лидерборд и счётчики лимитов.

## Контрольный вопрос модуля

Если после этого модуля тебя спросят «куда добавите кэш и как его инвалидируете?», ответ
должен звучать как связка из четырёх решений: **уровень** (CDN / in-process / Redis),
**стратегия** (обычно cache-aside), **ключ и TTL** (с jitter), **инвалидация** (после
commit, `DEL` или новая версия ключа) — плюс честное «окно рассогласования не больше TTL».

## Порядок прохождения

1. `theory.md` целиком.
2. Урок 01 → урок 02 → урок 03.
3. `drills.md` (free-form — проговаривать вслух) + карточки в SRS.
