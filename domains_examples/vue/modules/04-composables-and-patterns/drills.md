---
id: vue.composables-and-patterns.drills
type: drills
title: "Composables и паттерны — упражнения"
tags: [vue, composables, watch, drills]
status: todo
updated: 2026-09-08
---

# Упражнения

## Composables

```drill
type: free-form
prompt: "Напиши composable useToggle(initial = false), возвращающий { state, toggle, setTrue, setFalse }."
answer: "export function useToggle(initial = false) { const state = ref(initial); const toggle = () => state.value = !state.value; const setTrue = () => state.value = true; const setFalse = () => state.value = false; return { state, toggle, setTrue, setFalse }; }"
check: manual
```

```drill
type: multiple-choice
prompt: "Два независимых виджета на странице используют useMouse() и неожиданно влияют друг на друга. Вероятная причина?"
options: ["ref объявлен внутри функции", "ref/состояние объявлено на уровне модуля (синглтон)", "забыли .value", "не хватает provide"]
answer: "ref/состояние объявлено на уровне модуля (синглтон)"
check: exact
hint: Модульный ref общий для всех вызовов.
```

```drill
type: free-form
prompt: "Почему const { count, inc } = useCounter() сохраняет реактивность, а const { count } = reactive({count:0}) — нет?"
answer: "useCounter отдаёт объект, где count — это Ref; деструктуризация копирует ссылку на ref (живую ячейку). reactive отдаёт proxy, и деструктуризация копирует ЗНАЧЕНИЕ свойства, теряя связь."
check: manual
```

## Template refs

```drill
type: free-form
prompt: "Сфокусируй <input ref=\"field\"> при монтировании компонента (Vue 3.5+)."
answer: "const inputRef = useTemplateRef<HTMLInputElement>('field'); onMounted(() => inputRef.value?.focus()); — до onMounted элемента нет (null), поэтому ?."
check: manual
```

```drill
type: multiple-choice
prompt: "Что из этого — НЕ повод для template ref?"
options: ["сфокусировать input", "измерить размер элемента", "переключить класс по состоянию", "инициализировать стороннюю JS-библиотеку на элементе"]
answer: "переключить класс по состоянию"
check: exact
hint: Класс по состоянию делается декларативно через :class.
```

## Watchers

```drill
type: free-form
prompt: "watch(filters, refetch) не реагирует на изменение filters.value.tag, хотя filters — ref({tag,sort}). Что добавить?"
answer: "Если следишь через getter () => filters.value, добавь { deep: true }. На самом ref(object) watch глубокий по умолчанию; deep нужен для getter, возвращающего объект. Также { immediate: true } если нужно выполнить сразу."
check: manual
```

```drill
type: multiple-choice
prompt: "Поиск шлёт запрос на каждое изменение query, ответы приходят вразнобой и перетирают свежий. Решение?"
options: ["убрать watch", "onCleanup с AbortController для отмены устаревшего запроса", "deep: true", "перенести в computed"]
answer: "onCleanup с AbortController для отмены устаревшего запроса"
check: exact
```

## Паттерны

```drill
type: multiple-choice
prompt: "Нужно общее состояние корзины с действиями (add/remove), видимое в devtools и типобезопасное. Что выбрать?"
options: ["composable с ref на уровне модуля", "provide/inject", "стор (Pinia)", "template ref"]
answer: "стор (Pinia)"
check: exact
hint: Для серьёзного общего состояния — явный стор, не модульный синглтон.
```

```drill
type: free-form
prompt: "Тебе нужно переиспользовать логику «загрузить данные с loading/error» в трёх компонентах. Какой инструмент и почему не миксин?"
answer: "Composable (напр. useFetch): вызывается явно, результат именуешь сам, конфликты разводятся переименованием. Миксин подмешивает поля неявно и конфликтует именами — легаси."
check: manual
```

## Правило вызова и дизайн API

```drill
type: free-form
prompt: "В компоненте написано: const data = await loadUser(); const { x, y } = useMouse(); — почему координаты не обновляются?"
answer: "useMouse вызван после await: активного экземпляра компонента уже нет, и onMounted внутри composable не привязался — подписка на mousemove не создалась. Вызывать все useX синхронно, до любого await."
check: manual
```

```drill
type: multiple-choice
prompt: "Где допустимо вызывать composable с lifecycle-хуками внутри?"
options: ["в обработчике клика", "после await в setup", "синхронно на верхнем уровне script setup", "в любом месте"]
answer: "синхронно на верхнем уровне script setup"
check: exact
```

```drill
type: free-form
prompt: "Как отдать из composable состояние так, чтобы менять его можно было только через предоставленную функцию inc()?"
answer: "return { count: readonly(count), inc } — наружу уезжает версия только для чтения, запись возможна лишь внутри composable через inc()."
check: manual
```
