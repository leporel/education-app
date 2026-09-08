---
id: vue.async-tooling-testing-project.lesson-02
type: lesson
title: "Урок 02 — Капстоун: мини-магазин и первый тест"
tags: [vue, project, testing, lesson]
status: todo
updated: 2026-06-26
---

# Урок 02 — Капстоун: мини-магазин и первый тест

Цель: собрать маленькое, но цельное приложение, в котором сходятся **все** модули домена —
реактивность, SFC/шаблоны, компоненты с props/emits, composable загрузки, роутер, стор
Pinia — и накрыть один компонент тестом. Это финальная проверка, что фрагменты сложились в
картину.

## Что строим

Мини-магазин:
- `/` — каталог товаров (грузится через `useFetch`), у каждого — кнопка «В корзину».
- `/cart` — корзина из Pinia-стора (модуль 06), с итогом и удалением.
- В шапке — `CartBadge` со счётчиком из того же стора.
- Навигация — Vue Router.

## Структура проекта

```
src/
  main.ts                 # createApp + Pinia + Router
  App.vue                 # каркас: шапка с CartBadge + <RouterView/>
  router/index.ts         # маршруты / и /cart
  stores/cart.ts          # стор корзины (из модуля 06)
  composables/useFetch.ts # загрузка (из урока 01)
  components/
    CartBadge.vue         # счётчик из стора
    ProductCard.vue       # карточка + кнопка «В корзину» (emit add)
  views/
    CatalogView.vue       # список товаров через useFetch
    CartView.vue          # содержимое корзины
```

Это та самая **feature-ориентированная** раскладка (`components/`, `composables/`,
`views/`, `stores/`), которую советуют гайдлайны: по типам единиц, легко найти.

## Шаг 1. Точка входа

```ts
// src/main.ts
import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import { router } from "./router";

createApp(App).use(createPinia()).use(router).mount("#app");
```

## Шаг 2. Каркас

```vue
<!-- src/App.vue -->
<script setup lang="ts">
import { RouterView, RouterLink } from "vue-router";
import CartBadge from "@/components/CartBadge.vue";
</script>

<template>
  <header class="topbar">
    <RouterLink :to="{ name: 'catalog' }">Каталог</RouterLink>
    <RouterLink :to="{ name: 'cart' }"><CartBadge /></RouterLink>
  </header>
  <main><RouterView /></main>
</template>

<style scoped>
.topbar { display: flex; justify-content: space-between; padding: 1rem; }
</style>
```

## Шаг 3. ProductCard — props вниз, событие наверх

```vue
<!-- src/components/ProductCard.vue -->
<script setup lang="ts">
import type { Product } from "@/stores/cart";

defineProps<{ product: Product }>();
const emit = defineEmits<{ add: [product: Product] }>();
</script>

<template>
  <article class="card">
    <h3>{{ product.title }}</h3>
    <p>{{ (product.priceCents / 100).toFixed(2) }} ₽</p>
    <button @click="emit('add', product)">В корзину</button>
  </article>
</template>
```

Заметь решение по архитектуре: `ProductCard` **не** трогает стор сам — он эмитит `add`, а
решает, что делать, родитель (`CatalogView`). Так карточка остаётся «глупой» и легко
тестируется в изоляции (что и сделаем в шаге 6). Это тот же one-way data flow из модуля 03.

## Шаг 4. CatalogView — useFetch + стор

```vue
<!-- src/views/CatalogView.vue -->
<script setup lang="ts">
import { useFetch } from "@/composables/useFetch";
import { useCartStore, type Product } from "@/stores/cart";
import ProductCard from "@/components/ProductCard.vue";
import { ref } from "vue";

const cart = useCartStore();
const url = ref("/api/products");
const { data: products, error, loading } = useFetch<Product[]>(url);

function onAdd(product: Product): void {
  cart.add(product);                 // действие стора вызывает «умный» родитель
}
</script>

<template>
  <p v-if="loading">Загрузка каталога…</p>
  <p v-else-if="error" class="error">Ошибка: {{ error }}</p>
  <section v-else-if="products" class="grid">
    <ProductCard
      v-for="p in products"
      :key="p.id"
      :product="p"
      @add="onAdd"
    />
  </section>
</template>
```

## Шаг 5. CartView — стор через storeToRefs

