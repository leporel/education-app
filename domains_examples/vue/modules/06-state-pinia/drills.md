---
id: vue.state-pinia.drills
type: drills
title: "Общее состояние (Pinia) — упражнения"
tags: [vue, pinia, drills]
status: todo
updated: 2026-09-08
---

# Упражнения

## Структура стора

```drill
type: free-form
prompt: "Напиши setup-стор useUserStore: state name:string='', getter isLoggedIn (name непустой), action setName(n)."
answer: "export const useUserStore = defineStore('user', () => { const name = ref(''); const isLoggedIn = computed(() => name.value.length > 0); function setName(n: string){ name.value = n; } return { name, isLoggedIn, setName }; });"
check: manual
```

```drill
type: multiple-choice
prompt: "В setup-сторе getter — это…?"
options: ["ref", "computed", "watch", "обычная функция"]
answer: "computed"
check: exact
hint: state→ref, getter→computed, action→функция.
```

```drill
type: free-form
prompt: "Перечисли соответствие state/getters/actions примитивам Composition API."
answer: "state → ref/reactive; getters → computed; actions → обычные функции (можно async)."
check: manual
```

## Использование

```drill
type: multiple-choice
prompt: "const { count } = useCounterStore(). Что не так?"
options: ["ничего", "потеряется реактивность — нужен storeToRefs для state/getters", "count нельзя читать", "нужен provide"]
answer: "потеряется реактивность — нужен storeToRefs для state/getters"
check: exact
```

```drill
type: free-form
prompt: "Достань из стора реактивные count и doubled и действие increment правильным образом."
answer: "const store = useCounterStore(); const { count, doubled } = storeToRefs(store); const { increment } = store; — state/getters через storeToRefs, actions прямо со стора."
check: manual
```

```drill
type: multiple-choice
prompt: "Нужно ли оборачивать action increment в storeToRefs?"
options: ["да, всегда", "нет — это функция, не состояние; берётся прямо со стора", "только если async", "только в options-сторе"]
answer: "нет — это функция, не состояние; берётся прямо со стора"
check: exact
```

## Решение «стор или нет»

```drill
type: multiple-choice
prompt: "Состояние открыт/закрыт у одного дропдауна. Где держать?"
options: ["Pinia-стор", "ref в самом компоненте", "provide/inject", "глобальный синглтон"]
answer: "ref в самом компоненте"
check: exact
hint: Локальное состояние не поднимают в глобальный стор.
```

```drill
type: free-form
prompt: "Почему корзину магазина логично держать в Pinia, а не в provide/inject?"
answer: "Корзина нужна несвязанным частям приложения (шапка-счётчик, каталог, оформление, guard) — это сквозное состояние. Pinia даёт одно место истины, типизацию, devtools и действия. provide/inject — для контекста поддерева, связи неявные."
check: manual
```

## Служебный API и подводные камни

```drill
type: multiple-choice
prompt: "В router/index.ts на верхнем уровне вызвали const auth = useAuthStore(). Что произойдёт?"
options: ["всё работает", "ошибка: активной Pinia ещё нет (модуль выполняется до app.use(createPinia()))", "стор создастся пустым", "guard не сработает молча"]
answer: "ошибка: активной Pinia ещё нет (модуль выполняется до app.use(createPinia()))"
check: exact
hint: "Вызывать стор нужно внутри guard-функции."
```

```drill
type: free-form
prompt: "Нужно одной операцией выставить promoCode и обнулить deliveryCents. Как это сделать и зачем именно так?"
answer: "cart.$patch({ promoCode: 'SALE', deliveryCents: 0 }) — атомарное изменение нескольких полей, в devtools это один шаг вместо нескольких отдельных записей."
check: manual
```

```drill
type: free-form
prompt: "Как реализовать сброс корзины в setup-сторе и почему нельзя просто позвать $reset()?"
answer: "Написать свой action: function reset() { lines.value = []; } и вернуть его. $reset() из коробки работает только в options-сторах — в setup-сторе Pinia не знает начального состояния."
check: manual
```

```drill
type: multiple-choice
prompt: "Корзину нужно сохранять между перезагрузками страницы. Что использовать?"
options: ["computed", "$subscribe с записью в localStorage (или плагин персиста)", "provide/inject", "storeToRefs"]
answer: "$subscribe с записью в localStorage (или плагин персиста)"
check: exact
```
