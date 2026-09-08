---
id: typescript.advanced-types.lesson-01
type: lesson
title: "Урок 01 — Utility-типы на практике"
tags: [typescript, advanced-types, lesson]
status: todo
updated: 2026-06-26
---

# Урок 01 — Utility-типы на практике

Цель: научиться выводить производные типы из одной модели данных, не дублируя её, —
это повседневный навык, который экономит уйму ручной работы и держит типы согласованными.

## Разогрев

- Что делает `keyof`, а что `typeof` в позиции типа?
- Чем `Pick` отличается от `Omit`?
- Как читается `Partial<Omit<User, "id">>`?

## Ситуация: одна модель — много её «проекций»

В реальном коде у сущности есть много форм: полная запись из БД, форма для создания
(без серверных полей), форма для обновления (всё необязательно), публичная форма (без
секретов). Описывать каждую руками — это четыре источника правды, которые рано или
поздно разойдутся. Выведем их из одной.

```ts
interface User {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}
```

## Шаг 1. Форма создания: без серверных полей

`id`, `createdAt`, `passwordHash` сервер устанавливает сам. Клиент присылает остальное:

```ts
type CreateUserInput = Omit<User, "id" | "createdAt" | "passwordHash">;
// = { name: string; email: string }

function createUser(input: CreateUserInput): User {
  return {
    id: Math.floor(Math.random() * 1000),
    createdAt: new Date(),
    passwordHash: "…",
    ...input,
  };
}

createUser({ name: "Ann", email: "a@b.c" });   // OK
createUser({ name: "Ann", email: "a@b.c", id: 5 }); // ❌ id нельзя слать
```

## Шаг 2. Форма обновления: всё необязательно, кроме того, что менять нельзя

```ts
type UpdateUserInput = Partial<Omit<User, "id" | "createdAt">>;
// = { name?: string; email?: string; passwordHash?: string }

function updateUser(id: number, patch: UpdateUserInput): void { /* ... */ }

updateUser(1, { name: "Bob" });            // OK — частичное обновление
updateUser(1, {});                          // OK — пустой патч допустим
updateUser(1, { id: 2 });                   // ❌ id исключён
```

Один тип выражает правило «можно прислать любое подмножество изменяемых полей». Поменяй
`User` — обе производные формы обновятся автоматически.

## Шаг 3. Публичная форма: без секретов

```ts
type PublicUser = Omit<User, "passwordHash">;

function toPublic(u: User): PublicUser {
  const { passwordHash, ...rest } = u;   // деструктуризация: вынули секрет, остальное в rest
  return rest;
}
```

Тип `PublicUser` гарантирует на уровне компилятора, что `passwordHash` не утечёт в
ответе. Забудешь убрать поле — типы не сойдутся.

## Шаг 4. Record для словарей

`Record<K, V>` — типобезопасный объект-словарь:

```ts
type Role = "admin" | "editor" | "viewer";

const permissions: Record<Role, string[]> = {
  admin:  ["read", "write", "delete"],
  editor: ["read", "write"],
  viewer: ["read"],
  // забудешь любую роль — ❌ ошибка: компилятор требует ВСЕ ключи из Role
};
```

Прелесть: если в `Role` добавят `"owner"`, объект `permissions` перестанет
компилироваться, пока не пропишешь права для новой роли. Снова компилятор-напоминалка.

## Шаг 5. as const как источник литеральных типов

```ts
const STATUSES = ["draft", "published", "archived"] as const;

type Status = (typeof STATUSES)[number];   // "draft" | "published" | "archived"

function setStatus(s: Status) { /* ... */ }
setStatus("draft");      // OK
setStatus("deleted");    // ❌ нет такого статуса
```

Массив-данные `STATUSES` живёт и в рантайме (по нему можно итерироваться, рисовать
выпадашку), и порождает точный тип `Status`. Один источник истины для значения и типа.

## Mini-drill

```drill
type: free-form
prompt: "Из interface Article { id; title; body; authorId; createdAt } выведи тип CreateArticleInput без id и createdAt."
answer: "type CreateArticleInput = Omit<Article, 'id' | 'createdAt'>;"
check: manual
```

```drill
type: free-form
prompt: "Выведи тип ArticlePreview, содержащий ТОЛЬКО id и title (через Pick)."
answer: "type ArticlePreview = Pick<Article, 'id' | 'title'>;"
check: manual
```

```drill
type: multiple-choice
prompt: "const COLORS = ['red','green'] as const. Чему равен (typeof COLORS)[number]?"
options: ["string", "'red' | 'green'", "string[]", "readonly string[]"]
answer: "'red' | 'green'"
check: exact
```

```drill
type: free-form
prompt: "Опиши Record<Status, number> для подсчёта статей по статусу из шага 5. Что потребует компилятор?"
answer: "const counts: Record<Status, number> = { draft: 0, published: 0, archived: 0 }; — компилятор потребует ВСЕ ключи Status."
check: manual
```

## Итог

Utility-типы превращают одну модель данных в семейство согласованных производных форм
(`Omit`, `Pick`, `Partial`, `Record`) без дублирования и ручной синхронизации. Связка
`as const` + `typeof` + индексирование даёт единый источник истины для значений и типов.
Это не «магия ради магии», а именно тот уровень продвинутых типов, который реально
окупается в каждом проекте — в отличие от глубокой type-level эквилибристики, которую
стоит оставить авторам библиотек.