```vue
<!-- src/views/CartView.vue -->
<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useCartStore } from "@/stores/cart";

const cart = useCartStore();
const { lines, totalCents, isEmpty } = storeToRefs(cart);   // state/getters
const { remove, clear } = cart;                             // actions
</script>

<template>
  <p v-if="isEmpty">Корзина пуста.</p>
  <div v-else>
    <ul>
      <li v-for="line in lines" :key="line.product.id">
        {{ line.product.title }} × {{ line.qty }}
        <button @click="remove(line.product.id)">✕</button>
      </li>
    </ul>
    <p>Итого: {{ (totalCents / 100).toFixed(2) }} ₽</p>
    <button @click="clear">Очистить</button>
  </div>
</template>
```

Весь домен в сборе: реактивность (`ref`/`computed` в сторе), шаблоны (`v-for`/`v-if`/`:key`),
компоненты (props/emits), composable (`useFetch`), роутер (views + RouterLink), стор
(`storeToRefs` + actions). Каждая часть делает ровно свою работу.

## Шаг 6. Первый компонентный тест

Протестируем «глупый» `ProductCard` — он идеально изолирован (никакого стора внутри):

```ts
// src/components/ProductCard.test.ts
import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import ProductCard from "./ProductCard.vue";

const product = { id: 7, title: "Кружка", priceCents: 49900 };

describe("ProductCard", () => {
  it("показывает название и цену из props", () => {
    const wrapper = mount(ProductCard, { props: { product } });
    expect(wrapper.text()).toContain("Кружка");
    expect(wrapper.text()).toContain("499.00");
  });

  it("эмитит add с товаром по клику", async () => {
    const wrapper = mount(ProductCard, { props: { product } });
    await wrapper.find("button").trigger("click");   // await — дать Vue обновиться

    const addEvents = wrapper.emitted("add");
    expect(addEvents).toBeTruthy();
    expect(addEvents![0]).toEqual([product]);        // payload первого события
  });
});
```

Запуск — `npm run test:unit` (пользователь сам). Тест проверяет **контракт** карточки:
рендерит по props и эмитит `add` с товаром. Внутренности (что внутри `ref`/как назван
обработчик) не трогаем — поэтому такой тест переживёт рефакторинг. Вот зачем мы сделали
`ProductCard` «глупым»: компонент без зависимости от стора тестируется без поднятия Pinia.

## Mini-drill

```drill
type: free-form
prompt: "Почему ProductCard эмитит add, а не вызывает cart.add(product) сам? Назови минимум две выгоды."
answer: "1) one-way data flow и единый владелец логики (родитель решает, что делать); 2) изоляция — карточка не зависит от стора, тестируется без createTestingPinia; 3) переиспользуемость — ту же карточку можно использовать там, где «добавить» значит другое."
check: manual
```

```drill
type: multiple-choice
prompt: "В CartView lines и totalCents берут через storeToRefs, а remove/clear — прямо со стора. Почему?"
options: ["случайность", "state/getters нужно обернуть в storeToRefs ради реактивности; actions — функции, берутся напрямую", "так быстрее", "storeToRefs не работает с функциями вообще не по этой причине"]
answer: "state/getters нужно обернуть в storeToRefs ради реактивности; actions — функции, берутся напрямую"
check: exact
```

```drill
type: free-form
prompt: "Если бы CatalogView тестировали как есть (он использует useCartStore), что понадобилось бы в тесте и почему ProductCard проще?"
answer: "Для CatalogView нужен createTestingPinia() (он зависит от стора) и, возможно, мок useFetch/сети. ProductCard ни от чего не зависит — только props и emit, поэтому тестируется голым mount без инфраструктуры. Отсюда правило: держи презентационные компоненты «глупыми»."
check: manual
```

## Итог домена

Ты прошёл путь от «что такое реактивность» до собранного приложения с роутером, стором,
загрузкой данных и тестом. Главное, что унёс: **ты описываешь UI как функцию состояния, а
синхронизацию делает Vue**; данные текут предсказуемо (props вниз, события наверх, стор —
для сквозного); логику переиспользуешь composable-ами; а контракты страхуешь типами (из
TS-домена) и тестами. Дальше — практика: бери `npm create vue@latest`, выбери Router +
Pinia + Vitest и собери что-нибудь своё. По Vapor Mode (Vue 3.6) вернёмся, когда
стабилизируется, — но фундамент, на котором он стоит, у тебя уже есть.
