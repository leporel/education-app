---
id: vue.async-tooling-testing-project.drills
type: drills
title: "Async, тулинг, тесты — упражнения"
tags: [vue, async, vite, vitest, drills]
status: todo
updated: 2026-09-08
---

# Упражнения

## Async-данные

```drill
type: multiple-choice
prompt: "fetch('/api/x') вернул 404. Что произойдёт с await fetch(...)?"
options: ["промис реджектнется (попадём в catch)", "промис зарезолвится, res.ok === false", "вернётся null", "бросит синхронно"]
answer: "промис зарезолвится, res.ok === false"
check: exact
hint: fetch реджектится только на сетевой сбой; статус проверяй сам.
```

```drill
type: free-form
prompt: "Напиши скелет загрузки с тремя состояниями loading/error/data и правильной обработкой статуса и finally."
answer: "loading.value=true; error.value=null; try { const res = await fetch(url); if(!res.ok) throw new Error(`HTTP ${res.status}`); data.value = await res.json(); } catch(e){ error.value = e instanceof Error ? e.message : 'Ошибка'; } finally { loading.value=false; }"
check: manual
```

```drill
type: multiple-choice
prompt: "Спиннер иногда крутится вечно после неудачного запроса. Чего не хватает?"
options: ["await", "снятия loading в finally", "Suspense", "storeToRefs"]
answer: "снятия loading в finally"
check: exact
```

## Формы

```drill
type: free-form
prompt: "Поле email обязательно и должно быть валидным. Как выразить emailError и почему через computed?"
answer: "const emailError = computed(() => { if(!email.value) return 'Укажите email'; if(!/.../.test(email.value)) return 'Неверный формат'; return ''; }); — ошибка это производное от поля, computed избавляет от ручной синхронизации. И сервер всё равно валидирует независимо."
check: manual
```

## Тулинг

```drill
type: multiple-choice
prompt: "Куда НЕЛЬЗЯ класть секретный API-ключ во фронтенд-проекте на Vite?"
options: ["в серверный код за API", "в VITE_API_KEY (.env)", "никуда в клиент", "в переменную окружения сервера"]
answer: "в VITE_API_KEY (.env)"
check: exact
hint: VITE_-переменные попадают в клиентский бандл — видны пользователю.
```

```drill
type: free-form
prompt: "Что делают npm-скрипты dev, build, preview в проекте на Vite?"
answer: "dev — дев-сервер с HMR (разработка); build — оптимизированный прод-бандл; preview — локальный просмотр уже собранного бандла."
check: manual
```

## Тестирование

```drill
type: free-form
prompt: "Напиши тест: TodoItem с props { id:42, title:'X', done:false } по клику на чекбокс эмитит toggle с [42]."
answer: "const wrapper = mount(TodoItem, { props: { id: 42, title: 'X', done: false } }); await wrapper.find('input[type=checkbox]').trigger('change'); expect(wrapper.emitted('toggle')![0]).toEqual([42]);"
check: manual
```

```drill
type: multiple-choice
prompt: "Тест кликает кнопку и сразу проверяет текст — иногда падает. Причина?"
options: ["mount сломан", "обновление DOM асинхронно — нужен await trigger/nextTick перед проверкой", "props не переданы", "нужен Pinia"]
answer: "обновление DOM асинхронно — нужен await trigger/nextTick перед проверкой"
check: exact
```

```drill
type: multiple-choice
prompt: "Что из перечисленного — ПЛОХОЙ объект тестирования компонента?"
options: ["рендер текста по props", "эмиссия события по клику", "имя внутренней ref-переменной", "disabled у кнопки при невалидной форме"]
answer: "имя внутренней ref-переменной"
check: exact
hint: Тестируй контракт, не реализацию.
```

## Проверка типов, линтинг, сборка

```drill
type: multiple-choice
prompt: "npm run build прошёл успешно, но в браузере undefined из-за опечатки в имени поля. Какой команды не хватало?"
options: ["npm run preview", "npm run type-check (vue-tsc)", "npm run dev", "npm install"]
answer: "npm run type-check (vue-tsc)"
check: exact
hint: "Vite типы не проверяет, а обычный tsc не читает .vue."
```

```drill
type: free-form
prompt: "Назови две проблемы, которые поймает eslint-plugin-vue, но не поймает компилятор типов."
answer: "Например: забытый :key в v-for и мутация props внутри компонента (а также v-if вместе с v-for на одном элементе, неиспользуемые компоненты). Это паттерны, а не ошибки типов."
check: manual
```

```drill
type: free-form
prompt: "Что лежит в dist/ после сборки и какое требование к серверу нужно помнить при createWebHistory?"
answer: "index.html, JS-чанки (включая отдельные для lazy-маршрутов), CSS и ассеты с хэшами в именах. Сервер должен отдавать index.html на любой путь, иначе прямой заход на /cart даст 404."
check: manual
```

```drill
type: multiple-choice
prompt: "Нужно поменять адрес API в задеплоенном приложении. Достаточно ли отредактировать .env на сервере?"
options: ["да", "нет — VITE_-переменные вшиваются на этапе сборки, нужна пересборка", "да, после перезапуска сервера", "да, если это .env.production"]
answer: "нет — VITE_-переменные вшиваются на этапе сборки, нужна пересборка"
check: exact
```
