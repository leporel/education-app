---
id: vue.async-tooling-testing-project.theory
type: theory
title: "Async-данные, тулинг, тесты — теория"
tags: [vue, async, suspense, vite, vitest, testing, theory]
status: todo
updated: 2026-09-08
---

# Async-данные, тулинг, тесты

## Async-данные: три состояния, а не одно

Главная мысль про загрузку данных: **запрос — это не «есть данные / нет данных», а три
состояния одновременно** — `loading`, `error`, `data`. Новичок рисует только успешный
путь, а в проде пользователь видит белый экран при ошибке и «прыжок» при загрузке. Поэтому
каждый async-запрос моделируем тремя реактивными значениями:

```vue
<script setup lang="ts">
import { ref, onMounted } from "vue";

interface User { id: number; name: string; }

const data = ref<User | null>(null);
const error = ref<string | null>(null);
const loading = ref(false);

async function load(): Promise<void> {
  loading.value = true;
  error.value = null;
  try {
    const res = await fetch("/api/user/1");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);   // fetch НЕ кидает на 4xx/5xx сам
    data.value = (await res.json()) as User;
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Не удалось загрузить";
  } finally {
    loading.value = false;        // снять флаг и при успехе, и при ошибке
  }
}

onMounted(load);
</script>

<template>
  <p v-if="loading">Загрузка…</p>
  <p v-else-if="error" class="error">Ошибка: {{ error }}</p>
  <p v-else-if="data">Привет, {{ data.name }}</p>
</template>
```

Две ловушки прямо здесь:
- **`fetch` не бросает исключение на HTTP 404/500** — он реджектится только на сетевой
  сбой. Статус надо проверять руками (`if (!res.ok)`).
- **`finally` обязателен**: снять `loading` нужно в любом исходе, иначе спиннер зависнет
  навсегда при ошибке.

> **Go-параллель.** `try/catch` вокруг `await` — это аналог `if err != nil` после вызова.
> А `if (!res.ok) throw` — ровно как в Go проверка `resp.StatusCode`, потому что `http.Get`
> тоже не возвращает ошибку на 404. Привычка «проверь статус явно» переносится один в один.

Эту тройку `loading/error/data` логично вынести в composable `useFetch` (модуль 04) —
так не дублировать её в каждом компоненте. Этим и займёмся в уроке 01. В реальных проектах
часто берут готовые библиотеки данных (TanStack Query для Vue, VueUse `useFetch`), но
понимать ручную механику нужно.

### `Suspense` и `async setup` (коротко)

Vue умеет `<script setup>` с верхнеуровневым `await` — это **async-компонент**. Такой
компонент можно обернуть в `<Suspense>`, который покажет «запасную» разметку, пока внутри
идёт загрузка:

```vue
<Suspense>
  <UserProfile />                       <!-- внутри есть await на верхнем уровне -->
  <template #fallback>Загрузка…</template>
</Suspense>
```

Это снимает ручную возню с `loading`, но `Suspense` всё ещё помечен как
экспериментальный, и для ошибок всё равно нужен отдельный механизм (errorCaptured). Знай,
что он есть; в учебном капстоуне держимся явной тройки `loading/error/data` — она надёжна и
прозрачна.

## Формы и валидация (кратко)

Формы — это `v-model` (модуль 02) плюс валидация. Базовый подход без библиотек:

```vue
<script setup lang="ts">
import { ref, computed } from "vue";

const email = ref("");
const touched = ref(false);

// валидность — производное значение → computed
const emailError = computed(() => {
  if (!touched.value) return "";
  if (!email.value) return "Укажите email";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value)) return "Неверный формат";
  return "";
});

const isValid = computed(() => touched.value && emailError.value === "");
</script>

<template>
  <input v-model="email" @blur="touched = true" />
  <small v-if="emailError" class="error">{{ emailError }}</small>
  <button :disabled="!isValid">Отправить</button>
</template>
```

Принцип знакомый: **ошибки валидации — производные (`computed`) от полей**, а не отдельное
состояние, которое надо синхронизировать. И обязательно: **клиентская валидация — это UX,
сервер всё равно валидирует сам** (не доверяем клиенту — серверный принцип из общих
гайдлайнов). Для сложных форм берут библиотеки (VeeValidate, FormKit), но механика та же.

## Тулинг: что внутри `npm create vue@latest`

Команда `npm create vue@latest` ставит официальный шаблон на **Vite**. Что важно знать:

- **Vite** — dev-сервер и сборщик. В разработке он отдаёт модули через нативный ESM
  (мгновенный старт, HMR — горячая замена без перезагрузки). Для прода собирает
  оптимизированный бандл (через Rollup). Конфиг — `vite.config.ts`.
