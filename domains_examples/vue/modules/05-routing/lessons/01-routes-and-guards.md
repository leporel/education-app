---
id: vue.routing.lesson-01
type: lesson
title: "Урок 01 — Список, деталь и защищённая страница"
tags: [vue, router, guards, lesson]
status: todo
updated: 2026-06-26
---

# Урок 01 — Список, деталь и защищённая страница

Цель: собрать минимальное приложение из трёх экранов — список товаров, деталь товара по
`:id`, и защищённая «админка» с guard. Прожить динамический параметр, программную навигацию
и редирект неавторизованного.

## Разогрев

- Чем `<RouterLink>` отличается от `<a href>`?
- Почему деталь по `:id` надо грузить в `watch`, а не только в `onMounted`?
- Где настоящая защита: в guard или на сервере?

## Шаг 1. Маршруты

```ts
// src/router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  { path: "/", name: "products", component: () => import("@/views/ProductsView.vue") },
  { path: "/products/:id", name: "product", component: () => import("@/views/ProductView.vue") },
  { path: "/admin", name: "admin", component: () => import("@/views/AdminView.vue"),
    meta: { requiresAuth: true } },
  { path: "/login", name: "login", component: () => import("@/views/LoginView.vue") },
];

export const router = createRouter({ history: createWebHistory(), routes });

// глобальный guard: пускаем в requiresAuth только «авторизованных»
router.beforeEach((to) => {
  const isAuthed = Boolean(localStorage.getItem("token"));  // в реале — из стора (модуль 06)
  if (to.meta.requiresAuth && !isAuthed) {
    return { name: "login", query: { redirect: to.fullPath } };
  }
});
```

## Шаг 2. Каркас и навигация

```vue
<!-- App.vue -->
<template>
  <nav>
    <RouterLink :to="{ name: 'products' }">Товары</RouterLink>
    <RouterLink :to="{ name: 'admin' }">Админка</RouterLink>
  </nav>
  <RouterView />     <!-- сюда рендерится активный экран -->
</template>
```

## Шаг 3. Список со ссылками на деталь

```vue
<!-- ProductsView.vue -->
<script setup lang="ts">
import { ref } from "vue";

interface Product { id: number; title: string; }
const products = ref<Product[]>([
  { id: 1, title: "Клавиатура" },
  { id: 2, title: "Мышь" },
]);
</script>

<template>
  <ul>
    <li v-for="p in products" :key="p.id">
      <!-- ссылка на деталь по имени + params -->
      <RouterLink :to="{ name: 'product', params: { id: p.id } }">
        {{ p.title }}
      </RouterLink>
    </li>
  </ul>
</template>
```

## Шаг 4. Деталь по параметру (и главная граблина)

```vue
<!-- ProductView.vue -->
<script setup lang="ts">
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();      // читаем
const router = useRouter();    // навигируем

const product = ref<{ id: number; title: string } | null>(null);

async function loadProduct(id: string): Promise<void> {
  // имитация запроса; в модуле 07 заменим на настоящий fetch
  product.value = { id: Number(id), title: `Товар #${id}` };
}

// следим за параметром: при /products/1 → /products/2 компонент переиспользуется,
// onMounted второй раз НЕ сработает — поэтому watch с immediate
watch(() => route.params.id, (id) => loadProduct(id as string), { immediate: true });

function goBack(): void {
  router.push({ name: "products" });   // программная навигация
}
</script>

<template>
  <article v-if="product">
    <h1>{{ product.title }}</h1>
    <button @click="goBack">← к списку</button>
  </article>
</template>
```

Попробуй заменить `watch(...)` на `onMounted(() => loadProduct(route.params.id as string))`
и походить между двумя товарами по ссылкам — заголовок «застрянет» на первом. Вот почему
для параметризованных страниц следят за `route.params`.

## Шаг 5. Логин и редирект обратно

```vue
<!-- LoginView.vue -->
<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

function login(): void {
  localStorage.setItem("token", "fake-token");   // имитация; реальная авторизация — на сервере
  const redirect = (route.query.redirect as string) || "/";
  router.replace(redirect);   // replace: чтобы «назад» не вернул на форму логина
}
</script>

<template>
  <button @click="login">Войти</button>
</template>
```

Полный сценарий: зашёл на `/admin` без токена → guard отправил на
`/login?redirect=/admin` → нажал «Войти» → `router.replace("/admin")` вернул туда, куда
шёл. `replace` вместо `push`, чтобы кнопка «назад» не привела обратно на форму логина.

## Шаг 6. Намеренно ошибёмся

```vue
<!-- ❌ навигация голым <a> -->
<a href="/products/2">Мышь</a>     <!-- перезагрузит всю страницу, потеряет состояние SPA -->
```

```ts
// ❌ перепутали useRoute и useRouter
const route = useRoute();
route.push({ name: "products" });   // route.push is not a function — push у useRouter()
```

## Mini-drill

```drill
type: free-form
prompt: "Добавь вкладки в админку: /admin (обзор) и /admin/users (пользователи) как вложенные маршруты. Что нужно в AdminView и в конфиге?"
answer: "В конфиге: { path: '/admin', component: AdminLayout, meta: { requiresAuth: true }, children: [ { path: '', component: AdminHome }, { path: 'users', component: AdminUsers } ] }. В AdminLayout.vue — общий каркас и вложенный <RouterView /> для активной вкладки."
check: manual
```

```drill
type: multiple-choice
prompt: "Почему в login используем router.replace, а не push?"
options: ["replace быстрее", "чтобы кнопка «назад» не вернула на форму логина (не добавляем запись в историю)", "push не работает с query", "из-за guard"]
answer: "чтобы кнопка «назад» не вернула на форму логина (не добавляем запись в историю)"
check: exact
```

```drill
type: free-form
prompt: "Guard пускает на /admin по localStorage-токену. Почему это НЕ защищает админские данные и где настоящая защита?"
answer: "Любой подменит token в devtools — guard лишь прячет экран (UX). Настоящая защита на сервере: API не отдаёт админские данные без валидного токена и проверяет права на каждом запросе. Сервер — источник истины."
check: manual
```

## Итог

Ты собрал многоэкранное SPA: список → деталь по динамическому `:id` → защищённая страница
с редиректом на логин и возвратом. Ключевые мышцы: **навигация только через `RouterLink`/
`router.push`** (не `<a href>`), **параметризованные страницы грузят данные в `watch` на
`route.params`**, и **клиентский guard — это UX, а истина живёт на сервере**. Дальше — куда
складывать общее состояние (токен, корзину, пользователя): Pinia.
