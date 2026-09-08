---
id: rust.concurrency-async-and-project.drills
type: drills
title: "Конкурентность, async и проект — упражнения"
tags: [rust, concurrency, threads, async, tokio, drills]
status: todo
updated: 2026-09-08
---

# Упражнения

## Потоки и Send/Sync

```drill
type: multiple-choice
prompt: "thread::spawn(move || use(rc)) где rc: Rc<i32> — что скажет компилятор?"
options: ["Всё ок", "E0277: Rc cannot be sent between threads safely (не Send) — нужен Arc", "Паника в рантайме", "Гонка данных, но компилируется"]
answer: "E0277: Rc cannot be sent between threads safely (не Send) — нужен Arc"
check: exact
hint: Rc неатомарный → не Send.
```

```drill
type: free-form
prompt: "Объясни Go-разработчику, что такое 'fearless concurrency' и чем это надёжнее -race детектора."
answer: "Send/Sync + borrow checker делают гонки данных ошибкой КОМПИЛЯЦИИ: нельзя безопасно расшарить — код не соберётся. В Go гонку (может быть) поймает -race в рантайме, и только если она проявится в тесте. Rust исключает целый класс гонок до запуска."
check: manual
```

```drill
type: fill-in
prompt: "Чтобы делить изменяемый счётчик между потоками, оборачивают его в ____ (совладение) поверх ____ (эксклюзивный доступ)."
answer: "Arc; Mutex (Arc<Mutex<T>>)"
check: fuzzy
hint: Многопоточный Rc<RefCell<T>>.
```

## Mutex и каналы

```drill
type: multiple-choice
prompt: "Чем защита данных через Mutex<T> в Rust надёжнее, чем sync.Mutex в Go?"
options: ["Ничем", "Данные внутри Mutex<T>, доступ только через lock(); guard снимает замок автоматически (RAII) — забыть нельзя", "Rust-мьютексы быстрее", "В Rust нет мьютексов"]
answer: "Данные внутри Mutex<T>, доступ только через lock(); guard снимает замок автоматически (RAII) — забыть нельзя"
check: exact
```

```drill
type: free-form
prompt: "Почему после tx.send(value) в mpsc нельзя продолжать пользоваться value?"
answer: "Владение отправленного значения переходит получателю (move в канал). Это убирает общий доступ к value после отправки — отправитель и получатель не трогают одни данные одновременно, поэтому гонок нет."
check: manual
hint: send перемещает владение.
```

## async / Tokio

```drill
type: multiple-choice
prompt: "let f = fetch(); — fetch это async fn. Что выполнилось?"
options: ["Тело fetch целиком", "Ничего: Future ленив, нужен .await или рантайм", "Только первая строка", "Запустился новый поток"]
answer: "Ничего: Future ленив, нужен .await или рантайм"
check: exact
hint: async fn возвращает ленивый Future.
```

```drill
type: multiple-choice
prompt: "Внутри async fn вызвали std::thread::sleep(Duration::from_secs(3)). Что плохого?"
options: ["Ничего", "Блокирует поток executor'а — все остальные async-задачи на нём встают; нужно tokio::time::sleep().await", "Паника", "Слишком быстро"]
answer: "Блокирует поток executor'а — все остальные async-задачи на нём встают; нужно tokio::time::sleep().await"
check: exact
hint: "Кооперативное планирование: уступай на await."
```

```drill
type: free-form
prompt: "Нужно запустить два async-запроса и дождаться обоих конкурентно (не последовательно). Что использовать и почему не await подряд?"
answer: "tokio::join!(a(), b()) — обе futures прогрессируют конкурентно, ждём обе. a().await; b().await; запустит их ПОСЛЕДОВАТЕЛЬНО (вторая стартует после завершения первой). join! даёт перекрытие ожиданий."
check: manual
hint: await подряд = последовательно.
```

