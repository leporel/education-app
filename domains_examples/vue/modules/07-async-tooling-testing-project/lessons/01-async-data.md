---
id: vue.async-tooling-testing-project.lesson-01
type: lesson
title: "Урок 01 — useFetch: загрузка с состояниями и отменой гонок"
tags: [vue, async, composable, lesson]
status: todo
updated: 2026-06-26
---

# Урок 01 — useFetch: загрузка с состояниями и отменой гонок

Цель: собрать переиспользуемый composable `useFetch`, который инкапсулирует тройку
`loading/error/data`, корректно обрабатывает HTTP-статус и отменяет устаревшие запросы при
гонке. Это соединяет модуль 04 (composables) с async-механикой.

## Разогрев

- Почему `fetch` сам не падает на 404?
- Зачем `finally` при загрузке?
- Что делает `AbortController` при быстрой смене запроса?

## Шаг 1. Базовый useFetch

```ts
// useFetch.ts
import { ref, watchEffect, type Ref } from "vue";

interface UseFetchResult<T> {
  data: Ref<T | null>;
  error: Ref<string | null>;
  loading: Ref<boolean>;
}

// url — Ref или getter, чтобы пере-загружать при его изменении
export function useFetch<T>(url: Ref<string> | (() => string)): UseFetchResult<T> {
  const data = ref<T | null>(null) as Ref<T | null>;
  const error = ref<string | null>(null);
  const loading = ref(false);

  watchEffect((onCleanup) => {
    const currentUrl = typeof url === "function" ? url() : url.value;

    const controller = new AbortController();
    onCleanup(() => controller.abort());   // при смене url отменяем предыдущий запрос

    loading.value = true;
    error.value = null;

    fetch(currentUrl, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);   // статус проверяем сами
        data.value = (await res.json()) as T;
      })
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === "AbortError") return; // отмена — не ошибка
        error.value = e instanceof Error ? e.message : "Не удалось загрузить";
      })
      .finally(() => {
        loading.value = false;            // снимаем флаг в любом исходе
      });
  });

  return { data, error, loading };
}
```

Разбор того, что здесь работает на нас:
- `watchEffect` сам подписался на `url` (если это `ref`/getter) — сменился url, эффект
  перезапустился. Это удобнее ручного `watch`, потому что источник один.
- `onCleanup(() => controller.abort())` — перед каждым новым запуском отменяет предыдущий
  запрос. Это лечит гонку: переключаешь страницы быстрее, чем отвечает сеть, — старые
  ответы не перетрут свежий.
- Отмену (`AbortError`) мы **не** показываем как ошибку — это штатное поведение, не сбой.
- `finally` гарантированно снимает `loading`.

> Это «учебный» `useFetch`. В реальном проекте удобнее `useFetch` из VueUse или TanStack
> Query (кэш, ретраи, дедупликация), но под капотом — ровно эта механика, и понимать её ты
> теперь обязан.

## Шаг 2. Использование в компоненте

```vue
<!-- UserView.vue -->
<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useFetch } from "@/composables/useFetch";

interface User { id: number; name: string; email: string; }

const route = useRoute();
// url как getter от параметра — при /users/1 → /users/2 useFetch перезагрузит сам
const { data: user, error, loading } = useFetch<User>(
  () => `/api/users/${route.params.id}`,
);
</script>

<template>
  <p v-if="loading">Загрузка…</p>
  <p v-else-if="error" class="error">Ошибка: {{ error }}</p>
  <article v-else-if="user">
    <h1>{{ user.name }}</h1>
    <p>{{ user.email }}</p>
  </article>
</template>
```

Обрати внимание: проблему из модуля 05 (переход `/users/1` → `/users/2` не перезагружает
данные) мы решили автоматически — `useFetch` получил url как getter от `route.params.id`,
и `watchEffect` внутри сам реагирует на смену параметра. Один composable закрыл сразу
async-загрузку, состояния и реактивную перезагрузку.

## Шаг 3. Намеренно ошибёмся

```ts
// ❌ не проверили статус
fetch(url).then(async (res) => {
  data.value = await res.json();   // на 404 сервер вернёт HTML/ошибку — JSON.parse упадёт криво
});
```

```ts
// ❌ нет finally — loading не снимется при ошибке
fetch(url)
  .then(async (res) => { data.value = await res.json(); loading.value = false; })
  .catch((e) => { error.value = String(e); });  // здесь loading остался true навсегда
```

```ts
// ❌ нет отмены — гонка
// быстро переключили /users/1 → /users/2 → /users/3:
// три запроса в полёте, ответ от /1 пришёл последним и перетёр данные /3
```

## Mini-drill

```drill
type: free-form
prompt: "Почему отмену (AbortError) в catch не записывают в error.value?"
answer: "Отмена — это штатное поведение (мы сами отменили устаревший запрос через onCleanup), а не сбой загрузки. Показывать её как ошибку пользователю неверно — поэтому отдельной веткой выходим без записи в error."
check: manual
```

```drill
type: multiple-choice
prompt: "Почему url передают как getter (() => `/api/users/${route.params.id}`), а не строкой?"
options: ["так короче", "чтобы watchEffect внутри useFetch реагировал на изменение route.params и перезагружал данные", "иначе fetch не работает", "ради типизации"]
answer: "чтобы watchEffect внутри useFetch реагировал на изменение route.params и перезагружал данные"
check: exact
```

```drill
type: free-form
prompt: "Добавь в useFetch функцию refetch(), чтобы можно было перезагрузить вручную (например, по кнопке «обновить»). Идея реализации?"
answer: "Завести reloadKey = ref(0); внутри watchEffect прочитать reloadKey.value (чтобы эффект от него зависел); refetch = () => reloadKey.value++. Изменение ключа перезапустит watchEffect и запрос. Вернуть refetch из composable."
check: manual
```

## Итог

`useFetch` собрал воедино async-механику и реактивность: три состояния, явная проверка
статуса, `finally` и отмену гонок через `AbortController` + `onCleanup`. И, что приятно, он
автоматически перезагружается при смене реактивного url — закрыв граблину параметризованных
маршрутов из модуля 05. Дальше — финал: собираем мини-проект из всех модулей и пишем первый
компонентный тест.
