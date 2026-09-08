---
id: vue.routing.cards
type: cards
title: "Маршрутизация — карточки"
tags: [vue, router, cards]
status: todo
updated: 2026-09-08
---

# Карточки

## Основы

```card
front: Чем client-side routing (SPA) отличается от классических переходов?
back: В классике каждый переход — новый запрос к серверу и полная перерисовка. В SPA грузится одна страница, дальше JS меняет URL (History API) и подменяет компонент на клиенте — мгновенно, без перезагрузки, состояние сохраняется.
tags: [vue, router, spa]
```

```card
front: Что делают <RouterView> и <RouterLink>?
back: "<RouterView> — место, куда рендерится компонент активного маршрута. <RouterLink to=\"...\"> — навигационная ссылка: рендерит <a>, но перехватывает клик и переходит без перезагрузки (голый <a href> убил бы SPA)."
tags: [vue, router]
```

```card
front: createWebHistory vs createWebHashHistory?
back: "createWebHistory — чистые URL (/about), но сервер должен отдавать index.html на любой путь. createWebHashHistory — URL с # (/#/about), работает без серверной настройки, но некрасиво. По умолчанию — createWebHistory."
tags: [vue, router, history]
```

## Параметры и навигация

```card
front: useRoute vs useRouter — в чём разница?
back: useRoute() — ТЕКУЩИЙ маршрут, для чтения route.params / route.query. useRouter() — сам роутер, для навигации (router.push/replace/back). Маленькая буква, большая разница.
tags: [vue, router]
```

```card
front: При переходе /users/1 → /users/2 данные не обновляются. Почему и как чинить?
back: "Тот же маршрут переиспользует компонент — onMounted второй раз не сработает, меняется только route.params. Решение: watch(() => route.params.id, loadUser, { immediate: true })."
tags: [vue, router, pitfall]
```

```card
front: Где route.params, а где route.query?
back: route.params — части пути из :id (/users/:id). route.query — строка запроса ?sort=asc → route.query.sort. (Аналог chi.URLParam и r.URL.Query().Get в Go.)
tags: [vue, router]
```

## Guards и lazy

```card
front: Что такое navigation guard и что значат его возвраты?
back: "Хук до/после перехода. router.beforeEach((to, from) => ...): вернуть true/undefined — пустить; false — отменить; объект маршрута — перенаправить (напр. на login с query.redirect). Маршруты метят через meta.requiresAuth."
tags: [vue, router, guards]
```

```card
front: Защищает ли клиентский guard данные от несанкционированного доступа?
back: "Нет. Guard — это UX/навигация: прячет недоступные экраны. Любой подменит флаг в devtools. Настоящая защита — на сервере: он не отдаёт данные без валидного токена. Сервер — источник истины."
tags: [vue, router, security]
```

```card
front: "Что даёт lazy-loading маршрута (component: () => import('...'))?"
back: Код страницы попадает в отдельный чанк и грузится только при первом заходе на неё. Стартовый бандл меньше → приложение быстрее открывается. Для тяжёлых/редких страниц (админка, отчёты) — почти всегда правильно.
tags: [vue, router, lazy]
```

```card
front: "Зачем навигировать по name ({ name: 'user' }), а не по строке пути?"
back: "Навигация по имени устойчива к изменению самого пути: поменяешь path в конфиге — все ссылки по name продолжат работать. Плюс параметры передаются явно через params."
tags: [vue, router]
```

## 404 и прокрутка

```card
front: "Как показать страницу 404 для несуществующего URL?"
back: "Добавить последним catch-all маршрут { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundView }. Без него по неизвестному адресу отрисуется пустота."
tags: [vue, router, 404]
```

```card
front: "Почему в SPA страница не прокручивается вверх при переходе и что с этим делать?"
back: "Перехода как перезагрузки нет — меняется только компонент, прокрутка остаётся прежней. Решение — scrollBehavior в createRouter: savedPosition для назад/вперёд, { el: to.hash } для якоря, { top: 0 } для обычного перехода."
tags: [vue, router, scroll]
```

```card
front: "Что в SPA перестаёт работать «само» и становится задачей разработчика?"
back: "Прокрутка при переходе (scrollBehavior), заголовок вкладки (обычно router.afterEach + to.meta.title), управление фокусом, страница 404. Раньше это давала перезагрузка страницы."
tags: [vue, router, spa]
```