- **Скрипты** (`package.json`): `dev` (запустить дев-сервер), `build` (собрать прод),
  `preview` (посмотреть собранное локально). Их запускает пользователь (`npm run dev`).
- **Алиас `@`** указывает на `src/` (`import X from "@/components/X.vue"`) — настроен в
  `vite.config.ts` и `tsconfig`. Избавляет от `../../../`.
- **Переменные окружения** — файлы `.env`; переменные, видимые клиенту, должны начинаться с
  `VITE_` (`import.meta.env.VITE_API_URL`). Префикс — это явный «барьер»: остальное в бандл
  не попадёт. **Не клади секреты в `VITE_`-переменные** — всё, что попало в клиентский
  бандл, видно пользователю.

> **Параллель с Go.** Vite-сборка ≈ `go build`, но для фронтенда: на выходе — статические
> ассеты вместо бинаря. HMR не имеет прямого аналога в Go (там просто быстрая
> рекомпиляция). `VITE_`-префикс по духу как явный список того, что «экспортируется»
> наружу — всё остальное приватно.

### Проверка типов и линтинг: почему `tsc` тут мало

Важная деталь для человека, пришедшего из TS-домена: **`vite build` не проверяет типы**.
Vite (через esbuild) просто срезает аннотации ради скорости, ровно как `node app.ts` в
TS-домене. Плюс обычный `tsc` не умеет читать `.vue`-файлы. Поэтому в шаблоне `create-vue`
есть отдельный скрипт:

```bash
npm run type-check     # под капотом vue-tsc --build — проверка типов, включая шаблоны в .vue
npm run lint           # ESLint с плагином eslint-plugin-vue
npm run format         # Prettier
```

**`vue-tsc`** — это `tsc`, обученный понимать SFC: он проверяет и `<script>`, и выражения в
`<template>` (да, опечатка в `{{ user.nmae }}` ловится). **ESLint** с
`eslint-plugin-vue` ловит специфичные для Vue вещи, которых не видит компилятор: забытый
`:key` в `v-for`, мутацию props, неиспользуемые компоненты, `v-if` вместе с `v-for` на одном
элементе. Разделение обязанностей то же, что в TS-домене: **компилятор про типы, линтер про
паттерны, форматтер про пробелы**.

Практическая привычка: `npm run type-check && npm run lint` перед коммитом (или в CI) —
иначе сборка «зелёная», а в браузере `undefined`.

## Тестирование: Vitest + Vue Test Utils

- **Vitest** — тест-раннер (как Jest, но на Vite: использует тот же конфиг, быстрый,
  нативный ESM/TS). Если делал тесты в TS-домене на Vitest — здесь то же самое.
- **Vue Test Utils (VTU)** — официальная утилита для монтирования компонентов в тесте и
  взаимодействия с ними.

Базовый компонентный тест:

```ts
// TodoItem.test.ts
import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import TodoItem from "@/components/TodoItem.vue";

describe("TodoItem", () => {
  it("рендерит заголовок из props", () => {
    const wrapper = mount(TodoItem, {
      props: { id: 1, title: "Тест", done: false },
    });
    expect(wrapper.text()).toContain("Тест");
  });

  it("эмитит toggle с id по клику на чекбокс", async () => {
    const wrapper = mount(TodoItem, {
      props: { id: 42, title: "X", done: false },
    });
    await wrapper.find("input[type=checkbox]").trigger("change");   // await — дать Vue обновиться

    expect(wrapper.emitted("toggle")).toBeTruthy();
    expect(wrapper.emitted("toggle")![0]).toEqual([42]);            // payload первого вызова
  });
});
```

Ключевые приёмы VTU:
- `mount(Component, { props })` — отрисовать компонент с заданными props.
- `wrapper.text()` / `wrapper.find(selector)` / `wrapper.get(selector)` — найти и прочитать.
- `.trigger("click" | "change")`, `.setValue(...)` — сэмулировать взаимодействие.
- **`await`** перед/после взаимодействия — потому что обновления DOM во Vue асинхронны
  (микротаска `nextTick`); без `await` проверка может выполниться до перерисовки.
- `wrapper.emitted("event")` — проверить, что компонент эмитнул событие, и с какой нагрузкой.

**Что тестировать:** контракт компонента — отрендерил ли по props, эмитнул ли событие на
действие. Не тестируй внутренности (имена переменных). Сторы Pinia в тестах поднимают через
`createTestingPinia()`. Тесты — не «для галочки», а страховка контракта при рефакторинге
(этому учил TS-домен: типы + тесты = уверенность).

## Сборка и раздача

Что происходит по `npm run build`:

