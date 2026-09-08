---
id: typescript.async.drills
type: drills
title: "Асинхронность — упражнения"
tags: [typescript, async, promises, drills]
status: todo
updated: 2026-09-08
---

# Упражнения

## Event loop

```drill
type: multiple-choice
prompt: "Порядок вывода: console.log('A'); Promise.resolve().then(()=>console.log('B')); console.log('C')?"
options: ["A B C", "A C B", "B A C", "C B A"]
answer: "A C B"
check: exact
hint: Синхронные сначала (A, C), затем микрозадача-промис (B).
```

```drill
type: free-form
prompt: "Объясни, почему setTimeout(fn, 0) выполнится позже, чем уже стоящий в очереди .then промиса."
answer: "setTimeout — макрозадача, .then — микрозадача. Движок опустошает все микрозадачи перед тем, как взять макрозадачу. Поэтому промис раньше."
check: manual
```

## async / await

```drill
type: free-form
prompt: "Напиши async-функцию loadName(id: number): Promise<string>, которая await'ит fetchUser(id) и возвращает user.name."
answer: "async function loadName(id: number): Promise<string> { const u = await fetchUser(id); return u.name; }"
check: manual
```

```drill
type: multiple-choice
prompt: "async function f() { return 5 } — что вернёт вызов f()?"
options: ["5", "Promise<number>", "Promise<void>", "ошибку"]
answer: "Promise<number>"
check: exact
```

```drill
type: free-form
prompt: "Перепиши обработку ошибок правильно: try { await save() } catch (err) { /* напечатать сообщение, если это Error, иначе 'unknown' */ }"
answer: "catch (err) { if (err instanceof Error) console.error(err.message); else console.error('unknown', err); } — err имеет тип unknown, нужно сужение."
check: manual
```

## Комбинаторы

```drill
type: free-form
prompt: "Есть fetchUser(id) для id 1,2,3. Загрузи всех троих максимально быстро и собери в массив."
answer: "const users = await Promise.all([fetchUser(1), fetchUser(2), fetchUser(3)]); — конкурентный старт всех трёх."
check: manual
```

```drill
type: multiple-choice
prompt: "Нужно дождаться всех запросов и узнать, какие упали, а какие нет, не прерываясь на первой ошибке. Какой комбинатор?"
options: ["Promise.all", "Promise.allSettled", "Promise.race", "Promise.any"]
answer: "Promise.allSettled"
check: exact
```

```drill
type: free-form
prompt: "Реализуй таймаут: функция withTimeout(p: Promise<T>, ms): Promise<T>, которая отклоняется, если p не успел за ms. Какой комбинатор в основе?"
answer: "Promise.race([p, new Promise<never>((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]). race завершится первым — либо p, либо таймаут-ошибка."
check: manual
hint: "race с двумя промисами: рабочий и «будильник»."
```

## Грабли

```drill
type: multiple-choice
prompt: "function handler() { save(); } где save — async. В чём проблема?"
options: ["ничего", "floating promise: не дождались результата, ошибка потеряется", "save не запустится", "ошибка компиляции всегда"]
answer: "floating promise: не дождались результата, ошибка потеряется"
check: exact
```

```drill
type: free-form
prompt: "Код: for (const id of ids) { await process(id); }. Когда это уместно, а когда стоит заменить на Promise.all(ids.map(process))?"
answer: "Уместно, если шаги зависят друг от друга / нужен порядок. Если операции независимы — Promise.all кратно быстрее (конкурентный старт)."
check: manual
```

## Eager, fetch, отмена

```drill
type: multiple-choice
prompt: "const p = fetchUser(1); await delay(1000); const u = await p; — когда был отправлен запрос?"
options: ["на строке await p", "сразу на строке const p = ...", "после delay", "никогда"]
answer: "сразу на строке const p = ..."
check: exact
hint: "Промисы жадные: работа начинается при создании."
```

```drill
type: free-form
prompt: "Почему Promise.all([f, g]) (без вызовов) не работает, а Promise.all([f(), g()]) — работает?"
answer: "all ожидает промисы, а f и g — функции. Промис создаётся (и стартует) только при вызове: f(). Передача функций нужна там, где старт нужно отложить (очереди, пулы)."
check: manual
```

```drill
type: free-form
prompt: "Напиши loadUser(id): Promise<User> через fetch с корректной проверкой статуса и честным типом тела ответа."
answer: "const res = await fetch(url); if (!res.ok) throw new Error(`HTTP ${res.status}`); const data: unknown = await res.json(); — далее валидация/type guard перед возвратом User."
check: manual
hint: fetch не падает на 404/500, а res.json() по типам — any.
```

```drill
type: free-form
prompt: "Как отменить запрос, если пользователь ушёл со страницы? Приведи схему кода и назови аналог механизма в Go."
answer: "const c = new AbortController(); fetch(url, { signal: c.signal }); при уходе — c.abort(); в catch игнорировать err.name === 'AbortError'. Аналог: context.WithCancel + cancel()."
check: manual
```

```drill
type: multiple-choice
prompt: "Нужен таймаут 5 секунд на fetch. Самый короткий штатный способ?"
options: ["setTimeout вокруг await", "AbortSignal.timeout(5000) в signal", "Promise.any", "ничего нельзя сделать"]
answer: "AbortSignal.timeout(5000) в signal"
check: exact
hint: Promise.race с будильником тоже сработает, но не остановит сам запрос.
```
