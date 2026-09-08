---
id: vue.state-pinia.theory
type: theory
title: "Общее состояние (Pinia) — теория"
tags: [vue, pinia, state, getters, actions, theory]
status: todo
updated: 2026-09-08
---

# Общее состояние (Pinia)

## Какую проблему решает стор

К этому моменту у тебя есть четыре способа делиться данными: props (вниз), события
(наверх), provide/inject (контекст поддерева), синглтон-composable (общий `ref` на
модуле). Для многих случаев их хватает. Но представь корзину интернет-магазина: её
содержимое нужно и шапке (счётчик), и странице каталога (кнопка «добавить»), и странице
оформления (итог), и в guard роутера. Тащить это через props или provide-inject —
мучение, а голый модульный `ref` не даёт ни структуры, ни инструментов отладки.

**Pinia** — официальная библиотека управления состоянием Vue. По сути это «синглтон на
модуле, сделанный правильно»: централизованное место для общего состояния с

- чёткой структурой (`state` / `getters` / `actions`),
- полной типизацией из коробки,
- интеграцией с Vue DevTools (видно состояние, можно отматывать действия),
- удобным тестированием и поддержкой плагинов (персист, и т.п.).

> **Параллель с Go.** Стор Pinia — как пакет с глобальным сервисом за чистым API:
> `state` — его поля, `getters` — методы-производные (как `computed`), `actions` — методы,
> меняющие состояние и делающие I/O. Разница с «глобальной переменной» ровно в том же, в
> чём аккуратный сервис отличается от пакетной глобалки: явный контракт, одно место истины,
> наблюдаемость.

## Подключение

```bash
# Пользователь ставит сам; версию пинуем.
npm install =pinia@3.0.0
```

```ts
// src/main.ts
import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";

createApp(App).use(createPinia()).mount("#app");
```

Pinia 3 работает только с Vue 3 (поддержка Vue 2 выпилена) и опирается на нативный
`Awaited` из TS 4.5+ — для нашего стека это не проблема.

## Создание стора: setup-стиль (рекомендуемый)

Setup-стор пишется как composable: тот же `ref`/`computed`/функции, что ты уже знаешь, —
просто внутри `defineStore`. Это и делает Pinia такой «родной»:

```ts
// src/stores/counter.ts
import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useCounterStore = defineStore("counter", () => {
  // state — это ref-ы
  const count = ref(0);

  // getters — это computed
  const doubled = computed(() => count.value * 2);

  // actions — это обычные функции
  function increment() { count.value++; }
  async function loadInitial() {
    const res = await fetch("/api/counter");
    count.value = await res.json();
  }

  return { count, doubled, increment, loadInitial };   // что вернул — то и публичный API
});
```

Первый аргумент `"counter"` — **уникальный id стора** (нужен Pinia для devtools и
внутренней регистрации). Соответствие 1:1 с тем, что ты учил:

| В сторе | Это просто… |
|---|---|
| `state` | `ref` / `reactive` |
| `getter` | `computed` |
| `action` | обычная функция (может быть `async`) |

## Создание стора: options-стиль (узнать в лицо)

Есть и второй синтаксис — объект с секциями, ближе к Options API. Писать будешь
setup-стиль, но options-стиль встречается, так что узнавай:

```ts
export const useCounterStore = defineStore("counter", {
  state: () => ({ count: 0 }),
  getters: {
    doubled: (state) => state.count * 2,
  },
  actions: {
    increment() { this.count++; },          // в options-сторе доступ через this
    async loadInitial() {
      const res = await fetch("/api/counter");
      this.count = await res.json();
    },
  },
});
```

Тот же стор, другой синтаксис. setup-стиль гибче (легко вынести логику, использовать
другие composables, watch внутри), поэтому в новом коде по умолчанию — он.

## Использование в компоненте

```vue
<script setup lang="ts">
import { useCounterStore } from "@/stores/counter";

const counter = useCounterStore();

// напрямую: и состояние, и геттеры, и действия доступны на объекте стора
counter.increment();
console.log(counter.count, counter.doubled);
</script>

<template>
  <p>{{ counter.count }} (×2 = {{ counter.doubled }})</p>
  <button @click="counter.increment()">+1</button>
</template>
```

