---
id: vue.components-props-events-slots.drills
type: drills
title: "Компоненты: props, события, слоты — упражнения"
tags: [vue, components, props, emits, slots, drills]
status: todo
updated: 2026-09-08
---

# Упражнения

## Props

```drill
type: free-form
prompt: "Объяви типизированные props компонента Badge: text:string, type?: 'info' | 'warn' (по умолчанию 'info')."
answer: "const props = withDefaults(defineProps<{ text: string; type?: 'info' | 'warn' }>(), { type: 'info' });"
check: manual
```

```drill
type: multiple-choice
prompt: "Ребёнок хочет «выключить» свой prop disabled внутри себя: props.disabled = true. Что произойдёт?"
options: ["сработает", "Vue предупредит: target is readonly", "родитель обновится", "ничего"]
answer: "Vue предупредит: target is readonly"
check: exact
hint: Props readonly, поток данных односторонний.
```

```drill
type: multiple-choice
prompt: "<Toggle active=\"true\" /> — какой тип получит prop active?"
options: ["boolean true", "строка \"true\"", "undefined", "ошибка"]
answer: "строка \"true\""
check: exact
hint: "Без : передаётся строковый литерал. Нужно :active=\"true\"."
```

## События / v-model

```drill
type: free-form
prompt: "TodoItem должен сообщать родителю о переключении галочки с id. Напиши defineEmits и вызов."
answer: "const emit = defineEmits<{ toggle: [id: number] }>(); function onToggle(){ emit('toggle', props.id); } Родитель: <TodoItem @toggle=\"toggleTodo\" />."
check: manual
```

```drill
type: free-form
prompt: "Сделай компонент MyInput управляемым через v-model родителя (defineModel)."
answer: "const model = defineModel<string>(); шаблон: <input :value=\"model\" @input=\"model = ($event.target as HTMLInputElement).value\" />. Родитель: <MyInput v-model=\"search\" />."
check: manual
```

## Слоты

```drill
type: multiple-choice
prompt: "Нужно, чтобы родитель вставлял в кнопку произвольный контент (текст + иконку). Что использовать?"
options: ["prop label: string", "слот", "provide/inject", "v-model"]
answer: "слот"
check: exact
hint: Произвольная разметка внутрь — это слот, не данные-prop.
```

```drill
type: free-form
prompt: "В Card есть именованный слот title с fallback 'Без названия'. Напиши <slot> и как родитель заполнит его заголовком."
answer: "В Card: <slot name=\"title\">Без названия</slot>. Родитель: <template #title><h2>Профиль</h2></template>. Если родитель ничего не дал — покажется fallback."
check: manual
```

## provide/inject и lifecycle

```drill
type: multiple-choice
prompt: "Тему 'light'/'dark' нужно донести до глубоко вложенных компонентов без передачи prop через каждый уровень. Что взять?"
options: ["props через все уровни", "provide/inject", "глобальную переменную", "v-model"]
answer: "provide/inject"
check: exact
```

```drill
type: free-form
prompt: "В onMounted подписались на window resize. Что обязательно сделать и где?"
answer: "Отписаться в onUnmounted: onMounted(() => window.addEventListener('resize', h)); onUnmounted(() => window.removeEventListener('resize', h)). Иначе утечка (висящий листенер)."
check: manual
```

## Options API (чтение)

```drill
type: free-form
prompt: "Переведи на Composition API + script setup: export default { data(){ return { count: 0 } }, computed:{ doubled(){ return this.count*2 } }, methods:{ inc(){ this.count++ } } }."
answer: "const count = ref(0); const doubled = computed(() => count.value * 2); function inc(){ count.value++; } — data→ref, computed→computed, methods→функция, this.count→count.value."
check: manual
```

```drill
type: multiple-choice
prompt: "По каким признакам узнаёшь Options API в чужом коде?"
options: ["import { ref } from 'vue'", "export default { data(){}, methods:{} } и this. повсюду", "<script setup>", "defineProps<T>()"]
answer: "export default { data(){}, methods:{} } и this. повсюду"
check: exact
```

## $attrs, defineExpose, встроенные компоненты

```drill
type: free-form
prompt: "Компонент FieldInput рисует <label><span>{{ label }}</span><input></label>. Нужно, чтобы переданные placeholder/@blur попадали на input, а не на label. Что написать?"
answer: "defineOptions({ inheritAttrs: false }) в script setup и <input v-bind=\"$attrs\" /> в шаблоне — тогда непринятые атрибуты и слушатели уедут на input."
check: manual
```

```drill
type: multiple-choice
prompt: "Родитель получил ref на дочерний компонент и пытается вызвать child.open(). Что нужно в ребёнке?"
options: ["ничего, всё доступно", "defineExpose({ open })", "provide('open', open)", "emit('open')"]
answer: "defineExpose({ open })"
check: exact
hint: <script setup> закрыт по умолчанию.
```

```drill
type: multiple-choice
prompt: "Модальное окно обрезается родительским overflow: hidden. Что применить?"
options: ["z-index: 9999", "<Teleport to=\"body\">", "<KeepAlive>", "position: fixed на карточке"]
answer: "<Teleport to=\"body\">"
check: exact
```

```drill
type: free-form
prompt: "Нужно плавное появление/исчезновение блока по v-if. Напиши обёртку и минимальный CSS."
answer: "<Transition name=\"fade\"><p v-if=\"show\">…</p></Transition> плюс .fade-enter-active,.fade-leave-active{transition:opacity .2s} и .fade-enter-from,.fade-leave-to{opacity:0}."
check: manual
```

```drill
type: free-form
prompt: "При переключении вкладок форма теряет введённый текст. Как сохранить и какова цена решения?"
answer: "Обернуть переключаемый компонент в <KeepAlive> — он останется в памяти (вместо onUnmounted сработает onDeactivated). Цена: память и продолжающие жить подписки/таймеры невидимого компонента."
check: manual
```
