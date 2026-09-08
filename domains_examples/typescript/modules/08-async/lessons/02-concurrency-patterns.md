---
id: typescript.async.lesson-02
type: lesson
title: "Урок 02 — Паттерны конкурентности"
tags: [typescript, async, concurrency, lesson]
status: todo
updated: 2026-09-08
---

# Урок 02 — Паттерны конкурентности

Цель: научиться запускать асинхронные операции эффективно — параллелить независимое,
ограничивать одновременность, ставить таймауты — и понять, как это соотносится с
горутинами Go.

## Разогрев

- Почему `await` подряд для независимых запросов — медленно?
- Чем `Promise.all` отличается от `allSettled`?
- Что такое floating promise?

## Шаг 1. Последовательно vs параллельно — измерим разницу

```ts
function fetchUser(id: number): Promise<{ id: number }> {
  return new Promise((r) => setTimeout(() => r({ id }), 1000));  // ~1 сек каждый
}

// МЕДЛЕННО: ~3 секунды (по очереди)
async function sequential() {
  const a = await fetchUser(1);
  const b = await fetchUser(2);
  const c = await fetchUser(3);
  return [a, b, c];
}

// БЫСТРО: ~1 секунда (все стартуют разом)
async function parallel() {
  const [a, b, c] = await Promise.all([fetchUser(1), fetchUser(2), fetchUser(3)]);
  return [a, b, c];
}
```

Та же работа — втрое быстрее, потому что ожидания накладываются. Это бесплатный выигрыш
для любых независимых операций. Правило: **независимое — через `Promise.all`**.

> Параллель с Go: `parallel()` похоже на запуск трёх горутин и сбор результатов через
> `sync.WaitGroup`/каналы. Но важно: в JS «параллельно» ждёт сеть (окружение), а твой
> JS-код всё равно однопоточный. Для ввода-вывода разницы в ощущениях нет; для тяжёлых
> вычислений (CPU) — есть, их так не ускоришь (нужны Web Workers, отдельная тема).

## Шаг 2. allSettled — когда падение одного не должно ронять всё

```ts
async function loadAll(ids: number[]) {
  const results = await Promise.allSettled(ids.map((id) => fetchUser(id)));

  const ok = results
    .filter((r) => r.status === "fulfilled")     // сужаем дискриминированный union
    .map((r) => (r as PromiseFulfilledResult<{ id: number }>).value);

  const failed = results.filter((r) => r.status === "rejected").length;
  console.log(`Загружено ${ok.length}, ошибок ${failed}`);
  return ok;
}
```

`allSettled` никогда не падает — он сообщает судьбу каждого. Результат — массив
дискриминированных union (`fulfilled`/`rejected`), знакомых по модулю 04. Это правильный
выбор, когда «загрузить что получится» лучше, чем «всё или ничего».

> Про `as PromiseFulfilledResult<...>` в примере: исторически после `.filter(...)` тип
> элемента не сужался, и приходилось помогать компилятору вручную. В современном TS
> (начиная с 5.5) вывод предикатов для колбэков `filter` работает автоматически, и код
> можно писать без `as`:
>
> ```ts
> const ok = results
>   .filter((r) => r.status === "fulfilled")   // тип уже PromiseFulfilledResult<...>[]
>   .map((r) => r.value);
> ```
>
> Если в твоей версии TS сужение не сработало, есть переносимый вариант — свой предикат:
> `const isOk = <T>(r: PromiseSettledResult<T>): r is PromiseFulfilledResult<T> =>
> r.status === "fulfilled";`

## Шаг 3. Таймаут через race

```ts
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`timeout after ${ms}ms`)), ms),
  );
  return Promise.race([promise, timeout]);   // кто первый: результат или будильник
}

// использование
try {
  const user = await withTimeout(fetchUser(1), 500);
  console.log(user);
} catch (err) {
  console.error(err);   // "timeout after 500ms", если запрос не успел
}
```

`race` завершается первым же завершившимся промисом. Ставим «гонку» рабочего промиса с
таймером-будильником — получаем таймаут. Дженерик `<T>` (модуль 05) делает обёртку
типобезопасной для любого промиса.

## Шаг 4. Ограничение одновременности (короткий рецепт)

Иногда нельзя запускать 1000 запросов разом (перегрузишь сервер). Тогда работают
порциями:

```ts
async function inBatches<T, R>(
  items: T[],
  batchSize: number,
  worker: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const done = await Promise.all(batch.map(worker));   // параллельно внутри порции
    results.push(...done);                                // ждём порцию перед следующей
  }
  return results;
}
```

Внутри порции — параллельно (`Promise.all`), между порциями — последовательно (`await`
в цикле здесь оправдан). Это компромисс между скоростью и нагрузкой. (В реальных
проектах для этого берут готовые библиотеки вроде `p-limit`, но понимать механику
полезно.)

## Mini-drill

```drill
type: free-form
prompt: "Есть массив ids. Загрузи всех пользователей параллельно и верни массив их name."
answer: "const users = await Promise.all(ids.map(fetchUser)); return users.map(u => u.name);"
check: manual
```

```drill
type: free-form
prompt: "Объясни, почему withTimeout использует Promise<never> для таймаут-промиса, а не Promise<T>."
answer: "Таймаут-промис только отклоняется (никогда не резолвит значение), поэтому его тип значения — never. В race общий тип результата остаётся T (от рабочего промиса)."
check: manual
```

```drill
type: multiple-choice
prompt: "Запросы независимы, их 3, каждый ~1 сек. Через await подряд это займёт ~3с, через Promise.all — ?"
options: ["~3 с", "~1 с", "~0 с", "~9 с"]
answer: "~1 с"
check: exact
```

```drill
type: free-form
prompt: "Когда между порциями в inBatches нужен await (последовательность), а внутри порции — Promise.all (параллельность)?"
answer: "Внутри порции операции независимы → параллелим для скорости. Между порциями ждём завершения текущей, чтобы не превысить лимит одновременных запросов к серверу."
check: manual
```

## Итог

Главные паттерны: **независимое — параллель через `Promise.all`** (часто кратное
ускорение); **`allSettled`** — когда падение одного не должно ронять остальное;
**`race`** — для таймаутов; **порции** — чтобы не перегрузить ресурс. И всегда помни про
floating promises: каждый промис должен быть `await`-нут или явно обработан. По
ощущениям код близок к работе с горутинами Go, но под капотом — один поток и event loop,
и это особенно важно держать в голове для тяжёлых вычислений (их асинхронность не
ускорит).
