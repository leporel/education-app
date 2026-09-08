---
id: vue.components-props-events-slots.theory
type: theory
title: "Компоненты: props, события, слоты — теория"
tags: [vue, components, props, emits, slots, provide, lifecycle, theory]
status: todo
updated: 2026-09-08
---

# Компоненты: props, события, слоты

## Зачем компоненты

Компонент — это переиспользуемый, инкапсулированный кусок UI со своим состоянием,
разметкой и стилями. Дерево компонентов — основная структура любого Vue-приложения:
корневой `App` содержит `Header`, `TodoList`, тот — много `TodoItem`, и так далее.

Главная ценность — **контракт**. Снаружи компонент — это «чёрный ящик» с тремя видами
интерфейса:

- **props** — вход: данные, которые родитель передаёт вниз.
- **события (emits)** — выход: уведомления, которые компонент шлёт наверх.
- **слоты** — «дырки» в разметке, куда родитель вставляет свой контент.

> **Параллель с Go.** Компонент с его props/emits — как тип с экспортированным
> интерфейсом: props — входные поля/параметры, события — каналы наружу, а внутренности
> скрыты (как неэкспортируемые поля пакета). Хороший компонент, как хороший пакет, имеет
> узкий понятный контракт и не протекает деталями реализации.

## Подключение дочернего компонента

В `<script setup>` импорт компонента = его регистрация. Используешь — по имени тега:

```vue
<!-- Parent.vue -->
<script setup lang="ts">
import TodoItem from "./TodoItem.vue";   // импортировал — уже доступен в шаблоне
</script>

<template>
  <TodoItem />              <!-- PascalCase в шаблоне (рекомендация для компонентов) -->
</template>
```

Имя файла/компонента — `PascalCase` (`TodoItem`), и в шаблоне его пишут так же. Vue
понимает и `kebab-case` (`<todo-item>`), но для **компонентов** общепринят PascalCase,
чтобы визуально отличать их от нативных HTML-тегов.

## Props: вход компонента

`defineProps` — макрос (доступен в `<script setup>` без импорта). С TypeScript объявляем
форму props как тип-параметр:

```vue
<!-- TodoItem.vue -->
<script setup lang="ts">
interface Props {
  id: number;
  title: string;
  done?: boolean;          // опциональный
}

const props = defineProps<Props>();
console.log(props.title);  // в <script> доступ через props.*
</script>

<template>
  <li :class="{ done: done }">{{ title }}</li>   <!-- в шаблоне можно без props. -->
</template>
```

Передача из родителя — через атрибуты, статикой или привязкой:

```vue
<TodoItem :id="1" title="Купить хлеб" :done="true" />
<TodoItem :id="todo.id" :title="todo.title" :done="todo.done" />   <!-- : чтобы передать значение, не строку -->
```

Тонкость, на которой спотыкаются: `done="true"` (без `:`) передаст **строку** `"true"`, а
`:done="true"` — настоящий boolean. Для всего, кроме строковых литералов, нужен `:`.

### Значения по умолчанию

С чисто-типовым `defineProps` дефолты задают через `withDefaults`:

```ts
const props = withDefaults(defineProps<Props>(), {
  done: false,
});
```

### Главное правило: props идут вниз и неизменяемы (one-way data flow)

Props — **только для чтения**. Родитель владеет данными, ребёнок их отображает. Мутировать
prop изнутри нельзя:

```ts
props.done = true;   // ❌ Vue предупредит: "Set operation on key 'done' failed: target is readonly"
```

> **Простыми словами.** Props — это аргументы функции, а компонент — функция, рисующая
> разметку. Ты же не меняешь аргумент внутри функции, надеясь, что вызывающий это увидит.
> Хочешь сообщить наверх — верни результат; в мире компонентов «вернуть» = эмитнуть событие.

Почему так строго: если бы ребёнок молча менял props, данные «текли» бы в обе стороны и
было бы невозможно понять, кто источник истины. Поток данных односторонний: **вниз через
props, наверх через события**. Если ребёнку нужно «поменять» — он не мутирует prop, а
**просит родителя** через событие (ниже). Если нужно локально преобразовать prop — заводи
`computed` или локальный `ref`, инициализированный из prop.

