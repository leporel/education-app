---
id: typescript.modules-tooling-project.cards
type: cards
title: "Модули, тулинг и проект — карточки"
tags: [typescript, modules, tooling, cards]
status: todo
updated: 2026-09-08
---

# Карточки

## Модули

```card
front: ESM vs CommonJS — что писать сегодня?
back: Писать ESM (import/export — стандарт языка, работает в браузере и Node). CommonJS (require/module.exports) — наследие Node, узнавать в старом коде.
tags: [ts, modules]
```

```card
front: Чем import "./utils" отличается от import "lodash"?
back: "\"./utils\" — относительный путь к своему файлу. \"lodash\" (без ./) — пакет из node_modules."
tags: [ts, modules]
```

```card
front: Почему ESM-импорты называют статичными и что это даёт?
back: Их расположение известно до запуска (вверху файла), поэтому инструменты анализируют зависимости и выкидывают неиспользуемое (tree shaking).
tags: [ts, modules]
```

## npm и package.json

```card
front: Чем dependencies отличается от devDependencies?
back: dependencies нужны в рантайме (идут в прод). devDependencies — только при разработке (компилятор, линтер, тесты), в прод не идут.
tags: [ts, npm]
```

```card
front: "Что значит \"type\": \"module\" в package.json?"
back: Говорит Node, что .js-файлы проекта — это ESM (а не CommonJS). Для современного проекта ставить.
tags: [ts, npm]
```

```card
front: Semver MAJOR.MINOR.PATCH — что значит каждая часть?
back: PATCH — багфиксы (совместимо), MINOR — новые фичи (совместимо), MAJOR — ломающие изменения.
tags: [ts, semver]
```

```card
front: Что разрешает ^3.23.8 vs ~3.23.8 vs 3.23.8?
back: ^ — minor+patch (3.x.x), ~ — только patch (3.23.x), без префикса — точная версия. Для воспроизводимости часто фиксируют точную.
tags: [ts, semver]
```

```card
front: Зачем нужен package-lock.json и надо ли его коммитить?
back: Фиксирует точные версии всего дерева зависимостей (воспроизводимость, аналог go.sum). Коммитить обязательно, руками не редактировать.
tags: [ts, npm, lock]
```

## Тулинг

```card
front: Зачем ESLint, если есть компилятор TS?
back: Компилятор проверяет типы; линтер — стиль и подозрительные паттерны (floating promises, неиспользуемые переменные, ==, any). Дополняют друг друга.
tags: [ts, eslint]
```

```card
front: Зачем нужен бандлер (Vite) и когда он НЕ нужен?
back: Собирает много модулей в оптимизированные файлы для браузера (транспиляция, tree shaking, минификация) — фронтенду нужен. Backend/CLI на Node часто обходится без сборки.
tags: [ts, bundler]
```

```card
front: Что делать, если у JS-пакета нет типов?
back: Часто есть отдельный пакет @types/имя из DefinitelyTyped (npm i -D @types/lodash). .d.ts — файл объявлений (типы без реализации). В крайнем случае — ручное объявление.
tags: [ts, types, dts]
```

```card
front: Что такое .d.ts файл?
back: "Файл объявлений: описание типов API без реализации (аналог заголовочного файла). Говорит TS, как выглядит библиотека."
tags: [ts, dts]
```

## node_modules, npx, тесты

```card
front: "Что коммитить, а что нет: package.json, package-lock.json, node_modules?"
back: Коммитить package.json и package-lock.json. node_modules — никогда (в .gitignore), она восстанавливается через npm install / npm ci.
tags: [ts, npm]
```

```card
front: Что делает npx tsc и почему инструменты ставят локально?
back: Запускает tsc из node_modules этого проекта. Локальная установка гарантирует всем участникам одну версию инструмента; глобальная — источник расхождений.
tags: [ts, npm, npx]
```

```card
front: Чем npm ci отличается от npm install?
back: npm ci ставит строго по lock-файлу, не обновляя версии и не трогая package.json — предсказуемая установка для CI.
tags: [ts, npm, ci]
```

```card
front: Какие два раннера тестов актуальны и когда какой брать?
back: Встроенный node:test (node --test) — для чистого Node-кода, ничего ставить не надо. Vitest — когда проект на Vite/Vue (быстрый, TS и ESM из коробки, watch, покрытие).
tags: [ts, testing]
```

```card
front: Как в JS-проекте принято располагать тесты?
back: "Рядом с кодом: sum.ts и sum.test.ts. Раннер находит файлы по маске *.test.ts. Табличные случаи оформляют массивом объектов и циклом с it/test."
tags: [ts, testing]
```

```card
front: Что означают слова транспиляция, tree shaking, минификация?
back: Транспиляция — перевод современного синтаксиса в более старый. Tree shaking — удаление неимпортируемого кода. Минификация — сжатие кода (короткие имена, без пробелов). Всё это делает бандлер.
tags: [ts, bundler, glossary]
```
