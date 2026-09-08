---
id: typescript.unions-narrowing.lesson-02
type: lesson
title: "Урок 02 — Моделируем состояние дискриминированными union"
tags: [typescript, discriminated, lesson]
status: todo
updated: 2026-06-26
---

# Урок 02 — Моделируем состояние дискриминированными union

Цель: освоить приём, который ты будешь применять постоянно — описывать состояние
программы так, чтобы неправильные комбинации нельзя было даже выразить. Это любимый
паттерн фронтенда (загрузка данных) и просто хорошего проектирования.

## Разогрев

- Что такое поле-дискриминант и зачем ему литеральный тип?
- Как `never` ловит забытый `case`?
- Чем это лучше Go-шного `(value, error)`?

## Шаг 1. Боль без дискриминанта

Представь, что состояние загрузки данных описали «как привыкли» — одним объектом со
всеми возможными полями:

```ts
// ПЛОХО: невалидные состояния возможны
type BadState = {
  loading: boolean;
  data?: string;
  error?: string;
};
```

Что не так? Возможны бессмысленные комбинации: `loading: true` и при этом уже есть
`data`. Или одновременно `data` и `error`. Тип ничего не запрещает — проверки
вырождаются в кучу `if`, и легко забыть случай. Это та самая «строка `NaN`», только на
уровне архитектуры.

## Шаг 2. Дискриминированный union: невозможные состояния исчезают

```ts
type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: string }
  | { status: "error"; message: string };
```

Теперь `data` существует **только** в состоянии `success`, а `message` — **только** в
`error`. Нет способа создать «загрузку с данными» или «успех с ошибкой» — компилятор
не даст. Поле `status` с литеральным типом — наш дискриминант.

## Шаг 3. Обработка с автоматическим сужением

```ts
function render(state: State): string {
  switch (state.status) {
    case "idle":
      return "Нажмите кнопку";
    case "loading":
      return "Загрузка…";
    case "success":
      return `Готово: ${state.data}`;      // state.data доступен — это success
    case "error":
      return `Ошибка: ${state.message}`;   // state.message доступен — это error
    default:
      return assertNever(state);           // проверка исчерпанности (шаг 4)
  }
}
```

В каждой ветке `switch` TS точно знает форму `state`. Попробуй в ветке `"loading"`
написать `state.data` — компилятор подсветит ошибку: в загрузке данных нет.

## Шаг 4. Страховка на будущее: assertNever

```ts
function assertNever(x: never): never {
  throw new Error("Необработанное состояние: " + JSON.stringify(x));
}
```

Зачем это: если завтра кто-то добавит в `State` новый вариант
`{ status: "cancelled" }`, но забудет дописать `case "cancelled"`, то в `default`
переменная `state` будет иметь тип не `never`, а `{ status: "cancelled" }`, и вызов
`assertNever(state)` **перестанет компилироваться** — TS укажет точное место. Компилятор
работает напоминалкой, которую невозможно проигнорировать.

> В Go добавь ты новую константу в «enum» — компилятор промолчит про забытые `switch`.
> Здесь же забыть вариант физически не дадут (если используешь `assertNever`). Это
> мощный аргумент в пользу дискриминированных union.

## Шаг 5. Применяем

```ts
let s: State = { status: "idle" };
console.log(render(s));                       // Нажмите кнопку

s = { status: "loading" };
console.log(render(s));                       // Загрузка…

s = { status: "success", data: "42 записи" };
console.log(render(s));                       // Готово: 42 записи

s = { status: "error", message: "нет сети" };
console.log(render(s));                       // Ошибка: нет сети
```

## Mini-drill

```drill
type: free-form
prompt: "Опиши дискриминированный union Shape: circle(r), rectangle(w,h), triangle(base, height). Поле-тег kind."
answer: "type Shape = { kind: 'circle'; r: number } | { kind: 'rectangle'; w: number; h: number } | { kind: 'triangle'; base: number; height: number };"
check: manual
```

```drill
type: free-form
prompt: "Напиши функцию area(s: Shape): number со switch по s.kind и веткой default через assertNever для исчерпанности."
answer: "switch(s.kind){ case 'circle': return Math.PI*s.r**2; case 'rectangle': return s.w*s.h; case 'triangle': return s.base*s.height/2; default: return assertNever(s);}"
check: manual
```

```drill
type: multiple-choice
prompt: "Почему BadState с loading/data?/error? — плохой дизайн?"
options: ["слишком длинный", "разрешает невозможные комбинации (loading + data, data + error)", "не компилируется", "медленный в рантайме"]
answer: "разрешает невозможные комбинации (loading + data, data + error)"
check: exact
```

## Итог

Дискриминированный union — это «сделай невозможные состояния непредставимыми» в
действии. Общий тег с литеральным типом включает автоматическое сужение в `switch`, а
`assertNever` превращает компилятор в страховку от забытых веток при будущих
изменениях. Это, пожалуй, самый ценный приём проектирования из всего курса TS —
встречаться с ним ты будешь постоянно, особенно когда дойдёшь до Vue.
