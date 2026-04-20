# Education UI (MVP)

Локальное приложение для просмотра и практики по воркспейсу `G:/PPP/Education`.

## Стек

- Bun (рантайм + native server + `bun:sqlite`)
- Vue 3 + vue-router + Pinia
- Naive UI + lucide-vue-next (иконки)
- markdown-it + highlight.js — рендер MD
- js-yaml — парсинг frontmatter
- echarts + vue-echarts — графики прогресса
- @vue-flow/* — граф roadmap (позже)

## Структура

```
.app/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── index.html
├── server/
│   ├── index.ts       # Bun.serve: API + раздача SPA
│   ├── content.ts     # скан domains/, парсинг frontmatter + card/drill блоков
│   └── srs.ts         # SM-2 поверх bun:sqlite
└── src/
    ├── main.ts
    ├── App.vue
    ├── router.ts
    ├── api.ts
    ├── lib/
    │   └── parse.ts       # клиентский парсер блоков
    ├── stores/
    │   └── progress.ts
    ├── components/
    │   ├── MdRender.vue
    │   └── DrillRunner.vue
    └── views/
        ├── HomeView.vue
        ├── DomainView.vue
        ├── ModuleView.vue
        ├── LessonView.vue
        └── SrsView.vue
```

## Запуск

```bash
cd .app
bun install
bun run dev
```

Открыть http://localhost:5173. Одна команда поднимает и Bun API (`:5174`), и Vite
(`:5173` с HMR); vite проксирует `/api` и `/raw` на Bun. Ctrl+C корректно гасит оба.

Если надо отладить по отдельности — есть `bun run dev:server` и `bun run dev:spa`.

## Production

```bash
bun run build             # собирает SPA в dist/
bun run start             # Bun сервер отдаёт API + dist/
```

## Что делает backend

- сканирует `../domains/**/*.md`, читает frontmatter и извлекает `card`/`drill` блоки;
- отдаёт дерево `/api/tree`, файл `/api/doc?id=...`, карточки `/api/cards?module=...`,
  drill-сет `/api/drills?module=...`;
- `/raw/<path>` — сырой MD-файл (для отладки/редактора в будущем);
- прогресс и SRS — SQLite в `../.state/progress.sqlite`, схема создаётся на старте;
- SM-2 планирование — `/api/srs/due`, `/api/srs/review`.

## Что делает SPA

- Home: список доменов, карточки прогресса, кнопка SRS на сегодня.
- Domain: дерево модулей, roadmap, статистика.
- Module: вкладки theory / cards / drills / lessons с рендером MD.
- Lesson: одна лекция с инлайн drill-ами.
- Drill: запуск произвольного набора упражнений модуля.
- SRS: карточки, которые подошли к повторению.