> **Go-параллель.** Это как передать в функцию копию структуры: менять локально можно, но
> на вызывающего это не повлияет — а Vue даже копию делает readonly, чтобы ты не питал
> иллюзий. Хочешь повлиять на родителя — верни результат (тут «вернуть» = эмитнуть событие).

## События: выход компонента

Ребёнок сообщает наверх через `emit`. Объявляем типизированно:

```vue
<!-- TodoItem.vue -->
<script setup lang="ts">
const emit = defineEmits<{
  toggle: [id: number];          // имя события: [типы аргументов]
  remove: [id: number];
}>();

function onToggle() {
  emit("toggle", props.id);      // шлём наверх с полезной нагрузкой
}
</script>
```

Родитель слушает их как обычные события, через `@`:

```vue
<TodoItem
  :title="todo.title"
  @toggle="toggleTodo"
  @remove="removeTodo"
/>
```

Имена событий принято писать в `kebab-case` при объявлении в шаблоне родителя
(`@my-event`) — хотя в `defineEmits` они camelCase; Vue сопоставляет автоматически. Для
учебного кода держись простых имён.

### `v-model` на компоненте

`v-model` работает не только на `<input>`, но и на компоненте — это типовой способ
сделать «управляемый» компонент (например, свой инпут или модалку). Современный способ —
макрос `defineModel`:

```vue
<!-- MyInput.vue -->
<script setup lang="ts">
const model = defineModel<string>();    // двусторонняя связь с родительским v-model
</script>

<template>
  <input :value="model" @input="model = ($event.target as HTMLInputElement).value" />
</template>
```

```vue
<!-- Parent.vue -->
<MyInput v-model="search" />    <!-- search в родителе и model в ребёнке синхронны -->
```

`defineModel` под капотом — это пара «prop + событие `update:modelValue`». Снова: никакой
магии, просто стандартизированная пара вход/выход.

### Fallthrough-атрибуты: куда уезжает `class`, которого нет в props

Небольшая, но постоянно всплывающая деталь. Что произойдёт, если передать компоненту
атрибут, которого нет ни в `props`, ни в `emits`?

```vue
<MyButton class="primary" data-test="save" @focus="onFocus" />
```

Такие атрибуты называются **fallthrough-атрибутами**: Vue автоматически «пробрасывает» их
на **корневой элемент** компонента. Поэтому `class="primary"` окажется на `<button>` внутри
`MyButton`, слушатель `@focus` — тоже, и всё просто работает. Это очень удобно: обёртки над
нативными элементами не обязаны перечислять сотню возможных атрибутов.

Два случая, когда надо вмешаться:

- **У компонента несколько корневых элементов** — Vue не знает, кому отдать атрибуты, и
  предупредит. Тогда указываешь явно: `<div v-bind="$attrs">`.
- **Атрибуты должны уехать не на корень**, а внутрь (например, на `<input>` внутри обёртки
  с `<label>`). Тогда отключаешь автоматику и раскладываешь руками:

```vue
<script setup lang="ts">
defineOptions({ inheritAttrs: false });   // не вешать атрибуты на корень автоматически
</script>

<template>
  <label class="field">
    <span>{{ label }}</span>
    <input v-bind="$attrs" />             <!-- всё лишнее уходит на input -->
  </label>
</template>
```

`$attrs` — объект со всеми непринятыми атрибутами и слушателями. `defineOptions` — макрос
для опций компонента, которые нельзя выразить иначе (`inheritAttrs`, `name`).

### `defineExpose`: что компонент показывает родителю

По умолчанию компонент, написанный в `<script setup>`, **закрыт**: даже получив на него
template ref, родитель не увидит его внутренних переменных. Это хорошо (инкапсуляция), но
иногда нужно дать наружу метод — например, `focus()` у своего инпута или `open()` у
модалки. Для этого есть `defineExpose`:

```vue
<!-- MyModal.vue -->
<script setup lang="ts">
import { ref } from "vue";
const isOpen = ref(false);
function open() { isOpen.value = true; }
function close() { isOpen.value = false; }

defineExpose({ open, close });   // только это увидит родитель
</script>
```

