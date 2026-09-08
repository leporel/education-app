---
id: typescript.modules-tooling-project.drills
type: drills
title: "Модули, тулинг и проект — упражнения"
tags: [typescript, modules, tooling, drills]
status: todo
updated: 2026-09-08
---

# Упражнения

## Модули

```drill
type: free-form
prompt: "В файле math.ts экспортируй именованную функцию add и дефолтный класс Calc. Покажи импорт обоих в main.ts."
answer: "math.ts: export function add(a,b){return a+b}; export default class Calc {}. main.ts: import Calc, { add } from './math.ts';"
check: manual
```

```drill
type: multiple-choice
prompt: "import { debounce } from 'lodash' — откуда берётся lodash?"
options: ["из соседнего файла", "из node_modules (это пакет)", "из стандартной библиотеки", "ошибка, нужен ./"]
answer: "из node_modules (это пакет)"
check: exact
```

## npm

```drill
type: multiple-choice
prompt: "Куда поставить eslint: в dependencies или devDependencies?"
options: ["dependencies", "devDependencies", "оба", "никуда, он глобальный"]
answer: "devDependencies"
check: exact
hint: Линтер нужен только при разработке.
```

```drill
type: free-form
prompt: "Команда для добавления zod в рантайм-зависимости и @types/node в dev-зависимости?"
answer: "npm install zod  и  npm install -D @types/node"
check: manual
```

```drill
type: multiple-choice
prompt: "Зависимость '^2.3.1'. Какое обновление НЕ будет установлено автоматически?"
options: ["2.3.2", "2.4.0", "3.0.0", "2.3.9"]
answer: "3.0.0"
check: exact
hint: ^ не пускает major.
```

```drill
type: free-form
prompt: "Зачем коммитить package-lock.json? Назови аналог в Go."
answer: "Фиксирует точные версии всего дерева зависимостей → у всех и в проде одинаковые версии (воспроизводимость). Аналог go.sum."
check: manual
```

## Тулинг

```drill
type: free-form
prompt: "Назови два примера проблем, которые поймает ESLint, но НЕ поймает компилятор TS."
answer: "Например: floating promise (забытый await), неиспользуемые переменные, == вместо ===, забытый console.log, использование any. Это паттерны, а не ошибки типов."
check: manual
```

```drill
type: multiple-choice
prompt: "Ты пишешь CLI на Node (без браузера). Нужен ли бандлер?"
options: ["обязательно", "часто нет — Node сам выполняет модули (а .ts в Node 24 напрямую)", "только Vite", "только webpack"]
answer: "часто нет — Node сам выполняет модули (а .ts в Node 24 напрямую)"
check: exact
```

```drill
type: free-form
prompt: "Установил пакет на чистом JS, TS ругается 'Could not find a declaration file'. Что попробовать?"
answer: "Поставить пакет типов из DefinitelyTyped: npm i -D @types/<имя>. Если его нет — объявить модуль вручную или временно any."
check: manual
```

## node_modules, npx, тесты

```drill
type: multiple-choice
prompt: "Что из этого НЕ должно попадать в git?"
options: ["package.json", "package-lock.json", "node_modules", "tsconfig.json"]
answer: "node_modules"
check: exact
hint: Восстанавливается из lock-файла командой npm ci.
```

```drill
type: free-form
prompt: "Чем npx tsc отличается от tsc, установленного глобально? Почему первое предпочтительнее?"
answer: "npx tsc берёт версию из node_modules проекта. Глобальная версия у всех своя — сборка перестаёт быть воспроизводимой. Инструменты ставим локально (-D) и вызываем через npx или npm scripts."
check: manual
```

```drill
type: free-form
prompt: "Напиши минимальный тест функции add(2,3)===5 двумя способами: node:test и Vitest."
answer: "node:test: import { test } from 'node:test'; import assert from 'node:assert/strict'; test('add', () => assert.equal(add(2,3), 5)); | Vitest: import { it, expect } from 'vitest'; it('add', () => expect(add(2,3)).toBe(5));"
check: manual
```

```drill
type: multiple-choice
prompt: "Проект на Vite + Vue. Какой раннер тестов логичнее взять?"
options: ["node:test", "Vitest", "оба одновременно", "тесты не нужны"]
answer: "Vitest"
check: exact
hint: Он использует ту же конфигурацию сборки, что и Vite.
```
