---
id: elixir.otp-genserver-supervisors-app.cards
type: cards
title: "OTP: GenServer, супервизоры, Application — карточки"
tags: [elixir, otp, genserver, supervisor, application, cards]
status: todo
updated: 2026-09-08
---

# Карточки

## GenServer

```card
front: Что такое GenServer и как он соотносится с ручным receive-циклом?
back: Обобщённый сервер — behaviour, который оборачивает receive-цикл с состоянием. Твои колбэки (init/handle_call/handle_cast/handle_info) вызывает проверенный каркас, берущий на себя протокол, таймауты, мониторинг, завершение. init/1 ≈ начальное состояние spawn; handle_call ≈ ручной запрос-ответ; state возвращается из каждого колбэка вместо аргумента loop.
tags: [elixir, genserver]
```

```card
front: handle_call vs handle_cast — разница и что возвращают?
back: handle_call(req, from, state) — СИНХРОННО, вызывающий ждёт ответ; возвращает {:reply, answer, new_state} (с таймаутом и мониторингом сервера). handle_cast(req, state) — АСИНХРОННО, «огонь и забыл»; возвращает {:noreply, new_state}, вызывающий не ждёт.
tags: [elixir, genserver, call, cast]
```

```card
front: Когда call, а когда cast?
back: "По умолчанию call: он синхронен, даёт back-pressure (клиент ждёт → не завалит сервер), нужен для результата и контроля темпа. cast — только для честного «огонь и забыл», когда переполнение mailbox невозможно. Всё на cast → mailbox растёт без удержу при перегрузке."
tags: [elixir, genserver, backpressure]
```

```card
front: Для чего handle_info/2?
back: "Для сообщений, пришедших НЕ через call/cast: таймеры (Process.send_after), {:DOWN, ...} от мониторов, произвольные send от других процессов. Всё «прочее» в mailbox обрабатывается здесь."
tags: [elixir, genserver, handle_info]
```

```card
front: Почему тяжёлую работу нельзя делать прямо в handle_call?
back: GenServer обрабатывает сообщения строго по одному; колбэк блокирует ВЕСЬ сервер на время выполнения. Долгая операция → сервер висит, mailbox копится, call'ы упираются в таймаут. Тяжёлое выноси в Task/отдельный процесс.
tags: [elixir, genserver, pitfall]
```

## Supervisor

```card
front: Что делает супервизор и почему он надёжен?
back: Запускает дочерние процессы, следит за ними (link + trap_exit) и перезапускает упавших по стратегии. Сам бизнес-логики не несёт — надёжен именно потому, что прост. Это стандартизированный прото-супервизор из модуля 07.
tags: [elixir, supervisor]
```

```card
front: Три стратегии супервизора?
back: :one_for_one — перезапустить только упавшего (дети независимы, самая частая). :one_for_all — перезапустить всех (тесно связаны, нужен согласованный старт). :rest_for_one — упавшего и всех объявленных ПОСЛЕ него (поздние зависят от ранних).
tags: [elixir, supervisor, strategy]
```

```card
front: Restart-политики ребёнка (:permanent/:temporary/:transient)?
back: :permanent (по умолчанию) — перезапускать всегда (сервисы). :temporary — никогда (одноразовые задачи). :transient — только если упал ненормально (не :normal/:shutdown).
tags: [elixir, supervisor, restart]
```

```card
front: Что происходит, если ребёнок падает слишком часто (max_restarts/max_seconds)?
back: "Супервизор сдаётся и падает сам, эскалируя проблему ВЫШЕ по дереву. Это фича: если рестарт не помогает, пусть решает родитель. Дерево локализует и эскалирует сбои."
tags: [elixir, supervisor, escalation]
```

```card
front: Почему супервизию называют главным отличием OTP от Go?
back: "В Go нет встроенной супервизии — рестарт упавшего воркера пишешь сам (recover, цикл рестарта, бэк-офф, health-флаги). OTP даёт самовосстановление декларативно: опиши дерево детей и стратегию. Отказоустойчивость становится структурой программы, а не россыпью defensive-кода."
tags: [elixir, supervisor, go]
```

## Application и абстракции

