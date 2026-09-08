---
id: vue.sfc-templates-styling.lesson-01
type: lesson
title: "Урок 01 — Список дел: шаблон целиком"
tags: [vue, template, v-for, v-model, lesson]
status: todo
updated: 2026-06-26
---

# Урок 01 — Список дел: шаблон целиком

Цель: собрать один самодостаточный SFC, в котором встречаются почти все директивы —
`v-model`, `v-for` + `:key`, `v-if`, `@click`, `:class`, `:disabled` — и scoped-стили.
Это «список дел», классика, на которой видно весь язык шаблонов сразу.

## Разогрев

- Чем `:key` важен в `v-for`?
- Где `{{ }}`, а где `:`?
- Как `v-model` связывает `<input>` с состоянием?

## Шаг 1. Состояние

```vue
<script setup lang="ts">
import { ref, computed } from "vue";

interface Todo {
  id: number;
  title: string;
  done: boolean;
}

const todos = ref<Todo[]>([
  { id: 1, title: "Выучить директивы", done: true },
  { id: 2, title: "Собрать список дел", done: false },
]);

const draft = ref("");                       // текст нового пункта (для v-model)
let nextId = 3;                              // id генерируем на стороне «приложения»

const remaining = computed(() => todos.value.filter((t) => !t.done).length);
</script>
```

`id` мы генерируем сами и никогда не берём из пользовательского ввода — он нужен как
стабильный `:key`. (Принцип «id рождается на стороне приложения, не из данных клиента» —
ровно то, чему учат серверные гайдлайны; тут «сервер» — наша логика.)

## Шаг 2. Методы

```vue
<script setup lang="ts">
// ...продолжение
function addTodo(): void {
  const title = draft.value.trim();
  if (!title) return;                        // не добавляем пустые
  todos.value.push({ id: nextId++, title, done: false });
  draft.value = "";                          // очищаем поле ввода
}

function removeTodo(id: number): void {
  todos.value = todos.value.filter((t) => t.id !== id);
}
</script>
```

## Шаг 3. Шаблон

```vue
<template>
  <section class="todo">
    <h1>Дела <small>({{ remaining }} осталось)</small></h1>

    <!-- ввод: v-model связывает draft, Enter/кнопка добавляют -->
    <form class="add" @submit.prevent="addTodo">
      <input v-model="draft" placeholder="Что нужно сделать?" />
      <button type="submit" :disabled="!draft.trim()">Добавить</button>
    </form>

    <!-- пустое состояние -->
    <p v-if="todos.length === 0" class="empty">Список пуст. Добавь первое дело.</p>

    <!-- список: :key — стабильный id, не индекс -->
    <ul v-else>
      <li
        v-for="todo in todos"
        :key="todo.id"
        :class="{ done: todo.done }"
      >
        <label>
          <input type="checkbox" v-model="todo.done" />
          {{ todo.title }}
        </label>
        <button class="del" @click="removeTodo(todo.id)">✕</button>
      </li>
    </ul>
  </section>
</template>
```

Что здесь работает:
- `@submit.prevent="addTodo"` — отправка формы без перезагрузки страницы.
- `:disabled="!draft.trim()"` — кнопка заблокирована, пока поле пустое; чистая привязка к
  состоянию, без ручного включения/выключения.
- `v-if="todos.length === 0"` / `v-else` — пустое состояние против списка.
- `v-model="todo.done"` прямо на чекбоксе внутри `v-for` — связывает галочку с полем
  объекта (объект реактивен, потому что лежит в `todos`-ref-е).
- `:class="{ done: todo.done }"` — зачёркнутый стиль выполненного пункта.

## Шаг 4. Стили (scoped)

```vue
<style scoped>
.todo { max-width: 28rem; }
.add { display: flex; gap: 0.5rem; }
.empty { color: #888; }
li { display: flex; justify-content: space-between; align-items: center; }
li.done label { text-decoration: line-through; color: #999; }
.del { border: none; background: none; cursor: pointer; }
</style>
```

`scoped` гарантирует, что `li`, `.del` и прочие не зацепят `li` в других компонентах
страницы. Без `scoped` твой `li { display: flex }` мог бы внезапно растечься на чужой
список.

## Шаг 5. Намеренно ошибёмся

```vue
<!-- ❌ :key по индексу -->
<li v-for="(todo, i) in todos" :key="i">…</li>
```

Удали верхний пункт — и галочки «съедут»: Vue переиспользует DOM по индексу, а индексы
сдвинулись. Состояние чекбоксов привяжется не к тем пунктам. Лечение — `:key="todo.id"`.

```vue
<!-- ❌ забыли : -->
<button disabled="!draft.trim()">…</button>
```

Без `:` это строковый литерал `"!draft.trim()"` — а непустая строка делает кнопку
**всегда** заблокированной. Нужно `:disabled="..."`.

## Mini-drill

```drill
type: free-form
prompt: "Добавь фильтр «показывать только невыполненные»: ref showActiveOnly:boolean и computed visibleTodos. Как изменится <ul>?"
answer: "const showActiveOnly = ref(false); const visibleTodos = computed(() => showActiveOnly.value ? todos.value.filter(t => !t.done) : todos.value); В шаблоне v-for=\"todo in visibleTodos\". :key всё так же todo.id."
check: manual
hint: Фильтрация — производное значение, значит computed, а не отдельный ref.
```

```drill
type: multiple-choice
prompt: "Почему счётчик remaining лучше как computed, а не ref, который мы обновляем в addTodo/removeTodo/при клике?"
options: ["computed быстрее всегда", "иначе придётся вручную синхронизировать счётчик во всех местах и легко рассинхронить", "ref нельзя считать", "разницы нет"]
answer: "иначе придётся вручную синхронизировать счётчик во всех местах и легко рассинхронить"
check: exact
```

## Итог

В одном файле ты задействовал почти весь язык шаблонов: ввод через `v-model`, список через
`v-for` + стабильный `:key`, ветвление `v-if`/`v-else`, события с `.prevent`, привязки
`:disabled`/`:class`, и изолировал оформление через `scoped`. Этот «список дел» —
скелет, на который дальше нарастает всё остальное: вынесем пункт в отдельный компонент с
props и событиями (модуль 03), затем поднимем состояние в стор (модуль 06).
