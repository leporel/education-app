---
id: system-design.classic-interview-problems.index
type: index
title: "Модуль 10 — Классические задачи собеседований"
tags: [system-design, interview, problems, index]
status: todo
updated: 2026-09-08
---

# Модуль 10 — Классические задачи собеседований

> Финальный модуль. Здесь ничего нового не изучается — здесь **всё изученное собирается**
> в 45-минутный ответ. Восемь задач, которые задают чаще остальных, каждая разобрана по
> каркасу из модуля 01: требования → оценки → high-level → данные и API → deep dive →
> отказы → trade-off'ы. У каждой задачи есть свой «фокус» — та одна трудность, ради которой
> её и спрашивают. Знать фокус важнее, чем помнить схему.

## Цель

После модуля ты:

1. Прогоняешь **любую** новую задачу по одному и тому же каркасу, не паникуя от формулировки
   «спроектируйте Х».
2. Пользуешься решающими правилами: read-heavy или write-heavy, fan-out на запись или на
   чтение, когда шардировать, когда кэшировать, когда ставить очередь.
3. Помнишь **ключевой фокус** каждой из восьми классических задач и умеешь дойти до него сам,
   не дожидаясь подсказки интервьюера.
4. Считаешь оценки по шагам с единицами измерения — в каждой задаче.
5. Заранее знаешь, **куда будет давить интервьюер**, и отвечаешь до того, как спросят.

## Предпосылки

Все предыдущие модули, особенно:
[`../01-interview-framework-and-estimation/index.md`](../01-interview-framework-and-estimation/index.md) (каркас и оценки),
[`../03-databases-replication-sharding/index.md`](../03-databases-replication-sharding/index.md) (шардирование, консистентность),
[`../04-caching/index.md`](../04-caching/index.md),
[`../05-queues-and-async/index.md`](../05-queues-and-async/index.md),
[`../06-scalability-and-reliability/index.md`](../06-scalability-and-reliability/index.md),
[`../07-distributed-systems/index.md`](../07-distributed-systems/index.md) (saga, консенсус, генерация ID).

## Структура

- [`theory.md`](./theory.md) — как применять каркас к любой задаче, cheat-sheet решений,
  таблица восьми задач с их фокусами.
- [`cards.md`](./cards.md) — карточки: фокус каждой задачи и решающие правила.
- [`drills.md`](./drills.md) — мини-дизайны вслух и разбор спорных решений.
- Уроки — по одной задаче на урок:
  1. [`lessons/01-url-shortener.md`](./lessons/01-url-shortener.md) — сокращатель ссылок.
  2. [`lessons/02-rate-limiter-service.md`](./lessons/02-rate-limiter-service.md) — rate limiter как сервис.
  3. [`lessons/03-key-value-store.md`](./lessons/03-key-value-store.md) — распределённое KV-хранилище.
  4. [`lessons/04-chat-messenger.md`](./lessons/04-chat-messenger.md) — мессенджер.
  5. [`lessons/05-news-feed.md`](./lessons/05-news-feed.md) — лента новостей.
  6. [`lessons/06-notification-service.md`](./lessons/06-notification-service.md) — сервис нотификаций.
  7. [`lessons/07-file-storage.md`](./lessons/07-file-storage.md) — файловое хранилище (Dropbox).
  8. [`lessons/08-ticket-booking.md`](./lessons/08-ticket-booking.md) — бронирование билетов.

## Порядок прохождения

1. `theory.md` — сначала каркас и cheat-sheet, иначе уроки превратятся в заучивание схем.
2. Уроки по порядку. **Метод**: прочитать только раздел «Требования», закрыть файл, решить
   задачу самому на бумаге за 20 минут вслух, и только потом читать разбор и сравнивать.
3. `drills.md` — мини-дизайны на время.
4. `cards.md` в SRS: фокусы задач и решающие правила должны отскакивать от зубов.
