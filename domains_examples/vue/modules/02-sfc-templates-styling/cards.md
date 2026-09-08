---
id: vue.sfc-templates-styling.cards
type: cards
title: "SFC, шаблоны и стилизация — карточки"
tags: [vue, sfc, template, styling, cards]
status: todo
updated: 2026-09-08
---

# Карточки

## SFC

```card
front: Из каких блоков состоит .vue-файл и что делает <script setup>?
back: <script setup lang="ts"> (логика), <template> (разметка с директивами), <style> (стили). script setup автоматически отдаёт всё с верхнего уровня в шаблон — ничего возвращать не нужно.
tags: [vue, sfc]
```

## Директивы

```card
front: Когда {{ }}, а когда v-bind (:)?
back: "{{ }} — для текста внутри элемента. v-bind/: — для значения атрибута (:src, :disabled, :href). {{ }} в атрибуте не работает."
tags: [vue, template, v-bind]
```

```card
front: Что такое модификаторы события и зачем .prevent / .stop / .enter?
back: "Приправы к v-on: .prevent → preventDefault(), .stop → stopPropagation(), .enter → только на Enter. Избавляют от ручной обработки внутри коллбэка. Пример: @submit.prevent=\"onSubmit\"."
tags: [vue, v-on]
```

```card
front: Разница v-if и v-show?
back: v-if реально добавляет/убирает элемент из DOM (дёшево для редких условий и тяжёлых веток). v-show всегда держит элемент в DOM и переключает display:none (дёшево для частого тогглинга).
tags: [vue, v-if, v-show]
```

```card
front: Почему :key в v-for обязателен и каким он должен быть?
back: По key Vue сопоставляет DOM-узлы с элементами данных при изменении списка. Без стабильного key (или с индексом) при вставке/удалении в середину узлы и их состояние (фокус, значение input) переедут не туда. Бери стабильный уникальный id.
tags: [vue, v-for, key]
```

```card
front: v-model — это магия двустороннего связывания?
back: Нет, это сахар над :value + @input (для checkbox — :checked + @change). Обычные явные чтение состояния и запись по событию, записанные одним словом.
tags: [vue, v-model]
```

## Стилизация

```card
front: Как задать класс по состоянию? Складывается ли он со статическим class?
back: ":class=\"{ active: isActive }\" (объект имя→условие) или массив. Статический class и динамический :class складываются — оба попадают в DOM."
tags: [vue, class]
```

```card
front: Что делает <style scoped> и как технически?
back: Ограничивает правила только элементами этого компонента. Компилятор добавляет каждому элементу уникальный data-v-* атрибут и дописывает его в селекторы — стили не протекают на всю страницу (как локальная область видимости вместо глобального CSS).
tags: [vue, scoped, css]
```

```card
front: Инлайн :style или класс — что предпочесть?
back: ":style оправдан для вычисляемых значений (ширина бара от процента). Для остального — классы: проще переопределять, нет магических чисел в разметке. Гайдлайн: scoped-классы вместо инлайн-стилей."
tags: [vue, style, class]
```

```card
front: Как подключить Tailwind v4 к проекту Vue на Vite?
back: npm i -D tailwindcss @tailwindcss/vite; в vite.config.ts добавить плагин tailwindcss() рядом с vue(); в главный CSS — @import "tailwindcss". Статические утилиты в class, зависящие от состояния — в :class.
tags: [vue, tailwind, vite]
```

## Устройство проекта

```card
front: Опиши цепочку запуска Vue-приложения от index.html до компонента.
back: "index.html содержит <div id=\"app\"> и подключает src/main.ts → main.ts вызывает createApp(App).mount('#app') → Vue рисует App.vue и всё его дерево внутрь #app. Плагины (router, Pinia) подключаются там же через .use()."
tags: [vue, bootstrap]
```

```card
front: Что означает @ в import Foo from '@/components/Foo.vue'?
back: Алиас пути на папку src/, настроенный в vite.config.ts и tsconfig. Избавляет от ../../. Это НЕ npm-пакет.
tags: [vue, vite, alias]
```

```card
front: Что делают npm run dev и npm run build?
back: dev — поднимает dev-сервер Vite с HMR (правка файла обновляет экран без перезагрузки). build — собирает оптимизированный прод-бандл в dist/.
tags: [vue, vite]
```

## Доступность

```card
front: Почему кликабельным должен быть <button>, а не <div @click>?
back: Кнопка доступна с клавиатуры (Tab + Enter/Space), объявляется скринридером как кнопка и поддерживает disabled. У div с обработчиком нет ничего из этого.
tags: [vue, a11y]
```

```card
front: Три бесплатные привычки доступности в шаблоне?
back: 1) кликабельное — <button>; 2) <label for> связан с <input id> (или input внутри label); 3) ошибку показывать текстом, а не только цветом. Плюс alt у картинок и осмысленный текст ссылок.
tags: [vue, a11y]
```
