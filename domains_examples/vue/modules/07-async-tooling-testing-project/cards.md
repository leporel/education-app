---
id: vue.async-tooling-testing-project.cards
type: cards
title: "Async, тулинг, тесты — карточки"
tags: [vue, async, vite, vitest, cards]
status: todo
updated: 2026-09-08
---

# Карточки

## Async-данные

```card
front: Какие три состояния моделируют у каждого async-запроса и зачем?
back: loading, error, data. Иначе пользователь видит белый экран при ошибке и «прыжок» при загрузке. Рисуем все три ветки (v-if loading / v-else-if error / v-else data).
tags: [vue, async]
```

```card
front: Бросает ли fetch исключение на HTTP 404/500?
back: "Нет — только на сетевой сбой. Статус проверяй руками: if (!res.ok) throw new Error(`HTTP ${res.status}`). (Как resp.StatusCode в Go — http.Get тоже не ошибка на 404.)"
tags: [vue, async, fetch]
```

```card
front: Почему снятие loading кладут в finally?
back: Чтобы снять флаг и при успехе, и при ошибке. Без finally спиннер зависнет навсегда, если запрос упал.
tags: [vue, async]
```

```card
front: Что такое <Suspense> и async setup, и стоит ли полагаться?
back: "Компонент с верхнеуровневым await — async-компонент; <Suspense> показывает #fallback, пока он грузится. Снимает ручной loading, но помечен экспериментальным и не решает ошибки. В учебном коде — явная тройка loading/error/data."
tags: [vue, suspense]
```

## Формы

```card
front: Как моделировать ошибки валидации формы?
back: "Как производные (computed) от полей, а не отдельное состояние. Плюс: клиентская валидация — это UX, сервер валидирует независимо (не доверяем клиенту)."
tags: [vue, forms]
```

## Тулинг

```card
front: Что такое Vite и что делают скрипты dev/build/preview?
back: Vite — dev-сервер (нативный ESM + HMR, мгновенный старт) и сборщик (Rollup для прода). dev — запустить дев-сервер; build — собрать прод-бандл; preview — посмотреть собранное локально. Конфиг — vite.config.ts.
tags: [vue, vite]
```

```card
front: Зачем префикс VITE_ у переменных окружения и что нельзя в них класть?
back: "Только переменные с префиксом VITE_ попадают в клиентский бандл (import.meta.env.VITE_X) — явный барьер. НЕЛЬЗЯ класть секреты: всё в клиентском бандле видно пользователю."
tags: [vue, vite, env]
```

```card
front: Что означает алиас @ в импортах?
back: "@ указывает на src/ (import X from '@/components/X.vue'), настроен в vite.config.ts и tsconfig. Избавляет от ../../../."
tags: [vue, vite]
```

## Тестирование

```card
front: Vitest и Vue Test Utils — что есть что?
back: Vitest — тест-раннер на Vite (как Jest, но быстрый, нативный ESM/TS). Vue Test Utils — официальная утилита монтировать компоненты в тесте и взаимодействовать (mount, find, trigger, emitted).
tags: [vue, testing]
```

```card
front: Почему в VTU-тесте нужен await перед проверкой после клика?
back: Обновления DOM во Vue асинхронны (микротаска nextTick). await trigger(...) (или await nextTick()) даёт Vue перерисоваться; иначе проверяешь старое состояние.
tags: [vue, testing, vtu]
```

```card
front: Что тестировать в компоненте, а что нет?
back: "Контракт: отрендерил ли по props (wrapper.text/find) и эмитнул ли событие на действие (wrapper.emitted). НЕ тестировать внутренние переменные/реализацию. Сторы — через createTestingPinia()."
tags: [vue, testing]
```

## Проверка типов, линтинг, сборка

```card
front: "Проверяет ли vite build типы, и чем проверяют их во Vue-проекте?"
back: "Не проверяет — Vite просто срезает аннотации ради скорости. Типы проверяет vue-tsc (скрипт npm run type-check): это tsc, понимающий .vue, включая выражения в шаблонах."
tags: [vue, tooling, types]
```

```card
front: "Зачем ESLint с eslint-plugin-vue, если есть типы?"
back: "Он ловит Vue-специфичные паттерны, невидимые компилятору: забытый :key в v-for, мутацию props, v-if вместе с v-for на одном элементе, неиспользуемые компоненты. Компилятор про типы, линтер про паттерны."
tags: [vue, eslint]
```

```card
front: "Что появляется после npm run build и как это раздают?"
back: "Папка dist/ со статикой: index.html, JS-чанки (в т.ч. отдельные для lazy-маршрутов), CSS, ассеты с хэшами в именах. Раздаёт любой веб-сервер или CDN; при createWebHistory сервер должен отдавать index.html на любой путь."
tags: [vue, build]
```

```card
front: "Зачем npm run preview и что задаёт base в vite.config.ts?"
back: "preview поднимает локальный сервер поверх dist/ — проверить прод-сборку перед деплоем (dev и прод ведут себя не одинаково). base — префикс пути, если приложение живёт не в корне домена."
tags: [vue, build, vite]
```

```card
front: "Можно ли поменять VITE_API_URL без пересборки?"
back: "Нет. Значения VITE_-переменных подставляются на этапе сборки и попадают в бандл — это не рантайм-конфиг. Нужна новая сборка (или отдельный механизм конфигурации)."
tags: [vue, vite, env]
```
