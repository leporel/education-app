---
id: vue.state-pinia.cards
type: cards
title: "Общее состояние (Pinia) — карточки"
tags: [vue, pinia, cards]
status: todo
updated: 2026-09-08
---

# Карточки

## Зачем стор

```card
front: Какую проблему решает Pinia сверх props/provide/синглтона?
back: Централизованное общее состояние для несвязанных частей приложения (корзина, юзер, токен) со структурой (state/getters/actions), типизацией, Vue DevTools и удобным тестом. «Синглтон на модуле, сделанный правильно».
tags: [vue, pinia]
```

```card
front: Когда стор, а когда нет?
back: Локальное состояние — ref в компоненте. Переиспользуемая логика без общего стейта — composable. Контекст поддерева — provide/inject. Общее для многих несвязанных частей — Pinia. Не тащить всё в глобальный стор «на всякий».
tags: [vue, pinia, patterns]
```

## Структура стора

```card
front: Соответствие state/getters/actions знакомым примитивам (setup-стор)?
back: state → ref/reactive; getter → computed; action → обычная функция (можно async). Setup-стор пишется как composable внутри defineStore('id', () => { ... return {...} }).
tags: [vue, pinia]
```

```card
front: setup-стиль vs options-стиль стора Pinia?
back: Тот же стор, разный синтаксис. setup — composable с ref/computed/функциями (гибче, по умолчанию). options — объект { state, getters, actions } с доступом через this (ближе к Options API). options встречается в коде — узнавай.
tags: [vue, pinia]
```

```card
front: Для чего первый аргумент defineStore('counter', ...)?
back: Уникальный id стора — нужен Pinia для регистрации и для Vue DevTools (под этим именем виден стор и его действия).
tags: [vue, pinia]
```

## Использование

```card
front: Почему const { count } = useStore() теряет реактивность и как правильно?
back: "Стор — reactive-объект, деструктуризация копирует значение. Правильно: const { count, doubled } = storeToRefs(store) для state/getters; actions берут прямо со стора (const { increment } = store)."
tags: [vue, pinia, storeToRefs]
```

```card
front: Что НЕ нужно прогонять через storeToRefs?
back: Actions (функции). Через storeToRefs оборачивают только state и getters. Actions берут напрямую со стора — они не состояние.
tags: [vue, pinia, storeToRefs]
```

```card
front: Можно ли менять state Pinia напрямую (counter.count++)?
back: Да, Pinia это разрешает (в отличие от Redux/Vuex). Но нетривиальную логику и I/O держи в actions — одно место истины, имя в devtools, переиспользование. Тривиальное присваивание — можно напрямую.
tags: [vue, pinia, state]
```

```card
front: Один и тот же useCounterStore() в разных компонентах — это разные экземпляры?
back: Нет, один и тот же экземпляр стора — в этом и смысл общего состояния. Pinia кэширует стор по его id.
tags: [vue, pinia]
```

## Служебный API и подводные камни

```card
front: "Что делают $patch и $subscribe у стора Pinia?"
back: "$patch меняет несколько полей одной атомарной операцией (объектом или функцией) — в devtools это один шаг. $subscribe подписывается на изменения состояния (персист в localStorage, аналитика)."
tags: [vue, pinia, api]
```

```card
front: "Работает ли $reset() в setup-сторе?"
back: "Нет, из коробки только в options-сторах: в setup-сторе Pinia не знает начального состояния. Пишут свой action reset(), который присваивает начальные значения."
tags: [vue, pinia, reset]
```

```card
front: "Почему useAuthStore() на верхнем уровне модуля router/index.ts падает с ошибкой про активную Pinia?"
back: "Модуль выполняется при импорте — раньше, чем app.use(createPinia()). Стор нужно запрашивать внутри setup или внутри функции, которая выполнится позже (например, внутри router.beforeEach)."
tags: [vue, pinia, pitfall]
```

```card
front: "Как сохранять стор между перезагрузками страницы?"
back: "Подписаться через $subscribe и писать в localStorage, либо подключить плагин (pinia-plugin-persistedstate) — механика та же, плагин просто оформляет её декларативно."
tags: [vue, pinia, persist]
```
