---
id: vue.sfc-templates-styling.drills
type: drills
title: "SFC, шаблоны и стилизация — упражнения"
tags: [vue, sfc, template, styling, drills]
status: todo
updated: 2026-09-08
---

# Упражнения

## Директивы

```drill
type: multiple-choice
prompt: "Как правильно подставить url в атрибут src?"
options: ["src=\"{{ url }}\"", ":src=\"url\"", "v-text=\"url\"", "@src=\"url\""]
answer: ":src=\"url\""
check: exact
hint: В атрибутах — v-bind/:, а не {{ }}.
```

```drill
type: free-form
prompt: "Напиши <form>, который на submit вызывает onSubmit и НЕ перезагружает страницу."
answer: "<form @submit.prevent=\"onSubmit\">…</form> — модификатор .prevent вызывает preventDefault()."
check: manual
```

```drill
type: multiple-choice
prompt: "Список часто фильтруется, элементы вставляются в середину. Что критично для корректности?"
options: ["v-show вместо v-if", ":key с уникальным id, не индексом", "обернуть в reactive", "инлайн-стили"]
answer: ":key с уникальным id, не индексом"
check: exact
```

```drill
type: free-form
prompt: "Когда взять v-if, а когда v-show? Приведи по примеру."
answer: "v-if — редкое условие/тяжёлая ветка (её нет в DOM, пока не нужна), напр. блок ошибки. v-show — частое переключение видимости (тултип, дропдаун), т.к. не пересоздаёт узлы, только display."
check: manual
```

## v-model

```drill
type: free-form
prompt: "Через что раскрывается v-model='search' на <input>? Напиши эквивалент без v-model."
answer: ":value=\"search\" @input=\"search = ($event.target as HTMLInputElement).value\" — v-model это сахар над этой парой."
check: manual
```

## Стилизация

```drill
type: free-form
prompt: "Кнопке всегда нужен класс btn, плюс класс active когда isActive истинно. Напиши разметку."
answer: "<button class=\"btn\" :class=\"{ active: isActive }\">…</button> — статический class и :class складываются."
check: manual
```

```drill
type: multiple-choice
prompt: "Что делает <style scoped>?"
options: ["минифицирует CSS", "применяет стили только к элементам этого компонента через data-v-* атрибут", "делает стили глобальными", "включает Tailwind"]
answer: "применяет стили только к элементам этого компонента через data-v-* атрибут"
check: exact
```

```drill
type: free-form
prompt: "Перечисли 3 шага подключения Tailwind v4 к проекту Vue на Vite."
answer: "1) npm i -D tailwindcss @tailwindcss/vite; 2) в vite.config.ts добавить плагин tailwindcss() рядом с vue(); 3) в главный CSS-файл @import \"tailwindcss\" и импортировать его в main.ts."
check: manual
```

```drill
type: multiple-choice
prompt: "Цвет фона кнопки зависит от loading. Куда положить эти Tailwind-классы?"
options: ["в статический class", "в :class (динамически)", "в <style scoped>", "в inline style"]
answer: "в :class (динамически)"
check: exact
hint: Статические утилиты — в class, зависящие от состояния — в :class.
```

## Устройство проекта и доступность

```drill
type: free-form
prompt: "Напиши минимальный main.ts, который монтирует App.vue в элемент #app, и покажи, какая строка в index.html этому соответствует."
answer: "main.ts: import { createApp } from 'vue'; import App from './App.vue'; createApp(App).mount('#app'); В index.html: <div id=\"app\"></div> плюс <script type=\"module\" src=\"/src/main.ts\"></script>."
check: manual
```

```drill
type: multiple-choice
prompt: "import Card from '@/components/Card.vue' — что такое @?"
options: ["npm-пакет", "алиас на папку src/, настроенный в vite.config.ts", "директива Vue", "глобальная переменная"]
answer: "алиас на папку src/, настроенный в vite.config.ts"
check: exact
```

```drill
type: multiple-choice
prompt: "Нужна кликабельная «иконка удалить». Что взять для доступности?"
options: ["<div @click>", "<span @click>", "<button @click> с текстом или aria-label", "<a @click>"]
answer: "<button @click> с текстом или aria-label"
check: exact
hint: Кнопка получает фокус с клавиатуры и правильно объявляется скринридером.
```

```drill
type: free-form
prompt: "Как связать подпись и поле ввода, и что это даёт пользователю?"
answer: "<label for=\"email\">Email</label><input id=\"email\" v-model=\"email\"> (или input внутри label). Клик по подписи ставит фокус в поле, а скринридер сообщает, что именно вводят."
check: manual
```
