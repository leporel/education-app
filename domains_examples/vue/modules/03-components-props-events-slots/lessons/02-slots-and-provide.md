---
id: vue.components-props-events-slots.lesson-02
type: lesson
title: "Урок 02 — Слоты и provide/inject"
tags: [vue, slots, provide, inject, lesson]
status: todo
updated: 2026-06-26
---

# Урок 02 — Слоты и provide/inject

Цель: построить переиспользуемую `Card` через слоты (композиция по разметке) и раздать
всем потомкам общую тему через `provide`/`inject` (сквозной контекст без props-drilling).

## Разогрев

- Чем слот отличается от prop по назначению?
- Когда provide/inject уместнее, чем прокидывать prop через каждый уровень?

## Часть A. Переиспользуемая карточка на слотах

### Шаг A1. Компонент `Card.vue`

```vue
<script setup lang="ts">
defineProps<{ elevated?: boolean }>();   // оформление — через prop
</script>

<template>
  <div class="card" :class="{ elevated }">
    <header v-if="$slots.title" class="card__title">
      <slot name="title" />               <!-- именованный слот -->
    </header>

    <div class="card__body">
      <slot>Пустая карточка</slot>         <!-- слот по умолчанию + fallback -->
    </div>

    <footer v-if="$slots.actions" class="card__actions">
      <slot name="actions" />
    </footer>
  </div>
</template>

<style scoped>
.card { border: 1px solid #ddd; border-radius: 8px; padding: 1rem; }
.card.elevated { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); }
.card__title { font-weight: 600; margin-bottom: 0.5rem; }
.card__actions { margin-top: 0.75rem; display: flex; gap: 0.5rem; }
</style>
```

Новая полезная деталь: `$slots.title` — служебный объект, по которому видно, **передал ли
родитель** что-то в этот слот. `v-if="$slots.title"` рисует шапку только если контент для
неё есть. Так компонент не оставляет пустых `<header>`.

### Шаг A2. Использование

```vue
<script setup lang="ts">
import Card from "./Card.vue";
</script>

<template>
  <Card elevated>
    <template #title>Профиль пользователя</template>

    <p>Имя: Ann</p>
    <p>Роль: admin</p>

    <template #actions>
      <button>Редактировать</button>
      <button>Удалить</button>
    </template>
  </Card>

  <!-- та же Card, другое наполнение — переиспользование по разметке -->
  <Card>
    <p>Просто текст без заголовка и кнопок.</p>
  </Card>
</template>
```

Одна `Card` — два совершенно разных наполнения. Если бы мы сделали `title`/`body`/`actions`
пропсами-строками, мы бы не смогли положить туда кнопки и произвольный HTML. Слоты дают
именно эту гибкость: компонент задаёт **рамку и расположение**, родитель — **содержимое**.

## Часть B. Общая тема через provide/inject

Допустим, тему (`light`/`dark`) хотят знать многие компоненты на разной глубине. Прокидывать
prop через всех — мучение. Раздадим через контекст.

### Шаг B1. Типобезопасный ключ

```ts
// theme-key.ts
import type { InjectionKey, Ref } from "vue";

export type Theme = "light" | "dark";
export const themeKey = Symbol("theme") as InjectionKey<Ref<Theme>>;
```

`InjectionKey<Ref<Theme>>` связывает ключ с типом значения — на `inject` мы получим
правильный тип без ручных приведений (TS-домен научил не доверять `any`).

### Шаг B2. Предок предоставляет

```vue
<!-- App.vue -->
<script setup lang="ts">
import { provide, ref } from "vue";
import { themeKey, type Theme } from "./theme-key";
import ThemedButton from "./ThemedButton.vue";

const theme = ref<Theme>("light");
provide(themeKey, theme);                 // отдаём реактивный ref в поддерево

function toggleTheme() {
  theme.value = theme.value === "light" ? "dark" : "light";
}
</script>

<template>
  <button @click="toggleTheme">Сменить тему (сейчас {{ theme }})</button>
  <ThemedButton />                          <!-- даже глубоко вложенный получит тему -->
</template>
```

### Шаг B3. Потомок внедряет

```vue
<!-- ThemedButton.vue (может быть на любой глубине) -->
<script setup lang="ts">
import { inject } from "vue";
import { themeKey } from "./theme-key";

const theme = inject(themeKey);            // тот же реактивный ref, тип Ref<Theme>
</script>

<template>
  <button :class="theme === 'dark' ? 'btn-dark' : 'btn-light'">
    Кнопка темы {{ theme }}
  </button>
</template>
```

Поскольку мы предоставили **реактивный `ref`**, переключение темы в `App` мгновенно
отразится во всех потомках — связь живая, не снимок. Промежуточные компоненты о теме
вообще ничего не знают: никакого props-drilling.

## Шаг C. Где грань

provide/inject соблазнителен — хочется пихать туда всё. Но он делает связи **неявными**:
глядя на `ThemedButton`, не видно, *откуда* придёт тема. Это нормально для настоящего
сквозного контекста (тема, локаль, текущий пользователь). Но для бизнес-состояния
(корзина, список задач, авторизация с действиями) лучше явный стор — Pinia (модуль 06): он
даёт devtools, типобезопасные действия и одно очевидное место истины.

## Mini-drill

```drill
type: free-form
prompt: "Добавь в Card слот по умолчанию fallback 'Нет данных' и условие рендера footer только если есть слот actions. Что для условия использовать?"
answer: "<slot>Нет данных</slot> для fallback. Для footer — v-if=\"$slots.actions\": $slots показывает, передал ли родитель контент в слот."
check: manual
```

```drill
type: multiple-choice
prompt: "Почему через provide отдают реактивный ref(theme), а не theme.value?"
options: ["так короче", "чтобы изменения темы вживую отражались у всех потомков; .value отдал бы статичный снимок", "value нельзя provide-ить", "ради типизации"]
answer: "чтобы изменения темы вживую отражались у всех потомков; .value отдал бы статичный снимок"
check: exact
```

```drill
type: free-form
prompt: "Назови минус provide/inject по сравнению с props и когда он перевешивает плюсы."
answer: "Связи неявные — у потомка не видно источник значения (как глобальная переменная). Перевешивает для настоящего сквозного контекста (тема/локаль/пользователь), но для бизнес-состояния лучше явный стор."
check: manual
```

## Итог

Слоты дали переиспользование **по разметке** (одна `Card` — любое наполнение), а
provide/inject — раздачу **контекста** сквозь дерево без props-drilling, причём живую,
потому что отдавали реактивный `ref`. Вместе с props/emits из урока 01 у тебя теперь полный
набор способов соединять компоненты: данные вниз (props), события наверх (emits), разметка
внутрь (slots), контекст сквозь дерево (provide/inject). Дальше вынесем переиспользуемую
**логику** в composables.
