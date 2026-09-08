---
id: vue.routing.index
type: index
title: "Модуль 05 — Маршрутизация (Vue Router)"
tags: [vue, router, routing]
status: todo
updated: 2026-09-08
---

# Модуль 05 — Маршрутизация (Vue Router)

> Пока у нас был один экран. Реальное приложение — это много «страниц» (список, деталь,
> профиль), между которыми ходят без перезагрузки браузера. За это отвечает **Vue Router**:
> он сопоставляет URL с компонентом и меняет содержимое на лету.

## Цель

После модуля ты:

1. Понимаешь, что такое client-side routing и чем SPA-навигация отличается от обычных
   переходов по ссылкам.
2. Настраиваешь маршруты, подключаешь роутер, рендеришь страницы через `<RouterView>` и
   ходишь по ним через `<RouterLink>`.
3. Работаешь с **динамическими** (`/users/:id`) и **вложенными** маршрутами.
4. Читаешь параметры/`query` через `useRoute` и навигируешь программно через `useRouter`.
5. Защищаешь маршруты **navigation guards** (например, требуешь авторизацию) и
   **ленишь** тяжёлые страницы (lazy-loading).
6. Добавляешь то, что в SPA перестаёт работать само: страницу **404** (catch-all маршрут) и
   **`scrollBehavior`**.

## Предпосылки

- [`03-components-props-events-slots`](../03-components-props-events-slots/index.md) —
  компоненты как страницы.
- [`04-composables-and-patterns`](../04-composables-and-patterns/index.md) — `useRoute`/
  `useRouter` — это composables.

## Структура

- [`theory.md`](./theory.md) — что такое SPA-роутинг, конфигурация, динамика/вложенность,
  guards, lazy-loading.
- [`cards.md`](./cards.md) — карточки.
- [`drills.md`](./drills.md) — упражнения.
- [`lessons/01-routes-and-guards.md`](./lessons/01-routes-and-guards.md) — список/деталь,
  параметр маршрута, защищённая страница.

## Порядок прохождения

1. `theory.md`.
2. Урок `lessons/01-routes-and-guards.md`.
3. `drills.md` + карточки.
