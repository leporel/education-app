---
id: vue.composables-and-patterns.lesson-01
type: lesson
title: "Урок 01 — Пишем свои composables"
tags: [vue, composables, lesson]
status: todo
updated: 2026-06-26
---

# Урок 01 — Пишем свои composables

Цель: написать два настоящих composable — `useMouse` (локальное состояние + подписка на
окно + уборка) и `useLocalStorage` (реактивная синхронизация с хранилищем) — и почувствовать
разницу «экземпляр на вызов» vs «синглтон на модуле».

## Разогрев

- Почему composable отдаёт `ref`, а не `reactive`?
- Что обязательно сделать, если в composable подписался на событие `window`?

## Шаг 1. `useMouse` — состояние + эффект + уборка

```ts
// useMouse.ts
import { ref, onMounted, onUnmounted } from "vue";

export function useMouse() {
  const x = ref(0);
  const y = ref(0);

  function update(e: MouseEvent): void {
    x.value = e.clientX;
    y.value = e.clientY;
  }

  onMounted(() => window.addEventListener("mousemove", update));
  onUnmounted(() => window.removeEventListener("mousemove", update));   // уборка!

  return { x, y };
}
```

Вся фича — состояние, обработчик, подписка и **отписка** — упакована в одну функцию. Самое
важное: lifecycle-хуки работают **внутри** composable, привязываясь к компоненту, который
его вызвал. То есть `onUnmounted` сработает, когда размонтируется *этот* компонент. Подписку
завели — отписку обязаны сделать, иначе листенер на `window` переживёт компонент (утечка).

Использование — и сразу проверим «экземпляр на вызов»:

```vue
<script setup lang="ts">
import { useMouse } from "./useMouse";

const a = useMouse();   // свой { x, y }
const b = useMouse();   // ДРУГОЙ независимый { x, y }
</script>

<template>
  <p>Мышь: {{ a.x }}, {{ a.y }}</p>
</template>
```

`a` и `b` — независимые: каждый вызов `useMouse()` создал свои `ref`-ы и свою подписку.
Состояние объявлено **внутри** функции → экземпляр на вызов.

## Шаг 2. `useLocalStorage` — реактивность ↔ хранилище

Хотим `ref`, который автоматически сохраняется в `localStorage` и переживает перезагрузку:

```ts
// useLocalStorage.ts
import { ref, watch, type Ref } from "vue";

export function useLocalStorage<T>(key: string, initial: T): Ref<T> {
  const raw = localStorage.getItem(key);
  // читаем сохранённое (с защитой от битого JSON), иначе берём начальное
  const start: T = raw !== null ? safeParse<T>(raw, initial) : initial;

  const state = ref(start) as Ref<T>;

  // любой эффект-сайд (запись в стораж) — это watch, не computed
  watch(
    state,
    (value) => localStorage.setItem(key, JSON.stringify(value)),
    { deep: true },
  );

  return state;
}

function safeParse<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;   // не доверяем содержимому хранилища — оно могло быть испорчено
  }
}
```

Использование:

```vue
<script setup lang="ts">
import { useLocalStorage } from "./useLocalStorage";

const theme = useLocalStorage<"light" | "dark">("theme", "light");
// меняешь theme.value — оно само пишется в localStorage и переживёт F5
</script>
```

Здесь видно дисциплину из теории: запись в хранилище — **побочный эффект**, поэтому `watch`,
а не `computed`. И защита `safeParse`: данные из хранилища — это «внешний ввод», которому мы
не доверяем (вспомни серверные гайдлайны: не доверяй данным извне, даже если «извне» — это
localStorage пользователя).

## Шаг 3. Синглтон, когда он реально нужен

Допустим, нужен один общий тоггл боковой панели — общий для шапки и сайдбара. Объявим
состояние **на уровне модуля**:

```ts
// useSidebar.ts
import { ref } from "vue";

const isOpen = ref(false);   // ОДИН на всё приложение — создаётся раз при импорте

export function useSidebar() {
  function toggle() { isOpen.value = !isOpen.value; }
  return { isOpen, toggle };
}
```

Теперь и кнопка в шапке, и сама панель используют `useSidebar()` и делят `isOpen`. Это
осознанный синглтон. Но как только захочется действий посложнее, истории изменений или
devtools — это сигнал переехать в Pinia (модуль 06). Модульный синглтон — это «бедный стор».

## Шаг 4. Намеренно ошибёмся

```ts
// ❌ забыли отписку
export function useMouse() {
  const x = ref(0), y = ref(0);
  onMounted(() => window.addEventListener("mousemove", (e) => { x.value = e.clientX; }));
  // нет onUnmounted → листенер остаётся жить после размонтирования = утечка
  return { x, y };
}
```

Каждый раз, когда компонент с таким `useMouse` создаётся и уничтожается, на `window`
накапливается мёртвый листенер. Через десяток переходов по страницам — десяток
обработчиков, дёргающих `ref`-ы уже несуществующих компонентов.

```ts
// ❌ хотели независимый стейт, но объявили на модуле
const x = ref(0);                    // вне функции!
export function useMouse() { return { x }; }
// два компонента теперь делят один x — мышь в одном «телепортирует» курсор в другом
```

## Mini-drill

```drill
type: free-form
prompt: "Напиши useEventListener(target, event, handler), который подписывается в onMounted и отписывается в onUnmounted. Затем перепиши useMouse через него."
answer: "export function useEventListener(target: EventTarget, event: string, handler: EventListener){ onMounted(() => target.addEventListener(event, handler)); onUnmounted(() => target.removeEventListener(event, handler)); } useMouse: const x=ref(0),y=ref(0); useEventListener(window,'mousemove', e => { x.value=(e as MouseEvent).clientX; y.value=(e as MouseEvent).clientY; }); return {x,y}."
check: manual
hint: composable можно строить из других composables — это и есть «композиция».
```

```drill
type: multiple-choice
prompt: "useLocalStorage пишет в стораж через watch, а не computed. Почему?"
options: ["computed нельзя в composable", "запись в localStorage — побочный эффект, а не вывод значения", "watch быстрее", "чтобы deep работал"]
answer: "запись в localStorage — побочный эффект, а не вывод значения"
check: exact
```

```drill
type: free-form
prompt: "Куда положить ref, чтобы счётчик был СВОЙ у каждого компонента, и куда — чтобы ОБЩИЙ?"
answer: "Свой — объявить ref ВНУТРИ функции composable (экземпляр на вызов). Общий — объявить ref на уровне МОДУЛЯ, вне функции (синглтон, создаётся раз при импорте)."
check: manual
```

## Итог

Ты написал composables, которые инкапсулируют целую фичу: состояние + эффект + уборку
(`useMouse`), синхронизацию с внешним миром через `watch` и защиту от недоверенных данных
(`useLocalStorage`), и осознанный синглтон на уровне модуля (`useSidebar`). Главные мышцы:
**отписывайся от того, на что подписался**, **отдавай `ref`-ы для свободной
деструктуризации**, и **выбирай место объявления состояния под нужную область видимости**.
Дальше — выходим на уровень приложения: маршрутизация между страницами.