```vue
<!-- родитель -->
<script setup lang="ts">
import { useTemplateRef } from "vue";
const modal = useTemplateRef<{ open: () => void }>("modal");
</script>

<template>
  <MyModal ref="modal" />
  <button @click="modal?.open()">Открыть</button>
</template>
```

Пользуйся умеренно: императивный вызов метода ребёнка — исключение, а не стиль. Всё, что
выражается состоянием и props, лучше выражать состоянием и props.

## Слоты: чужая разметка внутри компонента

Иногда компонент задаёт «рамку», а содержимое решает родитель. Это **слоты** —
композиция по разметке, а не по данным:

```vue
<!-- Card.vue -->
<template>
  <div class="card">
    <header><slot name="title">Без названия</slot></header>   <!-- именованный + дефолт -->
    <div class="body"><slot /></div>                           <!-- слот по умолчанию -->
  </div>
</template>
```

```vue
<!-- использование -->
<Card>
  <template #title><h2>Профиль</h2></template>   <!-- #title — в именованный слот -->
  <p>Любое содержимое тела карточки.</p>          <!-- остальное — в слот по умолчанию -->
</Card>
```

- **Слот по умолчанию** (`<slot />`) — основной контент.
- **Именованные слоты** (`<slot name="title" />`, заполняются через `#title`) — несколько
  «дырок».
- **Fallback** — то, что внутри `<slot>…</slot>`, показывается, если родитель ничего не дал.
- **Scoped-слоты** — слот может **отдать данные обратно** родителю
  (`<slot :item="item" />`, принимается как `#default="{ item }"`). Это мощно для
  компонентов-списков, которые рендерят чужую разметку по своим данным.

> **Зачем это, если есть props?** Props передают *данные*; слоты передают *разметку*.
> Кнопка с текстом-prop ограничена текстом; кнопка со слотом примет внутрь и иконку, и
> что угодно. Слоты — это «дай ребёнку дырку, пусть родитель сам решит, что туда».

## provide / inject: сквозь дерево без props-drilling

Передавать prop через 5 уровней вложенности только чтобы донести его до глубокого
потомка — мучительно («props drilling»). Для такого есть `provide`/`inject`: предок
**предоставляет** значение, любой потомок ниже по дереву его **внедряет**, минуя
промежуточные уровни:

```ts
// предок
import { provide, ref } from "vue";
const theme = ref<"light" | "dark">("light");
provide("theme", theme);
```

```ts
// потомок на любой глубине
import { inject } from "vue";
const theme = inject("theme");   // получил тот же реактивный ref
```

Это, по сути, **dependency injection** с областью видимости «поддерево». Хорошо для
сквозных вещей: тема, текущий пользователь, конфиг локали. Для типобезопасности ключи
оформляют через `InjectionKey<T>`. Не злоупотребляй: provide/inject делает связи неявными
(как глобальные переменные), поэтому для «общего состояния приложения» чаще берут стор
(Pinia, модуль 06), а provide/inject — для локального «контекста поддерева».

## Встроенные компоненты: `Teleport`, `Transition`, `KeepAlive`

Vue приносит несколько компонентов «из коробки» — их не нужно импортировать. Три из них
встречаются в любом реальном проекте, поэтому знать их надо.

### `<Teleport>` — отрендерить разметку в другое место DOM

Классическая боль: модальное окно объявлено глубоко внутри карточки товара, а
`overflow: hidden` и `z-index` родителей обрезают его по краям. Логически модалка
принадлежит карточке, физически должна лежать в конце `<body>`. `Teleport` разводит эти
два требования:

```vue
<template>
  <button @click="isOpen = true">Открыть</button>

  <Teleport to="body">
    <div v-if="isOpen" class="modal-backdrop">
      <div class="modal">…содержимое…</div>
    </div>
  </Teleport>
</template>
```

Компонент остаётся владельцем состояния и обработчиков (реактивность, props, события
работают как обычно), а DOM-узлы уезжают туда, куда указывает `to` (селектор). Типовые
клиенты: модалки, тултипы, выпадающие меню, уведомления.

### `<Transition>` — анимация появления и исчезновения

Оборачивает **один** элемент/компонент и навешивает CSS-классы на этапах входа и выхода:

```vue
<template>
  <Transition name="fade">
    <p v-if="show">Сообщение</p>
  </Transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from,   .fade-leave-to     { opacity: 0; }
</style>
```

