---
id: vue.reactivity-and-mental-model.lesson-01
type: lesson
title: "Урок 01 — Счётчик и производное состояние"
tags: [vue, reactivity, computed, lesson]
status: todo
updated: 2026-06-26
---

# Урок 01 — Счётчик и производное состояние

Цель: на маленьком примере прожить весь цикл реактивности — состояние (`ref`),
производные значения (`computed`), эффект (`watch`) — и почувствовать, где какой
инструмент. Код можно вставить в SFC Playground (play.vuejs.org) или в компонент проекта
`npm create vue@latest`.

## Разогрев

- Почему `ref(0)` требует `.value` в `<script>`, но не в `<template>`?
- Чем `computed` лучше обычной функции в шаблоне?
- Когда `watch`, а когда `computed`?

## Шаг 1. Состояние

Смоделируем корзину: цена за штуку и количество.

```vue
<script setup lang="ts">
import { ref } from "vue";

const pricePerItem = ref(149);   // Ref<number>, цена в рублях
const qty = ref(1);              // Ref<number>
</script>

<template>
  <p>Цена за штуку: {{ pricePerItem }} ₽</p>
  <p>Количество: {{ qty }}</p>
  <button @click="qty++">+1</button>
  <button @click="qty = Math.max(0, qty - 1)">−1</button>
</template>
```

Обрати внимание: в шаблоне `qty++` и `pricePerItem` — без `.value`. В `<script>` было бы
`qty.value++`. Vue разворачивает ref-ы в шаблоне, чтобы не зашумлять разметку.

## Шаг 2. Производные значения — `computed`

Сумму считать руками и хранить в отдельном `ref` — плохо: придётся не забывать обновлять.
Это вывод из других значений, значит `computed`:

```vue
<script setup lang="ts">
import { ref, computed } from "vue";

const pricePerItem = ref(149);
const qty = ref(1);

const total = computed(() => pricePerItem.value * qty.value);       // пересчёт сам
const isEmpty = computed(() => qty.value === 0);
const label = computed(() => (isEmpty.value ? "Корзина пуста" : `Итого: ${total.value} ₽`));
</script>

<template>
  <p>{{ label }}</p>
  <button @click="qty++">Добавить</button>
  <button :disabled="isEmpty" @click="qty--">Убрать</button>
</template>
```

Три важные вещи разом:
- `total` пересчитывается **только** при изменении `pricePerItem`/`qty` и кэшируется.
- `computed` можно строить **поверх другого** `computed` (`label` читает `total` и
  `isEmpty`) — граф зависимостей соберётся сам.
- `:disabled="isEmpty"` — мы привязали свойство DOM к производному состоянию. Кнопка
  «Убрать» сама заблокируется на нуле, без ручного `button.disabled = ...`.

## Шаг 3. Побочный эффект — `watch`

Допустим, надо логировать каждое изменение количества (в реальности — слать аналитику
или сохранять в localStorage). Это действие, не значение → `watch`:

```vue
<script setup lang="ts">
import { ref, computed, watch } from "vue";

const qty = ref(1);
const total = computed(() => 149 * qty.value);

watch(qty, (newQty, oldQty) => {
  console.log(`qty: ${oldQty} → ${newQty}`);
});

// эффект на несколько значений без перечисления источников
import { watchEffect } from "vue";
watchEffect(() => {
  document.title = `В корзине: ${qty.value} шт.`;   // авто-подписка на qty
});
</script>
```

`watch(qty, ...)` даёт нам `old`/`new`. `watchEffect(...)` сам увидел, что читает `qty`, и
подписался — плюс выполнился сразу при создании (поэтому заголовок вкладки выставится
мгновенно). Если бы внутри читали ещё и `total.value`, `watchEffect` подписался бы и на
него.

## Шаг 4. Намеренно ошибёмся (учимся читать поведение)

Попробуй каждую строку и пойми, что происходит:

```ts
const qty = ref(1);

qty++;                       // ❌ TS-ошибка: Ref<number> не число. Нужно qty.value++
console.log(qty + 5);        // ❌ "[object Object]5": сложил объект-обёртку со строкой

const state = reactive({ n: 0 });
let { n } = state;           // ❌ n — копия значения 0, реактивность потеряна
n++;                         // меняем локальную переменную, шаблон на state.n не дрогнет
```

Первые две ловит TypeScript ещё до запуска (вот зачем мы учили его раньше Vue). Третью
компилятор пропустит — это логическая граблина реактивности: лечится `toRefs(state)` или
обращением через `state.n`.

## Mini-drill

```drill
type: free-form
prompt: "Добавь computed discountedTotal: если qty >= 3, итог со скидкой 10%, иначе полный. Базовая цена 149."
answer: "const discountedTotal = computed(() => { const t = 149 * qty.value; return qty.value >= 3 ? Math.round(t * 0.9) : t; });"
check: manual
hint: Это вывод значения из qty — значит computed, не watch.
```

```drill
type: multiple-choice
prompt: "Где правильно поставить .value?"
options: ["в шаблоне: {{ qty.value }}", "в <script>: qty.value++", "в @click: qty.value++", "нигде не нужно"]
answer: "в <script>: qty.value++"
check: exact
hint: В шаблоне (включая @click-выражения) Vue разворачивает ref сам.
```

```drill
type: free-form
prompt: "Нужно при каждом изменении qty сохранять его в localStorage. computed или watch? Напиши."
answer: "watch — это побочный эффект (I/O), не вывод значения: watch(qty, (v) => localStorage.setItem('qty', String(v)))."
check: manual
```

## Итог

Ты прожил полный цикл: **состояние** в `ref`, **производные** в `computed` (кэш +
авто-пересчёт), **эффекты** в `watch`/`watchEffect`. Главное ощущение, ради которого
весь модуль: **ты больше не трогаешь DOM руками — ты описываешь зависимости, а
синхронизацию делает Vue.** Это та же дисциплина «опиши намерение, дай инструменту
выполнить», что и декларативный SQL против ручного перебора, только для интерфейса.
Дальше посмотрим, где живёт весь этот код — в Single File Component.