- Vite собирает всё в папку **`dist/`**: `index.html`, чанки JS (включая отдельные для
  lazy-маршрутов), CSS и ассеты с хэшами в именах (`app-8f3a2b.js`) — чтобы браузер
  кэшировал файлы навсегда, а новая сборка получала новое имя.
- **`npm run preview`** поднимает локальный статический сервер поверх `dist/` — проверить
  прод-сборку до деплоя (dev-сервер и прод-сборка ведут себя не идентично).
- Результат — **статические файлы**. Их раздаёт любой веб-сервер или CDN; бэкенд для этого
  не нужен. Единственное требование, о котором мы говорили в модуле 05: при
  `createWebHistory` сервер должен на **любой** путь отдавать `index.html` (иначе прямой
  заход на `/cart` даст 404).
- Если приложение живёт не в корне домена (`https://example.com/shop/`), это указывают в
  `base` в `vite.config.ts`.
- **Режимы окружения**: `.env`, `.env.development`, `.env.production`. Значения подставляются
  на этапе сборки, поэтому поменять `VITE_API_URL` без пересборки нельзя — это не рантайм-конфиг.

> **Go-параллель.** `npm run build` ≈ `go build`, только на выходе не бинарь, а папка со
> статикой; `npm run preview` ≈ запустить собранный бинарь локально перед выкладкой.

## Типичные ошибки и заблуждения

- **«`fetch` сам бросит ошибку на 404/500».** Нет, только на сетевой сбой. Проверяй
  `res.ok` руками.
- **«Достаточно показать данные».** Нужны три состояния: loading/error/data. `finally`
  обязателен, иначе спиннер зависнет.
- **«Ошибки валидации — отдельное состояние».** Это производные (`computed`) от полей.
  И клиентская валидация — UX; сервер валидирует независимо.
- **«В `VITE_`-переменные можно класть секреты».** Нет — всё в клиентском бандле видно
  пользователю. Префикс лишь помечает, что переменная попадёт в бандл.
- **«В тесте можно проверять сразу после клика».** Обновление DOM асинхронно — нужен
  `await` (`trigger`/`nextTick`), иначе проверяешь старое состояние.
- **«Тестируем внутренние переменные компонента».** Тестируй контракт: рендер по props и
  эмиссию событий, а не имена внутренних `ref`-ов.
- **«Если `npm run build` прошёл, типы в порядке».** Нет: Vite типы не проверяет. Нужен
  `npm run type-check` (`vue-tsc`), который умеет читать `.vue`, включая шаблоны.
- **«Линтер не нужен, есть типы».** ESLint с `eslint-plugin-vue` ловит забытый `:key`,
  мутацию props, `v-if` вместе с `v-for` — вещи, которые компилятор пропускает.
- **«`VITE_`-переменную можно поменять на сервере после сборки».** Нет, значения
  подставляются на этапе сборки; нужна новая сборка.

## Глоссарий модуля

- **`loading` / `error` / `data`** — три состояния любого запроса.
- **`Suspense` / async setup** — встроенный механизм заглушки на время загрузки
  (экспериментальный).
- **Vite** — dev-сервер и сборщик; **HMR** — горячая замена модулей.
- **`dist/`** — результат прод-сборки: статические файлы с хэшами в именах.
- **`base`** — префикс пути, если приложение размещено не в корне домена.
- **`import.meta.env.VITE_*`** — переменные окружения, попадающие в клиентский бандл
  (секретов там быть не должно).
- **`vue-tsc`** — проверка типов, понимающая `.vue` (шаблоны в том числе).
- **ESLint / `eslint-plugin-vue`** — линтер и его Vue-правила; **Prettier** — форматтер.
- **Vitest** — тест-раннер на инфраструктуре Vite.
- **Vue Test Utils (VTU)** — монтирование компонентов в тестах (`mount`, `find`, `trigger`,
  `emitted`).
- **`createTestingPinia`** — поднятие стора в тестах.

## См. также

- Vue Guide, *Suspense*: https://vuejs.org/guide/built-ins/suspense.html
- Vue Guide, *Tooling* (Vite, тесты): https://vuejs.org/guide/scaling-up/tooling.html
- Vite, *Env Variables*: https://vite.dev/guide/env-and-mode.html
- Vue Test Utils, *Guide*: https://test-utils.vuejs.org/guide/
- Vitest: https://vitest.dev/guide/
- Pinia testing (`createTestingPinia`): https://pinia.vuejs.org/cookbook/testing.html
- Уроки: [`lessons/01-async-data.md`](./lessons/01-async-data.md),
  [`lessons/02-capstone-and-test.md`](./lessons/02-capstone-and-test.md)
