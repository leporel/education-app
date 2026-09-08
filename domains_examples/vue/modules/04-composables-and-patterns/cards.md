---
id: vue.composables-and-patterns.cards
type: cards
title: "Composables и паттерны — карточки"
tags: [vue, composables, watch, cards]
status: todo
updated: 2026-09-08
---

# Карточки

## Composables

```card
front: Что такое composable и зачем он нужен?
back: Обычная функция (по соглашению use*), использующая Composition API и возвращающая реактивное состояние + методы. Нужна, чтобы переиспользовать ЛОГИКУ фичи между компонентами без дублирования. Никакой магии — это JS-функция.
tags: [vue, composables]
```

```card
front: Почему деструктуризация результата composable безопасна, а reactive — нет?
back: Composable отдаёт объект с ref-ами. Деструктуризация копирует сам ref (ссылку на живую ячейку), а не значение, — связь сохраняется. Поэтому отдавай ref/computed, а не голый reactive (или оборачивай в toRefs).
tags: [vue, composables, reactivity]
```

```card
front: Состояние внутри функции composable vs на уровне модуля — в чём разница?
back: "Внутри функции — НОВЫЙ независимый экземпляр на каждый вызов (локальный стейт). На уровне модуля — ОДИН на всех (синглтон/глобальный): создаётся раз при импорте, все вызовы делят его."
tags: [vue, composables, singleton]
```

```card
front: Чем composable лучше Vue-миксинов?
back: Миксины конфликтуют именами (два с loading — кто победит?), неясен источник свойства. Composable вызывается явно, результат именуешь сам (const { loading } = useFetch()) — конфликты разводятся переименованием. Миксины — легаси.
tags: [vue, composables, mixins]
```

```card
front: Composable vs кастомный React-хук — ключевое отличие механики?
back: Тело composable выполняется ОДИН раз при создании, не на каждый рендер. Поэтому нет «правил хуков», нет массива зависимостей useEffect, нет проблем со старыми замыканиями — реактивность Vue сама отслеживает зависимости.
tags: [vue, composables, react]
```

## Template refs

```card
front: Что такое template ref и когда он оправдан?
back: "Доступ к реальному DOM-элементу: ref=\"field\" в шаблоне + useTemplateRef('field') в скрипте. Аварийный люк в императивный мир — для фокуса, измерений, интеграции библиотек. До onMounted значение null (доступ через ?.)."
tags: [vue, template-refs]
```

## Watchers

```card
front: Что делают опции immediate и deep у watch?
back: immediate — выполнить коллбэк сразу при создании, не только на будущие изменения. deep — следить за изменениями ВНУТРИ объекта (нужен для getter, возвращающего объект; на ref(object)/reactive watch и так глубокий).
tags: [vue, watch]
```

```card
front: Зачем onCleanup / AbortController в watch при загрузке по запросу?
back: "Отменить устаревшую асинхронную операцию при быстрой смене источника. Лечит гонку: набрал по букве — улетели запросы, пришли вразнобой. onCleanup(() => controller.abort()) отменяет предыдущий. По духу — context.WithCancel в Go."
tags: [vue, watch, async]
```

```card
front: Нужно ли вручную останавливать watch, созданный в <script setup>?
back: Обычно нет — watchers, созданные синхронно в setup, останавливаются автоматически при размонтировании. stop() (возвращается из watch) нужен, если следишь вручную вне обычного жизненного цикла.
tags: [vue, watch]
```

## Паттерны

```card
front: composable vs provide/inject vs стор — когда что?
back: composable — переиспользовать ЛОГИКУ между компонентами. provide/inject — раздать КОНТЕКСТ вниз по поддереву (тема/локаль). Стор (Pinia) — ОБЩЕЕ состояние приложения с действиями, devtools, типобезопасностью.
tags: [vue, patterns]
```

## Правило вызова и дизайн API

```card
front: "Единственное реальное ограничение при вызове composable?"
back: "Если внутри есть lifecycle-хуки или inject, вызывать нужно синхронно в setup / <script setup> — до любого await и не внутри обработчика. Иначе хук не привяжется к экземпляру компонента."
tags: [vue, composables, pitfall]
```

```card
front: "Что composable должен возвращать наружу?"
back: "ref и computed (чтобы результат можно было деструктурировать), обычные функции для действий, при необходимости readonly(state) — тогда менять состояние можно только через предоставленные функции. reactive возвращать не стоит."
tags: [vue, composables, api]
```

```card
front: "Где искать готовые composables вместо написания своих?"
back: "VueUse (vueuse.org) — большая библиотека composables от участников ядра Vue: useLocalStorage, useDebounce, useEventListener и сотни других. Свои пишем ради понимания механики, в проекте разумно переиспользовать готовое."
tags: [vue, composables, vueuse]
```