Обращение через `counter.count` — реактивно, всё работает. Один и тот же `useCounterStore()`
в разных компонентах возвращает **один и тот же** экземпляр стора — это и есть общее
состояние.

## storeToRefs: правильная деструктуризация

Хочется писать `const { count, doubled } = counter` — но тут та же ловушка, что с
`reactive` из модуля 01: **обычная деструктуризация стора теряет реактивность** (стор —
reactive-объект). Для этого есть `storeToRefs`:

```ts
import { storeToRefs } from "pinia";

const counter = useCounterStore();

// state и getters — через storeToRefs (превращает в ref-ы, реактивность сохранена)
const { count, doubled } = storeToRefs(counter);

// ДЕЙСТВИЯ берём прямо со стора (их оборачивать не надо — это функции, не состояние)
const { increment } = counter;
```

Запомни разделение: **state/getters → `storeToRefs`**, **actions → прямо со стора**.
Частая ошибка — прогнать через `storeToRefs` и действия тоже (они не нуждаются и не
должны).

## Мутировать state можно прямо (но лучше через actions)

В отличие от Redux/Vuex, Pinia **разрешает менять `state` напрямую**:
`counter.count++` сработает. Это удобно для мелочей. Но для нетривиальных изменений и для
всего, что включает I/O, заводи **action**: это даёт одно место, где написана логика
изменения, имя в devtools и переиспользование. Правило вкуса: тривиальное присваивание —
можно напрямую; бизнес-логика и асинхронщина — в action.

## Полезный API стора: `$patch`, `$reset`, `$subscribe`

Кроме твоих `state`/`getters`/`actions` у каждого экземпляра стора есть служебные методы с
префиксом `$`. Три из них нужны регулярно:

```ts
const cart = useCartStore();

// изменить несколько полей одной операцией (одна запись в devtools вместо трёх)
cart.$patch({ promoCode: "SALE", deliveryCents: 0 });

// сложное изменение — функцией
cart.$patch((state) => {
  state.lines.push(newLine);
  state.updatedAt = Date.now();
});

// подписаться на любые изменения состояния (например, чтобы сохранить в localStorage)
cart.$subscribe((mutation, state) => {
  localStorage.setItem("cart", JSON.stringify(state.lines));
});
```

- **`$patch`** — атомарное изменение нескольких полей: удобнее и в devtools выглядит одной
  операцией.
- **`$subscribe`** — реакция на изменения стора (персист, аналитика). Часто это же делают
  готовым плагином `pinia-plugin-persistedstate`; механика та же.
- **`$reset`** — вернуть состояние к начальному. Важная деталь: **из коробки он работает
  только в options-сторах**. В setup-сторе начального состояния Pinia не знает, поэтому
  делают свой action:

```ts
export const useCartStore = defineStore("cart", () => {
  const lines = ref<CartLine[]>([]);
  function reset() { lines.value = []; }        // свой «reset» в setup-сторе
  return { lines, reset };
});
```

## Стор вне компонента: одна ловушка, которая ломает приложение

Стор нельзя использовать раньше, чем Pinia установлена в приложение (`app.use(createPinia())`).
Поэтому вызов `useCartStore()` **на верхнем уровне модуля** — классическая ошибка:

```ts
// ❌ router/index.ts — выполняется при импорте, ещё до app.use(createPinia())
const auth = useAuthStore();          // «getActivePinia() was called but there was no active Pinia»

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !auth.isLoggedIn) return { name: "login" };
});
```

```ts
// ✅ вызывать ВНУТРИ функции — к моменту перехода Pinia уже установлена
router.beforeEach((to) => {
  const auth = useAuthStore();
  if (to.meta.requiresAuth && !auth.isLoggedIn) return { name: "login" };
});
```