```drill
type: multiple-choice
prompt: "Что ближе всего к go f() из Go?"
options: ["f().await", "tokio::spawn(async { f().await }) — отдать задачу рантайму (нужно Send + 'static)", "tokio::join!", "thread::sleep"]
answer: "tokio::spawn(async { f().await }) — отдать задачу рантайму (нужно Send + 'static)"
check: exact
```

```drill
type: multiple-choice
prompt: "Какой async-рантайм брать по умолчанию в 2026?"
options: ["async-std", "Tokio (стандарт де-факто; async-std мёртв, smol нишевый)", "встроенный в std", "любой, без разницы"]
answer: "Tokio (стандарт де-факто; async-std мёртв, smol нишевый)"
check: exact
```

## Синхронизация

```drill
type: free-form
prompt: "Коллега спрашивает, зачем .unwrap() после каждого lock(). Что ответить?"
answer: "lock() возвращает Result из-за отравления мьютекса: если поток запаниковал, держа замок, данные могли остаться полуизменёнными, и мьютекс помечается poisoned. unwrap() — политика «раз кто-то умер с замком, дальше я не иду». При желании продолжить: lock().unwrap_or_else(|e| e.into_inner())."
check: manual
hint: Poisoning.
```

```drill
type: multiple-choice
prompt: "Надо распараллелить подсчёт по кускам локального вектора; потоки точно завершатся до конца функции. Минимальный вариант?"
options: ["Arc<Mutex<Vec<_>>>", "std::thread::scope — потокам можно давать обычные ссылки", "mpsc-канал", "tokio::spawn"]
answer: "std::thread::scope — потокам можно давать обычные ссылки"
check: exact
hint: Scoped-потоки снимают требование 'static.
```

```drill
type: multiple-choice
prompt: "Данные читают десять потоков и раз в минуту обновляет один. Что взять?"
options: ["Mutex<T>", "RwLock<T> — много read(), редкий write()", "RefCell<T>", "Cell<T>"]
answer: "RwLock<T> — много read(), редкий write()"
check: exact
hint: Аналог sync.RWMutex.
```

## async

```drill
type: free-form
prompt: "Объясни своими словами, что делает executor и почему блокирующий вызов в async-функции всё ломает."
answer: "Executor в цикле дёргает poll у задач-future: каждая отвечает «готово» или «пока нет». Задача уступает управление только на .await. Если внутри неё сделать блокирующий или долгий синхронный вызов, управление не вернётся, и executor вместе с остальными задачами на этом потоке будет стоять. Решение: async-аналоги (tokio::time::sleep().await) или spawn_blocking."
check: manual
```

```drill
type: multiple-choice
prompt: "tokio::time::timeout(2s, fetch()).await вернул Err. Что стало с fetch()?"
options: ["Он продолжает работать в фоне", "Future был уничтожен (drop) — вычисление прекращено", "Он запаникует", "Он повторится автоматически"]
answer: "Future был уничтожен (drop) — вычисление прекращено"
check: exact
hint: Отмена в Rust = drop future.
```

```drill
type: multiple-choice
prompt: "Два потока берут мьютексы A и B в разном порядке. Что сделает компилятор Rust?"
options: ["Не скомпилирует: это дедлок", "Скомпилирует; дедлоки Rust не ловит — гарантия только про гонки данных", "Выдаст предупреждение clippy", "Переставит блокировки сам"]
answer: "Скомпилирует; дедлоки Rust не ловит — гарантия только про гонки данных"
check: exact
hint: Fearless — про data races.
```

```drill
type: free-form
prompt: "Задача берёт std::sync::Mutex, а затем внутри критической секции делает .await. Что не так и два способа починить?"
answer: "MutexGuard не Send, поэтому future перестаёт быть Send и tokio::spawn его не примет (ошибка «future is not Send»). Починка: 1) отпустить замок до await — взять нужное значение и выйти из критической секции; 2) использовать tokio::sync::Mutex, рассчитанный на удержание через await (дороже обычного)."
check: manual
```
