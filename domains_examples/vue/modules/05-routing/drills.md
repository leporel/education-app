---
id: vue.routing.drills
type: drills
title: "Маршрутизация — упражнения"
tags: [vue, router, drills]
status: todo
updated: 2026-09-08
---

# Упражнения

## Конфигурация

```drill
type: free-form
prompt: "Опиши routes: '/' → HomeView (eager), '/products/:id' → ProductView (lazy, name 'product')."
answer: "const routes = [ { path: '/', name: 'home', component: HomeView }, { path: '/products/:id', name: 'product', component: () => import('@/views/ProductView.vue') } ];"
check: manual
```

```drill
type: multiple-choice
prompt: "Прямой заход на /about даёт 404 после перезагрузки. Вероятная причина?"
options: ["забыли RouterLink", "createWebHistory без серверной настройки (сервер не отдаёт index.html на любой путь)", "не хватает useRoute", "lazy-loading"]
answer: "createWebHistory без серверной настройки (сервер не отдаёт index.html на любой путь)"
check: exact
```

## Навигация и параметры

```drill
type: multiple-choice
prompt: "Нужно после сохранения формы программно перейти на страницу пользователя. Что взять?"
options: ["useRoute().push", "useRouter().push({ name: 'user', params: { id } })", "<RouterLink>", "location.href"]
answer: "useRouter().push({ name: 'user', params: { id } })"
check: exact
hint: Навигация — useRouter; useRoute только читает.
```

```drill
type: free-form
prompt: "В UserView при переходе /users/1 → /users/2 данные не перезагружаются. Напиши, как починить."
answer: "watch(() => route.params.id, (id) => loadUser(id as string), { immediate: true }); — тот же маршрут переиспользует компонент, onMounted не сработает снова, нужно следить за params."
check: manual
```

```drill
type: multiple-choice
prompt: "URL /search?tag=vue. Как прочитать 'vue'?"
options: ["route.params.tag", "route.query.tag", "route.tag", "router.query.tag"]
answer: "route.query.tag"
check: exact
```

## Guards и lazy

```drill
type: free-form
prompt: "Напиши глобальный guard: если to.meta.requiresAuth и пользователь не авторизован — редирект на login с сохранением, куда шли."
answer: "router.beforeEach((to) => { const authed = isAuthed(); if (to.meta.requiresAuth && !authed) return { name: 'login', query: { redirect: to.fullPath } }; });"
check: manual
```

```drill
type: multiple-choice
prompt: "Можно ли полагаться на клиентский guard requiresAuth как на защиту приватных данных?"
options: ["да, этого достаточно", "нет — это UX-слой, реальная защита на сервере (не отдаёт данные без токена)", "да, если добавить meta", "только с createWebHistory"]
answer: "нет — это UX-слой, реальная защита на сервере (не отдаёт данные без токена)"
check: exact
```

```drill
type: free-form
prompt: "Стартовый бандл раздут страницей отчётов, куда заходят редко. Что сделать в конфиге маршрута?"
answer: "Ленивая загрузка: component: () => import('@/views/ReportsView.vue') вместо прямого импорта — код уедет в отдельный чанк и подгрузится только при заходе."
check: manual
```

## 404 и прокрутка

```drill
type: fill-in
prompt: "Допиши catch-all маршрут для страницы 404: { path: '___', component: NotFoundView }"
answer: "/:pathMatch(.*)*"
check: fuzzy
hint: "Параметр с пользовательским regexp и модификатором «сколько угодно сегментов»; ставится последним."
```

```drill
type: multiple-choice
prompt: "Пользователь переходит из середины длинного списка на карточку товара и видит её середину. Что настроить?"
options: ["v-if вместо v-show", "scrollBehavior в createRouter", "createWebHashHistory", "KeepAlive"]
answer: "scrollBehavior в createRouter"
check: exact
```

```drill
type: free-form
prompt: "Напиши scrollBehavior, который возвращает сохранённую позицию при переходе «назад», прокручивает к якорю при наличии hash и наверх во всех остальных случаях."
answer: "scrollBehavior(to, from, savedPosition) { if (savedPosition) return savedPosition; if (to.hash) return { el: to.hash }; return { top: 0 }; }"
check: manual
```
