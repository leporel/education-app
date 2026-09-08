---
id: typescript.async.lesson-01
type: lesson
title: "Урок 01 — От колбэков к async/await"
tags: [typescript, async, lesson]
status: todo
updated: 2026-06-26
---

# Урок 01 — От колбэков к async/await

Цель: проследить эволюцию асинхронного кода — колбэк → промис → `async/await` — и
закрепить правильную обработку ошибок. Это код, который ты будешь писать каждый день.

## Разогрев

- Почему `await` не блокирует поток?
- Что вернёт `async function f() { return 1 }`?
- Какой тип у `err` в `catch`?

## Шаг 1. Заготовки (имитируем сеть)

```ts
// имитация сетевого запроса: возвращает промис через 300 мс
function fetchUser(id: number): Promise<{ id: number; name: string }> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id <= 0) reject(new Error(`bad id: ${id}`));
      else resolve({ id, name: `User${id}` });
    }, 300);
  });
}
```

## Шаг 2. Боль колбэков (исторический контекст)

Когда-то асинхронность писали так — колбэк внутри колбэка внутри колбэка:

```ts
// УСТАРЕЛО, просто чтобы прочувствовать боль
function loadUserCallback(id: number, cb: (err: Error | null, name?: string) => void) {
  setTimeout(() => {
    if (id <= 0) cb(new Error("bad id"));
    else cb(null, `User${id}`);
  }, 300);
}

loadUserCallback(1, (err, name) => {
  if (err) { console.error(err); return; }
  console.log(name);
  // а если нужен ещё запрос — вложенный колбэк, и так вглубь... «callback hell»
});
```

Видишь, как обработка ошибок размазана и вложенность растёт? Промисы это распрямили.

## Шаг 3. Промисы с .then/.catch

```ts
fetchUser(1)
  .then((user) => {
    console.log("Имя:", user.name);
    return fetchUser(user.id + 1);   // вернули промис — цепочка продолжается
  })
  .then((next) => console.log("Следующий:", next.name))
  .catch((err) => console.error("Упало:", err));
```

Уже лучше: ошибки одного `.catch` ловят всю цепочку. Но при ветвлениях и многих шагах
`.then` всё ещё громоздки.

## Шаг 4. async/await — финальная форма

```ts
async function showUsers(): Promise<void> {
  try {
    const first = await fetchUser(1);
    console.log("Имя:", first.name);

    const second = await fetchUser(first.id + 1);
    console.log("Следующий:", second.name);
  } catch (err) {
    if (err instanceof Error) {
      console.error("Упало:", err.message);
    } else {
      console.error("Неизвестная ошибка:", err);
    }
  }
}

showUsers();
```

Читается сверху вниз, как обычный синхронный код. Ошибки — обычный `try/catch`. Это и
есть то, ради чего всё затевалось. Обрати внимание на проверку `err instanceof Error` —
без неё TS не даст обратиться к `err.message`, потому что тип `err` это `unknown`.

## Шаг 5. async-функция всегда возвращает промис

```ts
async function double(n: number): Promise<number> {
  return n * 2;       // вернули число, но обёрнуто в Promise
}

const result = await double(21);   // 42 — await развернул промис
console.log(result);

// без await получишь сам промис:
const p = double(21);              // p: Promise<number>
```

Запомни: внутри `async` любой `return x` превращается в «промис, разрешённый значением
`x`». Поэтому тип возврата `async`-функции всегда `Promise<...>`.

## Mini-drill

```drill
type: free-form
prompt: "Перепиши через async/await: fetchUser(1).then(u => fetchPosts(u.id)).then(posts => console.log(posts.length)).catch(console.error)"
answer: "async function run(){ try { const u = await fetchUser(1); const posts = await fetchPosts(u.id); console.log(posts.length); } catch (e) { console.error(e); } }"
check: manual
```

```drill
type: free-form
prompt: "Что не так: async function load() { const u = fetchUser(1); console.log(u.name); }"
answer: "Забыт await: u — это Promise, а не объект. u.name даст ошибку. Нужно const u = await fetchUser(1)."
check: manual
```

```drill
type: multiple-choice
prompt: "Внутри async-функции return { id: 1 }. Какой тип вернёт вызов функции?"
options: ["{ id: number }", "Promise<{ id: number }>", "void", "Promise<void>"]
answer: "Promise<{ id: number }>"
check: exact
```

## Итог

Эволюция ясна: колбэки (вложенность и размазанные ошибки) → промисы (`.then/.catch`,
плоско, но громоздко) → `async/await` (последовательное чтение + обычный `try/catch`).
В современном коде пишешь `async/await`, а ошибки ловишь `try/catch`, не забывая, что
`err` — это `unknown` и его надо сузить. Дальше — как запускать много асинхронных
операций эффективно.