Vue сам добавляет и снимает классы `*-enter-from/-enter-active/-enter-to` и
`*-leave-from/-leave-active/-leave-to`, а главное — **дожидается конца анимации перед
удалением узла** (иначе элемент исчезал бы мгновенно, и анимировать было бы нечего). Для
списков есть `<TransitionGroup>` — там `:key` становится ещё важнее, потому что по нему
считаются перемещения.

### `<KeepAlive>` — не уничтожать компонент при переключении

По умолчанию при смене `v-if`/`<component :is>`/маршрута старый компонент **уничтожается**:
теряются введённый текст, позиция прокрутки, загруженные данные. `<KeepAlive>` держит его в
памяти:

```vue
<KeepAlive>
  <component :is="currentTab" />
</KeepAlive>
```

Такой компонент вместо `onUnmounted` получает хуки `onDeactivated` / `onActivated`.
Плата — память и «живые» подписки у невидимого компонента, поэтому кэшируй осознанно
(вкладки формы — да; бесконечный список страниц — вряд ли).

> Ещё одна встроенная штука на будущее: `defineAsyncComponent(() => import("./Heavy.vue"))`
> — компонент, код которого подгружается по требованию (тот же приём, что lazy-загрузка
> маршрутов в модуле 05), и `<Suspense>` для показа заглушки на время загрузки — про него в
> модуле 07.

## Lifecycle-хуки

У компонента есть жизненный цикл: его создают, монтируют в DOM, обновляют, размонтируют.
В нужные моменты можно вклиниться:

```vue
<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";

onMounted(() => {
  // DOM компонента уже на странице — здесь можно: запросить данные,
  // подписаться на события window, инициализировать стороннюю библиотеку
});

onUnmounted(() => {
  // компонент убирают — здесь чистим за собой: отписки, таймеры, листенеры
});
</script>
```

Самые ходовые — `onMounted` (старт: загрузка данных, доступ к DOM) и `onUnmounted`
(уборка). Есть ещё `onUpdated`, `onBeforeMount` и др., но 90% времени тебе нужны эти два.
Важная дисциплина: **что подписал/создал в `onMounted` — отпиши/убери в `onUnmounted`**,
иначе утечки (висящие листенеры, таймеры). Это прямой аналог `defer cleanup()` в Go —
только разнесённый по двум хукам.

## Обзор Options API (как читать легаси)

До Composition API (Vue 2 и ранний Vue 3) компоненты писали в **Options API**: объект с
секциями `data`, `methods`, `computed`, `watch`, хуки `mounted` и т.д. Ты будешь писать в
Composition API, но **читать** чужой код придётся — вот соответствие:

```vue
<!-- Options API — тот же счётчик -->
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    step: { type: Number, default: 1 },
  },
  data() {
    return { count: 0 };               // реактивное состояние
  },
  computed: {
    doubled(): number { return this.count * 2; },
  },
  methods: {
    inc() { this.count += this.step; }, // доступ к state/props через this
  },
  mounted() {
    console.log("смонтирован");
  },
});
</script>
```

Тот же компонент в Composition API + `<script setup>`:

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