Правило простое: **`useXStore()` вызывается внутри `setup` или внутри функции, которая
выполнится позже**, но никогда на верхнем уровне модуля. Это же объясняет, почему в
`main.ts` порядок важен: сначала `createPinia()`, потом всё, что от стора зависит.

> **Простыми словами.** `useCartStore()` — это не импорт данных, а запрос «дай мне
> экземпляр из текущего приложения». Пока приложения нет, давать нечего.

## Когда стор, а когда нет

Не тащи в Pinia всё подряд — глобальное состояние имеет цену (связность, сложнее
рассуждать). Ориентир:

| Состояние… | Где держать |
|---|---|
| Локальное для одного компонента | `ref` в компоненте |
| Переиспользуемая логика без общего стейта | **composable** |
| Контекст поддерева (тема, локаль) | **provide/inject** |
| Общее для многих несвязанных частей (корзина, юзер, токен) | **Pinia-стор** |

Если данные нужны в одном поддереве — не поднимай их в глобальный стор «на всякий случай».
Стор — для действительно сквозного состояния приложения.

## Типичные ошибки и заблуждения

- **«Стор — это просто глобальная переменная».** Это структурированное общее состояние с
  типами, devtools и одним местом истины. Разница как между сервисом и глобалкой.
- **«`const { count } = useStore()` сработает».** Потеряет реактивность (стор — reactive).
  Для state/getters используй `storeToRefs`; actions бери прямо со стора.
- **«Actions тоже надо через `storeToRefs`».** Нет, это функции, не состояние. Только
  state/getters оборачивают.
- **«`state` менять напрямую нельзя».** В Pinia можно. Но нетривиальную логику и I/O
  держи в actions ради читаемости и devtools.
- **«Всё состояние — в стор».** Глобальное состояние имеет цену. Локальное — в компоненте,
  контекст — в provide/inject, переиспользуемое поведение — в composable.
- **«options- и setup-стор сильно разные».** Тот же стор, разный синтаксис. setup гибче;
  options встречается в коде — просто узнавай.
- **«`useStore()` можно вызвать на верхнем уровне модуля».** Нет: до `app.use(createPinia())`
  активной Pinia не существует. Вызывай внутри `setup` или внутри функции (guard, обработчик).
- **«`$reset()` работает всегда».** Из коробки — только в options-сторах. В setup-сторе
  напиши свой `reset()`.
- **«Несколько полей меняем несколькими присваиваниями».** Можно, но `$patch` делает это
  одной операцией — и в devtools видно один шаг, а не три.

## Глоссарий модуля

- **Стор (store)** — централизованное общее состояние с действиями и производными.
- **`defineStore(id, ...)`** — объявление стора; `id` виден в devtools.
- **setup-стор / options-стор** — два синтаксиса объявления (функция vs объект секций).
- **`state` / `getters` / `actions`** — состояние / производные / действия
  (`ref` / `computed` / функции).
- **`storeToRefs`** — превращение `state`/`getters` стора в `ref`-ы для деструктуризации.
- **`$patch`** — атомарное изменение нескольких полей.
- **`$subscribe`** — подписка на изменения состояния стора.
- **`$reset`** — сброс к начальному состоянию (в setup-сторе пишется вручную).
- **Плагин Pinia** — расширение всех сторов (например, персист в localStorage).
- **Vue DevTools** — расширение браузера: видно состояние, действия и их историю.

## См. также

- Pinia, *Introduction* и *Defining a Store*: https://pinia.vuejs.org/core-concepts/
- Pinia, *State*: https://pinia.vuejs.org/core-concepts/state.html
- Pinia, *Getters*: https://pinia.vuejs.org/core-concepts/getters.html
- Pinia, *Actions*: https://pinia.vuejs.org/core-concepts/actions.html
- Pinia, *storeToRefs*: https://pinia.vuejs.org/api/modules/pinia.html#storetorefs
- Урок: [`lessons/01-cart-store.md`](./lessons/01-cart-store.md)
- Дальше — async-данные, тесты и сборка проекта: [`../07-async-tooling-testing-project/index.md`](../07-async-tooling-testing-project/index.md)
