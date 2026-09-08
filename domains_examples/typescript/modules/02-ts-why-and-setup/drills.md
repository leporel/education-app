---
id: typescript.ts-why-and-setup.drills
type: drills
title: "Зачем нужен TypeScript — упражнения"
tags: [typescript, setup, types, drills]
status: todo
updated: 2026-09-08
---

# Упражнения

Проверять типовые ошибки удобнее всего в TS Playground (typescriptlang.org/play) —
он показывает подсветку прямо как редактор.

## Понимание модели

```drill
type: free-form
prompt: "Объясни, почему instanceof User не работает для type User = {...}, и что использовать вместо."
answer: "type User стирается при компиляции — в рантайме его нет, instanceof не на что опереться. Проверяют реальные JS-значения: typeof, наличие свойств через 'in', проверка полей."
check: manual
```

```drill
type: multiple-choice
prompt: "Сервер прислал JSON. Как безопаснее всего принять его в TS?"
options: ["как any", "как unknown с последующей проверкой", "как User через as", "никак, TS проверит сам"]
answer: "как unknown с последующей проверкой"
check: exact
hint: TS не проверяет рантайм-данные; unknown заставит проверить вручную.
```

```drill
type: free-form
prompt: "type Meters = number; type Seconds = number; let t: Seconds = 5; let d: Meters = t; — будет ли ошибка TS? Сравни с Go."
answer: "Ошибки не будет: для TS оба типа — number (структурно совместимы). В Go именованные типы номинальны, такое присваивание не скомпилировалось бы."
check: manual
```

## any / unknown / never

```drill
type: multiple-choice
prompt: "Почему any называют 'заразным'?"
options: ["он медленный", "он отключает проверку и тихо распространяется по коду", "он занимает много памяти", "он несовместим со strict"]
answer: "он отключает проверку и тихо распространяется по коду"
check: exact
```

```drill
type: fill-in
prompt: "Безопасный тип для значения, с которым нельзя работать до проверки: const data: ___ = JSON.parse(s);"
answer: "unknown"
check: exact
```

## Структурная типизация на практике

```drill
type: free-form
prompt: "type Point = { x: number; y: number }; функция len(p: Point). Можно ли передать в len объект { x: 3, y: 4, label: 'v' }? Почему?"
answer: "Можно. Структурная типизация: у объекта есть нужные x:number и y:number, форма подходит. Лишнее поле label не мешает (при передаче существующей переменной)."
check: manual
hint: "Нюанс: при передаче объектного литерала напрямую сработал бы excess property check — тема модуля 03."
```

## Настройка и запуск

```drill
type: multiple-choice
prompt: "Команда node app.ts в Node 24 — что она делает с типами?"
options: ["проверяет и запускает", "только стирает типы и запускает, без проверки", "компилирует в app.js", "выдаёт ошибку, нужен tsc"]
answer: "только стирает типы и запускает, без проверки"
check: exact
hint: Проверку типов делают отдельно через tsc --noEmit.
```

```drill
type: free-form
prompt: "Какой флаг tsconfig самый важный для нового проекта и что он даёт?"
answer: "strict: true — включает строгие проверки, прежде всего strictNullChecks (обязательная обработка null/undefined). Без него теряется половина пользы TS."
check: manual
```

```drill
type: free-form
prompt: "Напиши сигнатуру функции, которая принимает имя (строку) и возраст (число) и возвращает строку. Используй правильный стиль аннотаций."
answer: "function describe(name: string, age: number): string { return `${name}, ${age}`; }  — аннотируем границы, тело TS выведет сам."
check: manual
```

## as, ! и чтение ошибок

```drill
type: free-form
prompt: "const n = '42' as unknown as number; n.toFixed(2); — скомпилируется ли это и что будет в рантайме?"
answer: "Скомпилируется (двойной as обходит проверку), а в рантайме упадёт TypeError: у строки нет метода toFixed. as ничего не преобразует."
check: manual
```

```drill
type: multiple-choice
prompt: "document.getElementById('root') имеет тип HTMLElement | null. Что лучше в прикладном коде?"
options: ["el!.textContent = 'hi'", "if (el) { el.textContent = 'hi' }", "(el as any).textContent = 'hi'", "разницы нет"]
answer: "if (el) { el.textContent = 'hi' }"
check: exact
hint: Сужение работает и в рантайме; ! только глушит компилятор.
```

```drill
type: free-form
prompt: "Переведи на человеческий: «Argument of type '{ id: number; }' is not assignable to parameter of type 'User'»."
answer: "«Объект { id: number } не подходит туда, где ждут User» — то есть в переданном объекте не хватает полей (или их типы не совпадают) относительно User."
check: manual
```

```drill
type: multiple-choice
prompt: "Ошибка «Property 'nmae' does not exist on type 'User'». Самая вероятная причина?"
options: ["баг компилятора", "опечатка в имени свойства", "нужен any", "нужно отключить strict"]
answer: "опечатка в имени свойства"
check: exact
```
