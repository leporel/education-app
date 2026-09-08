---
id: vue.components-props-events-slots.lesson-01
type: lesson
title: "Урок 01 — Выносим пункт списка в компонент"
tags: [vue, props, emits, lesson]
status: todo
updated: 2026-06-26
---

# Урок 01 — Выносим пункт списка в компонент

Цель: взять «список дел» из модуля 02 и вынести один пункт в отдельный компонент
`TodoItem.vue` с типизированными props и событиями. Прожить one-way data flow на практике:
данные вниз через props, изменения наверх через emit.

## Разогрев

- Почему ребёнок не может сам поменять `done`, если `done` пришёл через prop?
- Как ребёнок «просит» родителя изменить данные?

## Шаг 1. Дочерний компонент `TodoItem.vue`

```vue
<script setup lang="ts">
interface Props {
  id: number;
  title: string;
  done: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  toggle: [id: number];
  remove: [id: number];
}>();
</script>

<template>
  <li :class="{ done }">
    <label>
      <!-- НЕ мутируем props.done напрямую — просим родителя через событие -->
      <input type="checkbox" :checked="done" @change="emit('toggle', id)" />
      {{ title }}
    </label>
    <button class="del" @click="emit('remove', id)">✕</button>
  </li>
</template>

<style scoped>
li { display: flex; justify-content: space-between; align-items: center; }
li.done label { text-decoration: line-through; color: #999; }
.del { border: none; background: none; cursor: pointer; }
</style>
```

Ключевой момент: чекбокс здесь **не** `v-model="done"` (это была бы попытка писать в prop).
Вместо этого `:checked="done"` (читаем) + `@change="emit('toggle', id)"` (просим родителя
переключить). Данные остаются под контролем родителя — единственного источника истины.

## Шаг 2. Родитель `TodoList.vue`

```vue
<script setup lang="ts">
import { ref, computed } from "vue";
import TodoItem from "./TodoItem.vue";

interface Todo { id: number; title: string; done: boolean; }

const todos = ref<Todo[]>([
  { id: 1, title: "Понять props", done: true },
  { id: 2, title: "Понять emits", done: false },
]);

const remaining = computed(() => todos.value.filter((t) => !t.done).length);

function toggle(id: number): void {
  const todo = todos.value.find((t) => t.id === id);
  if (todo) todo.done = !todo.done;       // менять данные — право родителя
}

function remove(id: number): void {
  todos.value = todos.value.filter((t) => t.id !== id);
}
</script>

<template>
  <section class="todo">
    <h1>Дела <small>({{ remaining }} осталось)</small></h1>
    <ul>
      <TodoItem
        v-for="todo in todos"
        :key="todo.id"
        :id="todo.id"
        :title="todo.title"
        :done="todo.done"
        @toggle="toggle"
        @remove="remove"
      />
    </ul>
  </section>
</template>
```

Прочувствуй контур данных:
1. Родитель отдаёт каждому `TodoItem` его `id`/`title`/`done` через props (**вниз**).
2. Пользователь кликает чекбокс в ребёнке.
3. Ребёнок не меняет данные — он эмитит `toggle` с `id` (**наверх**).
4. Родитель ловит `@toggle="toggle"` и меняет свой `todos` — единственный владелец данных.
5. Реактивность перерисовывает `TodoItem` с новым `done`.

Цикл замкнулся, и в любой момент очевидно, **кто** владеет состоянием.

## Шаг 3. Намеренно ошибёмся

```vue
<!-- ❌ в TodoItem.vue -->
<input type="checkbox" v-model="done" />
```

`v-model="done"` пытается **писать** в prop. Vue выдаст warning «Set operation on key
'done' failed: target is readonly», а галочка будет вести себя непредсказуемо. Правильно —
`:checked` + `@change="emit('toggle', id)"`.

```vue
<!-- ❌ забыли : у id и done -->
<TodoItem :key="todo.id" id="todo.id" done="todo.done" ... />
```

Без `:` в ребёнка уедут строки `"todo.id"` и `"todo.done"` (а непустая строка
truthy — пункт всегда «выполнен»). Нужно `:id` и `:done`.

## Mini-drill

```drill
type: free-form
prompt: "Добавь в TodoItem возможность редактировать title: компонент эмитит rename с (id, newTitle). Объяви событие и эмить его по @change поля ввода."
answer: "defineEmits<{ rename: [id: number, title: string] }>(); в шаблоне input: @change=\"emit('rename', id, ($event.target as HTMLInputElement).value)\". Родитель ловит @rename и обновляет нужный todo."
check: manual
hint: "Опять: ребёнок не меняет title сам, а просит родителя через событие с payload."
```

```drill
type: multiple-choice
prompt: "Почему toggle реализован в родителе, а не в TodoItem?"
options: ["так короче", "родитель владеет массивом todos (источник истины), ребёнок лишь отображает свой done и просит изменить", "Vue запрещает функции в дочерних компонентах", "из-за scoped-стилей"]
answer: "родитель владеет массивом todos (источник истины), ребёнок лишь отображает свой done и просит изменить"
check: exact
```

## Итог

Ты разделил один большой SFC на родителя-владельца данных и переиспользуемый
`TodoItem` с чистым контрактом: props вниз, события наверх. Главная мышца, которую качаем:
**ребёнок никогда не мутирует props — он сообщает наружу, а данные меняет их владелец.**
Это делает поток данных предсказуемым на любом масштабе дерева. Дальше — слоты и
provide/inject: композиция по разметке и сквозной контекст.
