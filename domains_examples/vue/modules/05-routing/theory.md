---
id: vue.routing.theory
type: theory
title: "Маршрутизация (Vue Router) — теория"
tags: [vue, router, routing, guards, theory]
status: todo
updated: 2026-09-08
---

# Маршрутизация (Vue Router)

## Что такое client-side routing

В классическом многостраничном сайте каждый переход по ссылке — это **новый запрос к
серверу**, сервер отдаёт новую HTML-страницу, браузер всё перерисовывает с нуля. В **SPA**
(single-page application) загружается **одна** HTML-страница и JS-приложение, а дальше
«страницы» переключаются **на клиенте**: JS меняет URL (через History API, без
перезагрузки) и подменяет компонент на экране. Это **client-side routing**.

Плюсы: мгновенные переходы (не ждём сервер), сохранённое состояние приложения между
«страницами». Минус, о котором надо помнить: первый заход грузит больше JS, а SEO/первый
рендер требуют отдельной заботы (SSR — вне нашего курса).

**Vue Router** — официальная библиотека маршрутизации Vue. Её задача: сопоставить текущий
URL с нужным компонентом-страницей и дать инструменты для навигации.

> **Параллель с Go.** Конфиг маршрутов Vue Router концептуально близок к `http.ServeMux`
> или роутеру вроде chi: «паттерн пути → обработчик». Только обработчик — не функция,
> возвращающая HTTP-ответ, а **компонент**, который рендерится на месте `<RouterView>`. И
> матчинг происходит в браузере, а не на сервере.

## Установка и конфигурация

```bash
# Пользователь ставит сам; версию пинуем.
npm install =vue-router@4.5.0
```

(Если создавал проект через `npm create vue@latest` и выбрал Router — он уже встроен.)

Описываем маршруты и создаём роутер:

(Напоминание: `@/` в импортах — это алиас на папку `src/` из
[модуля 02](../02-sfc-templates-styling/theory.md), а не npm-пакет.)

```ts
// src/router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import HomeView from "@/views/HomeView.vue";

const routes: RouteRecordRaw[] = [
  { path: "/", name: "home", component: HomeView },
  // ленивая загрузка: чанк подгрузится только при заходе на /about
  { path: "/about", name: "about", component: () => import("@/views/AboutView.vue") },
];

export const router = createRouter({
  history: createWebHistory(),   // «чистые» URL без # (HTML5 History API)
  routes,
});
```

`createWebHistory()` даёт URL вида `/about` (нужна поддержка на сервере: любой путь должен
отдавать index.html). Альтернатива — `createWebHashHistory()` с URL `/#/about` (работает без
серверной настройки, но некрасиво). По умолчанию бери `createWebHistory`.

Подключаем роутер к приложению:

```ts
// src/main.ts
import { createApp } from "vue";
import App from "./App.vue";
import { router } from "./router";

createApp(App).use(router).mount("#app");
```

## `<RouterView>` и `<RouterLink>`

Две главные части в разметке:

```vue
<!-- App.vue -->
<template>
  <nav>
    <RouterLink to="/">Главная</RouterLink>
    <RouterLink :to="{ name: 'about' }">О нас</RouterLink>
  </nav>

  <RouterView />     <!-- сюда рендерится компонент текущего маршрута -->
</template>
```

- `<RouterView />` — «дырка», куда роутер вставляет компонент активного маршрута. Меняется
  URL — меняется содержимое здесь, остальное (`<nav>`) остаётся.
- `<RouterLink to="...">` — навигационная ссылка. Под капотом рендерит `<a>`, но
  перехватывает клик и делает переход **без перезагрузки** (в отличие от голого `<a href>`,
  который перезагрузит страницу и убьёт SPA). Можно указывать путь строкой (`to="/about"`)
  или объектом (`:to="{ name: 'about' }"` — навигация по имени надёжнее: путь поменяешь,
  имя останется).

`<RouterLink>` сам проставляет активной ссылке классы (`router-link-active`), что удобно для
подсветки текущего пункта меню.

## Динамические маршруты и параметры

Часто путь содержит переменную часть — id сущности:

```ts
{ path: "/users/:id", name: "user", component: () => import("@/views/UserView.vue") }
```

Внутри компонента читаем параметр через composable `useRoute`:

```vue
<!-- UserView.vue -->
<script setup lang="ts">
import { useRoute } from "vue-router";
import { watch, ref } from "vue";

const route = useRoute();
const userId = ref(route.params.id as string);

// ВАЖНО: при переходе /users/1 → /users/2 компонент НЕ пересоздаётся (тот же маршрут),
// меняется только route.params. Следим за параметром явно, чтобы перезагрузить данные.
watch(
  () => route.params.id,
  (id) => loadUser(id as string),
  { immediate: true },
);
</script>
```

