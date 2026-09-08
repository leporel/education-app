---
id: vue.reactivity-and-mental-model.drills
type: drills
title: "Реактивность и ментальная модель — упражнения"
tags: [vue, reactivity, drills]
status: todo
updated: 2026-09-08
---

# Упражнения

## ref / reactive

```drill
type: free-form
prompt: "Создай реактивный счётчик и реактивный объект пользователя { name, age }. Покажи, как увеличить счётчик и сменить имя — с правильным доступом."
answer: "const count = ref(0); const user = reactive({ name: 'Ann', age: 30 }); count.value++; user.name = 'Bob'; — у ref доступ через .value, у reactive напрямую."
check: manual
hint: ref → .value, reactive → прямое свойство.
```

```drill
type: multiple-choice
prompt: "Какой вызов НЕ сработает (не даст реактивности)?"
options: ["ref(0)", "ref({ a: 1 })", "reactive({ a: 1 })", "reactive(5)"]
answer: "reactive(5)"
check: exact
hint: reactive оборачивает только объекты/массивы/Map/Set, оборачивать примитив нечем.
```

```drill
type: free-form
prompt: "Дано const state = reactive({ count: 0 }); const { count } = state; count++. Почему UI не обновится и как починить, сохранив деструктуризацию?"
answer: "Деструктуризация скопировала значение 0, связь с proxy потеряна. Починка: const { count } = toRefs(state); затем count.value++."
check: manual
```

## .value

```drill
type: multiple-choice
prompt: "const n = ref(5). Где НЕ нужно писать .value?"
options: ["в выражении n + 1 внутри <script>", "при чтении в <template> ({{ n }})", "при присваивании n.value = 10", "везде нужно"]
answer: "при чтении в <template> ({{ n }})"
check: exact
hint: Vue разворачивает ref-ы верхнего уровня в шаблоне сам.
```

## computed vs функция/watch

```drill
type: free-form
prompt: "price=ref(100), qty=ref(2). Опиши total как производное значение так, чтобы оно кэшировалось и пересчитывалось при изменении price/qty."
answer: "const total = computed(() => price.value * qty.value); — computed кэширует и пересчитывается только при изменении зависимостей."
check: manual
```

```drill
type: multiple-choice
prompt: "Нужно при смене userId сходить за данными по сети. Что взять?"
options: ["computed", "watch(userId, fetchUser)", "обычную функцию", "reactive"]
answer: "watch(userId, fetchUser)"
check: exact
hint: Сетевой запрос — побочный эффект, не вывод значения.
```

```drill
type: free-form
prompt: "Перепиши на computed: const full = ref(''); watch([first, last], () => { full.value = first.value + ' ' + last.value })."
answer: "const full = computed(() => `${first.value} ${last.value}`); — убрали лишний ref и watch, значение выводится и кэшируется."
check: manual
```

## Модель и грабли

```drill
type: multiple-choice
prompt: "Почему чтение ref внутри setTimeout(() => x.value, 1000) может не создать подписку в watchEffect?"
options: ["ref внутри таймера не работает", "подписка (track) собирается синхронно, а к моменту таймера активного эффекта уже нет", "setTimeout запрещён во Vue", "нужно reactive вместо ref"]
answer: "подписка (track) собирается синхронно, а к моменту таймера активного эффекта уже нет"
check: exact
```

```drill
type: free-form
prompt: "Go-разработчик ждёт, что тяжёлый цикл в watchEffect выполнится в фоне и не затронет UI. Почему он ошибается?"
answer: "JS однопоточный: эффект выполняется в том же UI-потоке. Тяжёлая синхронная работа блокирует интерфейс. Реактивность — про синхронизацию состояния и экрана, не про параллелизм. Тяжёлое выносят в async/Web Worker."
check: manual
```

## Рендеринг и nextTick

```drill
type: free-form
prompt: "Объясни своими словами цепочку от изменения ref до изменения пикселей на экране."
answer: "Запись в ref уведомляет подписанные эффекты (в т.ч. рендер компонента) → render-функция строит новый Virtual DOM → Vue сравнивает его с предыдущим → применяет к реальному DOM только различия → браузер перерисовывает изменившийся кусок."
check: manual
```

```drill
type: multiple-choice
prompt: "count.value = 1; count.value = 2; count.value = 3; — сколько раз перерисуется компонент?"
options: ["три", "два", "один, с итоговым значением 3", "ноль"]
answer: "один, с итоговым значением 3"
check: exact
hint: Обновления батчатся и применяются в микрозадаче.
```

```drill
type: free-form
prompt: "showInput.value = true; inputRef.value?.focus() — фокус не срабатывает. Почему и как починить?"
answer: "DOM ещё не обновлён (обновления асинхронны), элемента нет — inputRef.value === null. Починка: await nextTick() перед focus()."
check: manual
```

```drill
type: multiple-choice
prompt: "В ref лежит большой массив строк таблицы, который целиком заменяется ответом сервера. Что уместнее?"
options: ["reactive", "shallowRef", "computed", "watchEffect"]
answer: "shallowRef"
check: exact
hint: Глубокое отслеживание содержимого тут не нужно и стоит ресурсов.
```

```drill
type: free-form
prompt: "Vapor Mode (Vue 3.6) убирает Virtual DOM. Придётся ли переучивать ref/computed/watch и почему?"
answer: "Нет. Меняется только то, во что компилируется шаблон (точечные обновления DOM вместо сравнения виртуальных деревьев). Реактивное API остаётся тем же."
check: manual
```
