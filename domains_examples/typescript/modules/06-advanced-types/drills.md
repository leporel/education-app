---
id: typescript.advanced-types.drills
type: drills
title: "Продвинутые типы — упражнения"
tags: [typescript, advanced-types, drills]
status: todo
updated: 2026-09-08
---

# Упражнения

Эти упражнения особенно полезно проверять в Playground — наводи курсор на тип и смотри,
во что он раскрывается.

## Операторы типов

```drill
type: free-form
prompt: "type Point = { x: number; y: number; z: number }. Что такое keyof Point и Point[keyof Point]?"
answer: "keyof Point = 'x' | 'y' | 'z'. Point[keyof Point] = number (union типов значений, тут все number → number)."
check: manual
```

```drill
type: fill-in
prompt: "Получить тип из значения const settings = { dark: true }: type Settings = ___ settings;"
answer: "typeof"
check: exact
```

## Mapped / conditional

```drill
type: free-form
prompt: "Напиши mapped type Nullable<T>, делающий каждое свойство T типом (его тип | null)."
answer: "type Nullable<T> = { [K in keyof T]: T[K] | null };"
check: manual
```

```drill
type: multiple-choice
prompt: "type R<T> = T extends any[] ? 'array' : 'other'. Чему равен R<string[]>?"
options: ["'array'", "'other'", "string", "never"]
answer: "'array'"
check: exact
```

```drill
type: free-form
prompt: "Что вернёт type E = T extends (infer U)[] ? U : never для T = Date[]?"
answer: "Date — infer U извлёк тип элемента массива."
check: manual
```

## Utility types

```drill
type: multiple-choice
prompt: "type User = { id: number; name: string; email: string }. Что такое Omit<User, 'email'>?"
options: ["{ email: string }", "{ id: number; name: string }", "{ id; name; email }", "{ email?: string }"]
answer: "{ id: number; name: string }"
check: exact
```

```drill
type: free-form
prompt: "Опиши тип аргумента функции createUser, принимающей все поля User, кроме id и createdAt (их генерит сервер). User = { id; name; email; createdAt }."
answer: "Omit<User, 'id' | 'createdAt'> → { name: string; email: string }."
check: manual
```

```drill
type: free-form
prompt: "Функция fetchUser возвращает Promise<{ id: number }>. Как одним типом получить { id: number } из её сигнатуры?"
answer: "Awaited<ReturnType<typeof fetchUser>> — ReturnType даёт Promise<{id}>, Awaited разворачивает до {id: number}."
check: manual
hint: Композиция двух utility-типов.
```

## as const и дисциплина

```drill
type: free-form
prompt: "const sizes = ['s', 'm', 'l']. Какой тип у sizes? Как через as const и индексирование получить тип 's' | 'm' | 'l'?"
answer: "Без as const: string[]. С const sizes = ['s','m','l'] as const → readonly ['s','m','l']; тип (typeof sizes)[number] = 's' | 'm' | 'l'."
check: manual
```

```drill
type: multiple-choice
prompt: "Когда стоит писать сложный conditional/mapped тип в прикладном коде?"
options: ["всегда, это круто", "когда он проясняет намерение и читаем; иначе предпочесть простой тип", "никогда", "только если компилятор требует"]
answer: "когда он проясняет намерение и читаем; иначе предпочесть простой тип"
check: exact
```

## satisfies и union-утилиты

```drill
type: free-form
prompt: "Есть type Route = { path: string; auth: boolean }. Опиши объект routes с ключами home/admin так, чтобы (1) форма проверялась, (2) routes.home.path имел тип '/' , (3) обращение к несуществующему ключу было ошибкой."
answer: "const routes = { home: { path: '/', auth: false }, admin: { path: '/admin', auth: true } } satisfies Record<string, Route>;"
check: manual
hint: Аннотация типа тут не подойдёт — она расширит типы и разрешит любой ключ.
```

```drill
type: multiple-choice
prompt: "type Method = 'GET' | 'POST' | 'DELETE'. Чему равен Exclude<Method, 'DELETE'>?"
options: ["'DELETE'", "'GET' | 'POST'", "never", "Method"]
answer: "'GET' | 'POST'"
check: exact
```

```drill
type: free-form
prompt: "Чем Omit отличается от Exclude? Приведи по одному применению."
answer: "Omit работает с объектными типами (Omit<User,'id'> убирает свойство). Exclude работает с union (Exclude<Method,'DELETE'> убирает члена объединения)."
check: manual
```

```drill
type: multiple-choice
prompt: "const cfg = { port: 3000 } as const satisfies { port: number }. Какой тип у cfg.port?"
options: ["number", "3000", "any", "readonly number"]
answer: "3000"
check: exact
hint: as const фиксирует литерал, satisfies только проверяет соответствие.
```