Это классическая граблина: переход между `/users/1` и `/users/2` **переиспользует** тот же
компонент (это один и тот же маршрут, отличается только параметр), поэтому `onMounted` второй
раз не сработает. Данные нужно перезагружать в `watch` на `route.params.id`, а не только при
монтировании.

- `route.params` — части пути (`:id`).
- `route.query` — строка запроса (`?sort=asc` → `route.query.sort`).

> **Go-параллель.** `route.params.id` — это как `chi.URLParam(r, "id")` или
> `r.PathValue("id")` в `net/http` 1.22+. А `route.query` — как `r.URL.Query().Get("sort")`.

## Вложенные маршруты

Когда у страницы есть собственные под-разделы со своим общим каркасом (профиль → вкладки
«посты»/«настройки»), используют **вложенные маршруты** и вложенный `<RouterView>`:

```ts
{
  path: "/settings",
  component: () => import("@/views/SettingsLayout.vue"),
  children: [
    { path: "", name: "settings-profile", component: () => import("@/views/ProfileTab.vue") },
    { path: "security", name: "settings-security", component: () => import("@/views/SecurityTab.vue") },
  ],
}
```

`SettingsLayout.vue` рисует общий каркас (заголовок, под-меню) и **свой** `<RouterView />`,
куда подставляется активная вкладка. Так каркас не перерисовывается при переключении вкладок.

## Программная навигация: `useRouter`

Не всякая навигация — клик по ссылке. После сохранения формы хочется перейти на список —
это делается кодом через `useRouter`:

```vue
<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

async function save() {
  await api.createUser(form);
  router.push({ name: "user", params: { id: newId } });   // перейти
  // router.replace(...) — перейти без добавления записи в историю (назад не вернёт сюда)
  // router.back() — назад, как кнопка браузера
}
</script>
```

Не путай: `useRoute()` (без `r` на конце) — **текущий** маршрут (читать параметры).
`useRouter()` — **сам роутер** (навигировать). Маленькая буква, большая разница.

## Navigation guards: защита и перехват переходов

Guards — это хуки, которые срабатывают **до/после** перехода и могут его разрешить,
отменить или перенаправить. Самый частый случай — пускать на страницу только
авторизованных:

```ts
// глобальный guard: выполняется перед КАЖДЫМ переходом
router.beforeEach((to, from) => {
  const isAuthed = Boolean(localStorage.getItem("token"));   // в реале — из стора

  if (to.meta.requiresAuth && !isAuthed) {
    // вернуть объект маршрута = перенаправить (на логин, запомнив, куда шли)
    return { name: "login", query: { redirect: to.fullPath } };
  }
  // вернуть true/ничего = пустить; вернуть false = отменить переход
});
```

Маршрут помечают через `meta`:

```ts
{ path: "/admin", component: AdminView, meta: { requiresAuth: true } }
```

Виды guards:
- **глобальные** — `router.beforeEach` / `afterEach` (на все переходы);
- **на маршрут** — `beforeEnter` в записи маршрута;
- **внутри компонента** — `onBeforeRouteLeave` / `onBeforeRouteUpdate` (например,
  предупредить о несохранённых изменениях перед уходом).

Возврат из guard: `true`/`undefined` — пропустить; `false` — отменить; объект маршрута —
перенаправить. (Старый стиль с третьим аргументом `next()` ещё встречается в коде, но
возврат значения — современный и менее ошибочный способ.)

> **Безопасность.** Guard на клиенте — это про **навигацию и UX**, а не про настоящую
> защиту. Любой может открыть devtools и подменить флаг. Реальная авторизация — на
> сервере: он не должен отдавать данные без валидного токена. Клиентский guard лишь
> прячет недоступные экраны, но не является источником истины (тот же принцип «сервер —
> источник истины», что и в бэкенде).

## Страница 404 и поведение прокрутки

Две настройки, без которых приложение выглядит недоделанным.

**Catch-all маршрут.** Если пользователь набрал несуществующий адрес, по умолчанию не
отрисуется ничего — пустой экран и предупреждение в консоли. Ловим все непойманные пути
последним маршрутом:

```ts
{ path: "/:pathMatch(.*)*", name: "not-found", component: () => import("@/views/NotFoundView.vue") }
```

Синтаксис читается так: параметр `pathMatch` с пользовательским regexp `(.*)` и
модификатором `*` («сколько угодно сегментов пути»). Ставится **последним** — маршруты
проверяются по порядку.

