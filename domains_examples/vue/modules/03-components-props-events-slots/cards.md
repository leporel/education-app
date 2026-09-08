---
id: vue.components-props-events-slots.cards
type: cards
title: "Компоненты: props, события, слоты — карточки"
tags: [vue, components, props, emits, slots, cards]
status: todo
updated: 2026-09-08
---

# Карточки

## Контракт компонента

```card
front: Три вида интерфейса компонента наружу?
back: props (вход — данные от родителя вниз), события/emits (выход — уведомления наверх), слоты (дырки в разметке для контента родителя). Внутренности инкапсулированы.
tags: [vue, components]
```

## Props

```card
front: Как объявить типизированные props в <script setup> и задать дефолты?
back: "const props = defineProps<Props>(); дефолты — withDefaults(defineProps<Props>(), { done: false }). defineProps — макрос, импортировать не нужно."
tags: [vue, props]
```

```card
front: Главное правило потока данных с props?
back: "One-way data flow: props идут вниз и неизменяемы (readonly). Менять prop изнутри нельзя — Vue предупредит. Нужно повлиять на родителя — эмить событие; нужно локально преобразовать — computed/локальный ref из prop."
tags: [vue, props, data-flow]
```

```card
front: Чем отличается done="true" от :done="true" в передаче prop?
back: done="true" передаёт СТРОКУ "true". :done="true" (с v-bind) передаёт настоящий boolean. Для всего, кроме строковых литералов, нужен :.
tags: [vue, props, v-bind]
```

## События / v-model

```card
front: Как ребёнок сообщает наверх и как родитель слушает?
back: "Ребёнок: const emit = defineEmits<{ toggle: [id: number] }>(); emit('toggle', id). Родитель: <Child @toggle=\"handler\" />. Обычный механизм «зов → слушатель через @»."
tags: [vue, emits]
```

```card
front: Что такое defineModel и как он связан с v-model на компоненте?
back: const model = defineModel<string>() даёт двустороннюю связь с родительским v-model. Под капотом — пара prop modelValue + событие update:modelValue. Используется как <Child v-model="x" />.
tags: [vue, v-model, defineModel]
```

## Слоты

```card
front: Слоты vs props — в чём разница назначения?
back: Props передают ДАННЫЕ, слоты передают РАЗМЕТКУ. Нужен произвольный контент внутрь компонента (иконка, любой HTML) — слот. Нужно значение — prop.
tags: [vue, slots]
```

```card
front: Слот по умолчанию, именованный, fallback, scoped — кратко?
back: "<slot/> — основной контент; <slot name=\"x\"/> заполняется через #x; контент внутри <slot>...</slot> — fallback, если родитель ничего не дал; scoped — слот отдаёт данные обратно (<slot :item=\"i\"/> → #default=\"{ item }\")."
tags: [vue, slots]
```

## provide/inject и lifecycle

```card
front: Когда provide/inject, а когда стор (Pinia)?
back: provide/inject — контекст ПОДДЕРЕВА (тема, локаль, текущий пользователь), убирает props drilling, но связи неявные. Для состояния всего приложения — стор. Не делать из provide/inject глобальный стор.
tags: [vue, provide, inject]
```

```card
front: Два самых ходовых lifecycle-хука и дисциплина с ними?
back: "onMounted (DOM готов: загрузка данных, доступ к DOM, подписки) и onUnmounted (уборка). Всё, что подписал/создал в onMounted, отпиши/убери в onUnmounted — иначе утечки. Аналог defer cleanup() в Go."
tags: [vue, lifecycle]
```

## Options API (чтение легаси)

```card
front: Соответствие Options API → Composition API (data/computed/methods/mounted)?
back: "data() → ref/reactive; computed → computed; methods → обычные функции; mounted → onMounted; this.x → прямая переменная. Признак Options-кода: export default { data(){}, methods:{} } и this. повсюду."
tags: [vue, options-api]
```

```card
front: Почему индустрия перешла с Options API на Composition API?
back: В Options API логика одной фичи размазана по секциям (data/methods/watch) и плохо переиспользуется (миксины конфликтуют именами). Composition группирует код по фиче и позволяет вынести её в composable — переиспользуемую функцию.
tags: [vue, options-api, composition-api]
```

## $attrs, defineExpose, встроенные компоненты

```card
front: Куда попадёт class="primary", если у компонента нет такого prop?
back: "На корневой элемент компонента — это fallthrough-атрибут (вместе со слушателями). Если корней несколько или атрибуты нужны внутри, ставят defineOptions({ inheritAttrs: false }) и v-bind=\"$attrs\" на нужный элемент."
tags: [vue, attrs]
```

```card
front: Что видит родитель, получив template ref на компонент в <script setup>?
back: Только то, что перечислено в defineExpose({ ... }). По умолчанию компонент закрыт — внутренние ref и функции недоступны. Императивные вызовы методов ребёнка — исключение, а не стиль.
tags: [vue, defineExpose]
```

```card
front: Зачем нужен <Teleport to="body">?
back: "Отрендерить разметку (модалку, тултип) в другом месте DOM, оставив её логически внутри компонента. Спасает от обрезания родительскими overflow: hidden и z-index. Реактивность и события продолжают работать."
tags: [vue, teleport]
```

```card
front: Что делает <Transition> и почему без неё анимация исчезновения не работает?
back: Навешивает классы *-enter-* / *-leave-* на этапах входа и выхода и ДОЖИДАЕТСЯ конца анимации перед удалением узла. Без неё элемент удаляется мгновенно и анимировать нечего.
tags: [vue, transition]
```

```card
front: Что делает <KeepAlive> и какова цена?
back: Не уничтожает компонент при переключении, а держит в памяти (сохраняются ввод, прокрутка, данные); вместо onUnmounted работают onDeactivated/onActivated. Цена — память и живые подписки невидимого компонента, поэтому кэшировать осознанно.
tags: [vue, keepalive]
```

```card
front: Что такое defineAsyncComponent?
back: "Компонент, код которого подгружается по требованию: defineAsyncComponent(() => import('./Heavy.vue')). Тот же приём, что lazy-загрузка маршрутов; заглушку на время загрузки даёт <Suspense>."
tags: [vue, async-component]
```
