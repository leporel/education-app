---
id: typescript.async.cards
type: cards
title: "Асинхронность — карточки"
tags: [typescript, async, promises, cards]
status: todo
updated: 2026-09-08
---

# Карточки

## Модель исполнения

```card
front: Сколько потоков выполняет JS-код и кто выполняет долгие операции (сеть, таймеры)?
back: Один поток. Долгие операции выполняет окружение (браузер/Node), JS лишь регистрирует колбэк и идёт дальше. Это event loop.
tags: [ts, eventloop]
```

```card
front: Главное отличие конкурентности JS от Go?
back: "Go: горутины + реальный параллелизм на потоках ОС, блокирующий стиль. JS: один поток, event loop, неблокирующий await. Конкурентность есть, параллелизма твоего кода нет."
tags: [ts, async, go]
```

```card
front: Микрозадачи vs макрозадачи — что выполняется раньше?
back: После синхронного кода движок опустошает ВСЮ очередь микрозадач (промисы, .then, продолжение await), затем берёт ОДНУ макрозадачу (setTimeout, события).
tags: [ts, eventloop]
```

```card
front: "Порядок вывода: log('1'); setTimeout(()=>log('4'),0); Promise.resolve().then(()=>log('3')); log('2')?"
back: 1, 2, 3, 4. Сначала синхронные (1,2), затем микрозадача-промис (3), затем макрозадача setTimeout (4).
tags: [ts, eventloop]
```

## Promise

```card
front: Три состояния промиса?
back: pending (в процессе), fulfilled (успех, есть значение), rejected (ошибка). Переход в финальное состояние происходит ровно один раз.
tags: [ts, promise]
```

```card
front: Что означает тип Promise<T>?
back: Обещание значения типа T в будущем (в случае успеха). Аналогия — Go-канал, по которому придёт ровно один результат или ошибка.
tags: [ts, promise]
```

## async / await

```card
front: Что означает async перед функцией?
back: "Функция всегда возвращает Promise. async function f(): Promise<number> { return 5 } вернёт Promise<number>, а не число."
tags: [ts, async]
```

```card
front: Блокирует ли await поток?
back: Нет. await ставит на паузу одну async-функцию; поток уходит обслуживать другие задачи (event loop работает). Это кооперативная пауза, не блокировка.
tags: [ts, await]
```

```card
front: Какой тип у err в catch (err) со strict и почему?
back: "unknown (не Error). В JS бросить (throw) можно что угодно — строку, число. Нужно сужать: if (err instanceof Error) ..."
tags: [ts, async, error]
```

## Комбинаторы

```card
front: Promise.all — что делает и когда падает?
back: Запускает промисы конкурентно, ждёт ВСЕ, возвращает массив результатов по порядку. Падает сразу, если ЛЮБОЙ отклонился. Главный способ ускорить независимые запросы.
tags: [ts, promise, all]
```

```card
front: Чем allSettled отличается от all?
back: "allSettled ждёт все и НЕ падает на ошибке: возвращает массив { status: 'fulfilled', value } | { status: 'rejected', reason } (дискриминированный union!)."
tags: [ts, promise, allsettled]
```

```card
front: race vs any?
back: race завершается на первом завершившемся (успех ИЛИ ошибка) — удобно для таймаутов. any — на первом УСПЕШНОМ (падает только если все упали).
tags: [ts, promise, race]
```

## Грабли

```card
front: Что такое floating promise и чем опасен?
back: "Вызов async-функции без await/обработки. Промис «висит»: код не дожидается результата, ошибка теряется (unhandled rejection). JS-аналог проигнорированной ошибки в Go. Ловит линтер no-floating-promises."
tags: [ts, async, pitfall]
```

```card
front: Почему const a = await f1(); const b = await f2(); может быть медленным?
back: "Запросы идут последовательно: f2 стартует только после завершения f1. Для независимых операций быстрее Promise.all([f1(), f2()]) — оба стартуют сразу."
tags: [ts, async, performance]
```

## Eager-промисы, fetch, отмена

```card
front: Когда промис начинает выполняться — при создании или при await?
back: При создании (eager). await лишь забирает результат. Поэтому Promise.all([f(), g()]) конкурентен, а «отложить» промис можно только функцией () => f().
tags: [ts, promise, eager]
```

```card
front: Отклонится ли fetch, если сервер ответил 404 или 500?
back: "Нет. Для fetch это успешный ответ; отклонение — только на сетевой ошибке. Статус проверяют сами: if (!res.ok) throw ..."
tags: [ts, fetch]
```

```card
front: Что возвращает await res.json() с точки зрения типов и как с этим быть?
back: "По сути any — никакой проверки нет. Принимать как unknown и валидировать (type guard или zod): это граница программы."
tags: [ts, fetch, validation]
```

```card
front: Можно ли отменить промис? Как отменяют операции в JS?
back: "Сам промис отменить нельзя. Отмена — через AbortController: передать controller.signal в fetch, вызвать controller.abort(). Аналог context.WithCancel в Go."
tags: [ts, abort]
```

```card
front: Как распознать отмену запроса в catch?
back: err.name === 'AbortError' (при instanceof Error). Это не ошибка приложения — обычно её просто игнорируют.
tags: [ts, abort]
```

```card
front: Зачем отменять запросы во фронтенде?
back: "Компонент могли закрыть до ответа: без отмены будет лишняя работа и race condition, когда поздний старый ответ перезаписывает свежий. Готовый таймаут — AbortSignal.timeout(ms)."
tags: [ts, abort, frontend]
```
