---
id: rust.concurrency-async-and-project.cards
type: cards
title: "Конкурентность, async и проект — карточки"
tags: [rust, concurrency, threads, async, tokio, cards]
status: todo
updated: 2026-09-08
---

# Карточки

## Потоки и Send/Sync

```card
front: Чем потоки и async в Rust отличаются по назначению?
back: "Потоки (std::thread) — параллелизм на ядрах, для CPU-тяжёлой работы. async/await — конкурентность с масштабируемым I/O: тысячи ждущих задач на малом пуле потоков. Go сливает оба в горутину; Rust разделяет (и async нужен внешний рантайм)."
tags: [rust, concurrency, async]
```

```card
front: Что такое Send и Sync?
back: Send — тип можно переместить (передать владение) в другой поток. Sync — на тип можно ссылаться из нескольких потоков (&T можно слать в потоки). Компилятор проверяет их при spawn. Почти всё Send; Rc — НЕ Send (неатомарный счётчик).
tags: [rust, send, sync]
```

```card
front: Почему std::thread::spawn(move || println!(\"{rc}\")) для Rc не компилируется?
back: "Rc не реализует Send (счётчик неатомарный, гонка испортила бы подсчёт). Ошибка E0277: `Rc<...>` cannot be sent between threads safely. Решение — Arc (атомарный, Send+Sync). Это «fearless concurrency»: гонка поймана на компиляции."
tags: [rust, send, rc, arc]
```

```card
front: Что значит «fearless concurrency»?
back: Borrow checker + Send/Sync делают целый класс гонок данных невозможным НА КОМПИЛЯЦИИ. Нельзя безопасно расшарить — ошибка сборки, а не рантайм-баг. Контраст с Go, где гонку (может быть) поймает -race детектор в рантайме.
tags: [rust, fearless]
```

## Mutex и каналы

```card
front: Чем Arc<Mutex<T>> в Rust надёжнее sync.Mutex в Go?
back: Данные живут ВНУТРИ Mutex<T>; добраться можно только через lock(). Замок снимается автоматически при выходе guard из scope (RAII) — забыть unlock нельзя. В Go мьютекс отдельно от данных, можно обратиться, забыв Lock().
tags: [rust, mutex, arc]
```

```card
front: Arc<Mutex<T>> — это многопоточный аналог чего из модуля 08?
back: Rc<RefCell<T>>. Arc вместо Rc (потокобезопасное совладение), Mutex вместо RefCell (блокировка вместо рантайм-проверки заёма). Та же идея «несколько владельцев + изменяемость», но для потоков.
tags: [rust, mutex, refcell]
```

```card
front: Что такое mpsc-каналы и в чём отличие от каналов Go?
back: "std::sync::mpsc — multi-producer, single-consumer: передача сообщений вместо общей памяти (CSP, как в Go). Отличия: владение отправленного значения переходит получателю (нет общего доступа после send → нет гонок); по умолчанию один получатель (много — через crossbeam)."
tags: [rust, channels, mpsc]
```

## async / Tokio

```card
front: Почему async fn сам по себе ничего не делает?
back: "async fn возвращает Future — описание вычисления, ленивое: пока его не «поллят», ничего не происходит. Нужен рантайм/executor (в std его нет). Забыл .await — компилятор предупредит, что future не использован."
tags: [rust, async, future]
```

```card
front: Три отличия async Rust от goroutines Go?
back: 1) Future ленив (горутина едет сразу). 2) Рантайм внешний и выбираемый (Tokio; async-std мёртв), у Go встроен. 3) Планирование кооперативное — задача уступает только на .await; у Go вытесняющее. Больше контроля ценой явности.
tags: [rust, async, go]
```

```card
front: Что делает .await?
back: Точка, где async-задача может УСТУПИТЬ управление исполнителю, пока ждёт (сеть/диск). Рантайм в это время крутит другие задачи на том же потоке. Так один поток обслуживает тысячи ждущих соединений.
tags: [rust, async, await]
```

```card
front: join! vs tokio::spawn vs select! ?
back: join! — ждать несколько futures конкурентно (как WaitGroup). tokio::spawn — отдать задачу рантайму, ближайший аналог go f() (нужно Send + 'static). select! — кто первым завершится (как select по каналам в Go, но по futures).
tags: [rust, tokio, concurrency]
```