```card
front: Что такое OTP-приложение (Application)?
back: "Единица упаковки и запуска: модуль с use Application и колбэком start/2, поднимающим корневой супервизор со всем деревом. mix new --sup создаёт заготовку, mix.exs указывает mod: {App, []}. iex -S mix поднимает всё дерево. Зависимости — тоже приложения; система = «дерево деревьев»."
tags: [elixir, application]
```

```card
front: Что такое Task и Task.async_stream?
back: "Task — для асинхронной работы: Task.async(fn) + Task.await (≈ go + канал результата). Task.async_stream(enum, fun, max_concurrency: N) — параллельная map с лимитом одновременности (то, для чего в Go городят пул горутин + семафор)."
tags: [elixir, task]
```

```card
front: Что такое Agent и когда он вместо GenServer?
back: "Тонкая обёртка «процесс как изменяемая ячейка состояния»: Agent.start_link/update/get. Когда нужно только хранилище состояния без логики обработки сообщений. Если нужна логика/несколько типов запросов — полноценный GenServer."
tags: [elixir, agent]
```

```card
front: Зачем :ets, если есть GenServer для состояния?
back: GenServer сериализует доступ → при read-heavy нагрузке становится бутылочным горлом. :ets — встроенные in-memory таблицы с быстрым КОНКУРЕНТНЫМ доступом вне heap процесса; для кэшей и общих читаемых данных без узкого места. Знай как опцию, когда один GenServer не тянет.
tags: [elixir, ets]
```

```card
front: Как думать об отказоустойчивости в OTP («think in trees»)?
back: 1) Раздели систему на процессы по ответственности/единице сбоя. 2) Состояние, которое не жаль терять, держи в процессе; критичное — персисти и восстанавливай в init. 3) Построй дерево со стратегиями (one_for_one/all/rest_for_one). 4) Дай падать — рестарт лечит. Надёжность = форма дерева процессов.
tags: [elixir, fault-tolerance]
```

## Child spec и старт

```card
front: "Что такое child spec и откуда у модуля берётся child_spec/1?"
back: "Карточка ребёнка супервизора: id, start (тройка модуль-функция-аргументы), restart, shutdown, type. Записи Counter и {Counter, 0} — короткие формы, разворачивающиеся в неё. Функцию child_spec/1 генерирует use GenServer; поля можно переопределить: use GenServer, restart: :transient."
tags: [elixir, supervisor, child-spec]
```

```card
front: "start_link или start под супервизором и почему?"
back: "start_link: он связывает (link) новый процесс с родителем, а именно через связь супервизор узнаёт о падении ребёнка. start запускает процесс без связи — надзор работать не будет. Отсюда конвенция публичной функции start_link/1."
tags: [elixir, genserver, start-link]
```

```card
front: "Почему init/1 должен быть быстрым и что делать с тяжёлой подготовкой?"
back: "Пока init не вернулся, супервизор ждёт, и старт всего дерева (и приложения) стоит. Тяжёлое выносят в handle_continue/2: init мгновенно возвращает {:ok, state, {:continue, :warmup}}, а долгая работа делается в handle_continue до первого клиентского сообщения."
tags: [elixir, genserver, init, handle-continue]
```

```card
front: "Можно ли полагаться на terminate/2 как на деструктор?"
back: "Нет. terminate/2 не вызывается при Process.exit(pid, :kill) и при падении родителя, поэтому это «попытка прибраться», а не гарантия. Всё критичное сохраняй сразу (БД/ETS), а не в момент завершения."
tags: [elixir, genserver, terminate]
```

## Динамические процессы

```card
front: "Как управлять процессами, которые создаются в рантайме (по одному на пользователя)?"
back: "DynamicSupervisor (start_child в рантайме) плюс Registry как таблица «ключ → pid». Процесс регистрируется через name: {:via, Registry, {MyApp.Registry, id}}, а обращаются к нему по тому же кортежу. Registry сам вычищает записи умерших процессов."
tags: [elixir, dynamic-supervisor, registry]
```

```card
front: "Чем Registry лучше регистрации по имени-атому?"
back: "Ключом Registry может быть любой терм (строка, кортеж, id пользователя), тогда как имена процессов — атомы, которые не собираются GC и не годятся для тысяч динамических сущностей. Плюс Registry автоматически удаляет записи умерших процессов."
tags: [elixir, registry, atom]
```