**`scrollBehavior`.** В обычном сайте браузер сам прокручивает страницу вверх при переходе.
В SPA переход — это подмена компонента, и прокрутка остаётся там, где была: перешёл со
середины длинного списка на карточку товара — и видишь её середину. Лечится одной функцией
в конфиге роутера:

```ts
export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;    // «назад»/«вперёд» — вернуть, где были
    if (to.hash) return { el: to.hash };        // якорь #section — прокрутить к нему
    return { top: 0 };                           // обычный переход — наверх
  },
});
```

> **Простыми словами.** В SPA браузер больше не «перезагружает страницу», поэтому всё, что
> он раньше делал бесплатно — прокрутка, заголовок вкладки, фокус — теперь твоя
> ответственность. Заголовок, кстати, тоже: его обычно ставят в `router.afterEach` из
> `to.meta.title`.

## Lazy-loading маршрутов

`component: () => import("...")` вместо прямого импорта — это **ленивая загрузка**: код
страницы попадает в отдельный чанк и грузится только при первом заходе на неё. Стартовый
бандл становится меньше → приложение быстрее открывается. Для редких/тяжёлых страниц
(админка, отчёты) это почти всегда правильно. Vite сам разрежет бандл по таким импортам.

## Типичные ошибки и заблуждения

- **«Можно навигировать обычным `<a href>`».** `<a href>` перезагрузит страницу и убьёт
  SPA-состояние. Для внутренних переходов — `<RouterLink>` (или `router.push`).
- **«При смене `:id` компонент пересоздастся и `onMounted` перезагрузит данные».** Нет:
  тот же маршрут переиспользует компонент. Следи за `route.params` через `watch`.
- **«`useRoute` и `useRouter` — одно и то же».** `useRoute` — текущий маршрут (чтение);
  `useRouter` — роутер (навигация). Путаница ведёт к `route.push is not a function`.
- **«Guard на клиенте защищает данные».** Нет, это UX-слой. Настоящая защита — на сервере.
- **«`createWebHistory` работает без настройки сервера».** Для прямого захода на `/about`
  сервер должен отдавать index.html на любой путь. Иначе будет 404 при перезагрузке.
- **«Все страницы импортируем напрямую».** Тяжёлые/редкие — ленить через `() => import()`,
  иначе раздуваешь стартовый бандл.
- **«Несуществующий URL сам покажет 404».** Нет, отрисуется пустота. Нужен catch-all
  маршрут `/:pathMatch(.*)*` последним в списке.
- **«При переходе страница сама прокрутится вверх».** Не сама: в SPA это делает
  `scrollBehavior` в конфиге роутера.

## Глоссарий модуля

- **Client-side routing** — сопоставление URL с компонентом на стороне браузера.
- **History API** — механизм браузера, позволяющий менять URL без перезагрузки.
- **Route record** — запись маршрута (`path`, `name`, `component`, `meta`, `children`).
- **`<RouterView>` / `<RouterLink>`** — место рендера активного маршрута / ссылка без
  перезагрузки.
- **`useRoute` / `useRouter`** — текущий маршрут (чтение) / роутер (навигация).
- **`params` / `query`** — части пути (`/users/:id`) / строка запроса (`?sort=asc`).
- **Вложенные маршруты** — `children` + вложенный `<RouterView>`.
- **Navigation guard** — хук до/после перехода (`beforeEach`, `beforeEnter`,
  `onBeforeRouteLeave`).
- **`meta`** — произвольные данные маршрута (например, `requiresAuth`).
- **Lazy-loading / чанк** — загрузка кода страницы по требованию отдельным файлом.
- **Catch-all маршрут** — `/:pathMatch(.*)*` для страницы 404.
- **`scrollBehavior`** — функция, задающая прокрутку при переходах.

## См. также

- Vue Router, *Getting Started*: https://router.vuejs.org/guide/
- Vue Router, *Dynamic Route Matching*: https://router.vuejs.org/guide/essentials/dynamic-matching.html
- Vue Router, *Nested Routes*: https://router.vuejs.org/guide/essentials/nested-routes.html
- Vue Router, *Navigation Guards*: https://router.vuejs.org/guide/advanced/navigation-guards.html
- Vue Router, *Lazy Loading Routes*: https://router.vuejs.org/guide/advanced/lazy-loading.html
- Урок: [`lessons/01-routes-and-guards.md`](./lessons/01-routes-and-guards.md)
- Дальше — общее состояние приложения: [`../06-state-pinia/index.md`](../06-state-pinia/index.md)