```card
front: "Главный async-грабль: что нельзя делать внутри async-функции?"
back: Блокирующий/долгий синхронный вызов (std::thread::sleep, тяжёлый цикл, блокирующий I/O) — он затыкает поток executor'а, и все остальные задачи на нём встают. Используй async-аналоги (tokio::time::sleep().await) или tokio::task::spawn_blocking.
tags: [rust, async, blocking]
```

```card
front: Можно ли писать async fn в трейтах в 2026?
back: "Да — нативный async fn в трейтах стабилен (RPITIT), без внешнего async-trait-крейта, для статической диспетчеризации. Оговорка: для dyn-trait объектов с async-методами есть ограничения, там иногда всё ещё берут async-trait."
tags: [rust, async, traits]
```

## Синхронизация подробнее

```card
front: Почему Mutex::lock() возвращает Result?
back: "Из-за отравления (poisoning): если поток запаниковал, держа замок, данные внутри могли остаться полуизменёнными, и мьютекс помечается отравленным. lock().unwrap() — политика «кто-то умер с замком, продолжать не буду». Игнорировать осознанно: lock().unwrap_or_else(|e| e.into_inner())."
tags: [rust, mutex, poisoning]
```

```card
front: Что такое thread::scope и когда он избавляет от Arc?
back: "Scoped-потоки: std::thread::scope(|s| { s.spawn(|| ...); }) — выход из scope ждёт все порождённые потоки, поэтому им можно давать обычные ссылки на локальные данные, без 'static, move и Arc. Подходит, когда потоки заведомо завершатся внутри блока (посчитать по кускам массива)."
tags: [rust, threads, scope]
```

```card
front: RwLock и атомики — когда вместо Mutex?
back: "RwLock — когда читают часто, а пишут редко: read() пускает много читателей, write() одного писателя (аналог sync.RWMutex; по сути правило заёма в рантайме). Атомики (AtomicUsize, AtomicBool) — для счётчиков и флагов без блокировок: fetch_add(1, Ordering::Relaxed)."
tags: [rust, rwlock, atomic]
```

## async: рантайм, отмена, дедлоки

```card
front: Что такое Future, poll, executor и рантайм — простыми словами?
back: "Future — машина состояний с методом poll («продвинься, если можешь»): отвечает «готово + результат» либо «пока нет, разбуди позже». Executor — тот, кто в цикле дёргает poll у тысяч задач. Рантайм — executor плюс таймеры и опрос сокетов (Tokio). .await = «возвращаю управление исполнителю до готовности»."
tags: [rust, async, future, executor]
```

```card
front: Как в Rust отменить async-задачу и чем это отличается от Go?
back: "Отмена = уничтожение future: timeout(...), проигравшая ветка select!, JoinHandle::abort(). Работа просто прекращается на ближайшем await. В Go горутину без её согласия не остановить (нужен ctx.Done()). Обратная сторона: отмена может случиться на ЛЮБОМ await — не оставляй полуобновлённое состояние между ними."
tags: [rust, async, cancellation]
```

```card
front: Защищает ли Rust от дедлоков?
back: "Нет. Гарантия «fearless concurrency» — только про гонки данных. Два мьютекса, взятые в разном порядке, скомпилируются и повиснут. Профилактика та же, что в Go: единый порядок захвата, короткие критические секции, не звать чужой код под замком."
tags: [rust, deadlock, concurrency]
```

```card
front: Почему нельзя держать std::sync::MutexGuard через .await?
back: "Guard не Send, а задача может уехать на другой поток пула — компилятор обычно ругается «future is not Send». Решения: отпустить замок до await (взять значение и выйти из критической секции) либо взять tokio::sync::Mutex, который для этого и сделан (но дороже)."
tags: [rust, async, mutex]
```

```card
front: Какие требования tokio::spawn предъявляет к задаче и почему?
back: "Send + 'static: задача может уехать на другой поток пула и пережить того, кто её породил. Отсюда move-блоки и Arc вместо ссылок — те же ограничения, что у thread::spawn."
tags: [rust, tokio, spawn, send]
```