const props = withDefaults(defineProps<{ step?: number }>(), { step: 1 });
const count = ref(0);                                 // data → ref
const doubled = computed(() => count.value * 2);      // computed → computed
function inc() { count.value += props.step; }         // methods → обычные функции
onMounted(() => console.log("смонтирован"));          // mounted → onMounted
</script>
```

Соответствие: `data` → `ref`/`reactive`; `computed` → `computed`; `methods` → обычные
функции; `mounted` → `onMounted`; `this.x` → прямая переменная. **Почему перешли:** в
Options API логика одной фичи размазана по секциям (`data` тут, `methods` там, `watch`
ещё где-то), и переиспользовать её между компонентами было неудобно (миксины с их
конфликтами имён). Composition API группирует код **по фиче, а не по типу опции**, и
позволяет вынести фичу в **composable** (модуль 04) — переиспользуемую функцию. Признак
Options-кода: `export default { data() {...}, methods: {...} }` и `this.` повсюду. Увидел —
мысленно переведи по таблице выше.

## Типичные ошибки и заблуждения

- **«Prop можно поменять изнутри компонента».** Нет, props readonly. Нужно изменить —
  эмить событие родителю или заведи локальный `ref`/`computed` из prop.
- **«`done="true"` передаст boolean».** Без `:` это строка `"true"`. Для не-строк — `:done="true"`.
- **«События — это что-то особенное».** Это обычный механизм «ребёнок зовёт, родитель
  слушает через `@`». `v-model`/`defineModel` — стандартизированная пара prop+событие.
- **«Слоты и props взаимозаменяемы».** Props — данные, слоты — разметка. Нужно вставить
  произвольный контент — слот; передать значение — prop.
- **«provide/inject = глобальный стор».** Это контекст поддерева, связи неявные. Для
  состояния всего приложения бери Pinia.
- **«Подписался в onMounted — и забыл».** Утечки. Всё, что создал/подписал, убирай в
  `onUnmounted`.
- **«Options API устарел и не встретится».** Встретится сплошь и рядом в существующих
  проектах; читать обязан, даже если пишешь в Composition API.
- **«Атрибут, которого нет в props, потеряется».** Нет: он пробросится на корневой элемент
  (fallthrough). Нужно иначе — `inheritAttrs: false` + `v-bind="$attrs"`.
- **«Родитель через ref увидит внутренности ребёнка».** Нет, `<script setup>` закрыт;
  наружу отдаётся только то, что перечислено в `defineExpose`.
- **«Модалку обязательно рендерить там, где она объявлена».** Нет — `<Teleport to="body">`
  спасает от обрезания родительскими `overflow`/`z-index`.
- **«Компонент при переключении вкладки сохранит состояние».** Нет, он уничтожается.
  Нужно сохранить — `<KeepAlive>` (и помнить про цену в памяти).

## Глоссарий модуля

- **Props** — входные данные компонента (только для чтения).
- **Emits / событие компонента** — уведомление наверх с полезной нагрузкой.
- **One-way data flow** — данные вниз через props, изменения наверх через события.
- **`defineProps` / `defineEmits` / `defineModel` / `defineExpose` / `defineOptions`** —
  макросы `<script setup>` (импортировать не нужно).
- **`withDefaults`** — значения по умолчанию для типизированных props.
- **Слот** — «дырка» в разметке компонента; бывает по умолчанию, именованный и scoped.
- **Fallback слота** — содержимое, показываемое, если родитель ничего не передал.
- **`$slots`** — объект с переданными слотами (удобно для `v-if`).
- **Fallthrough-атрибуты / `$attrs`** — атрибуты, не объявленные в props, уезжающие на
  корневой элемент.
- **provide / inject** — передача контекста вниз по поддереву; `InjectionKey<T>` — типизация
  ключа.
- **Props drilling** — прокидывание prop через много уровней «транзитом».
- **Lifecycle-хуки** — `onMounted`, `onUnmounted`, `onUpdated` и др.
- **Teleport / Transition / KeepAlive** — встроенные компоненты: перенос в другой узел DOM,
  анимация появления/исчезновения, сохранение компонента в памяти.
- **Options API** — старый стиль (`data`/`methods`/`computed`), который нужно уметь читать.

## См. также

- Vue Guide, *Props*: https://vuejs.org/guide/components/props.html
- Vue Guide, *Component Events* (`emits`): https://vuejs.org/guide/components/events.html
- Vue Guide, *Component v-model* (`defineModel`): https://vuejs.org/guide/components/v-model.html
- Vue Guide, *Slots*: https://vuejs.org/guide/components/slots.html
- Vue Guide, *Provide / Inject*: https://vuejs.org/guide/components/provide-inject.html
- Vue Guide, *Lifecycle Hooks*: https://vuejs.org/guide/essentials/lifecycle.html
- Vue Guide, *Composition API FAQ* (зачем перешли): https://vuejs.org/guide/extras/composition-api-faq.html
- Уроки: [`lessons/01-todo-item-component.md`](./lessons/01-todo-item-component.md),
  [`lessons/02-slots-and-provide.md`](./lessons/02-slots-and-provide.md)
- Дальше — переиспользуемая логика: [`../04-composables-and-patterns/index.md`](../04-composables-and-patterns/index.md)
