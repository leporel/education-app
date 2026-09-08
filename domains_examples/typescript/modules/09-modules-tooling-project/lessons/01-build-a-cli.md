---
id: typescript.modules-tooling-project.lesson-01
type: lesson
title: "Урок 01 — Собираем CLI-приложение целиком"
tags: [typescript, project, cli, lesson]
status: todo
updated: 2026-09-08
---

# Урок 01 — Собираем CLI-приложение целиком

Цель: пройти путь от пустой папки до работающей программы, применив всё из курса —
типы, дискриминированные union, дженерики, async, модули. Делаем маленький **менеджер
задач** в терминале с сохранением в JSON-файл.

Это финальная проверка. Делай руками, не просто читай.

## Разогрев

- Чем `dependencies` отличается от `devDependencies`?
- Зачем `unknown` для данных из файла?
- Что такое дискриминированный union (модуль 04)?

## Шаг 0. Инициализация проекта

```bash
mkdir todo-cli && cd todo-cli
npm init -y
npm install -D typescript tsx @types/node
```

Открой `package.json` и приведи к такому виду (важно `"type": "module"` и scripts):

```json
{
  "name": "todo-cli",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "tsx src/main.ts",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "6.0.3",
    "tsx": "4.19.2",
    "@types/node": "22.10.0"
  }
}
```

Создай `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "skipLibCheck": true
  }
}
```

## Шаг 1. Модель данных (модули 03, 04)

`src/task.ts`:

```ts
export type Priority = "low" | "normal" | "high";   // литеральный union (модуль 04)

export interface Task {
  readonly id: number;
  title: string;
  done: boolean;
  priority: Priority;
}

// Дискриминированный union для результата команды (модуль 04)
export type CommandResult =
  | { kind: "ok"; message: string }
  | { kind: "error"; message: string };
```

## Шаг 2. Хранилище: чтение/запись JSON (модули 02, 08)

`src/storage.ts` — обрати внимание: данные из файла приходят как `unknown`, и мы их
проверяем, прежде чем доверять (граница программы!):

```ts
import { readFile, writeFile } from "node:fs/promises";
import type { Task } from "./task.ts";

const FILE = "tasks.json";

function isTask(x: unknown): x is Task {
  return (
    typeof x === "object" && x !== null &&
    "id" in x && typeof (x as Record<string, unknown>).id === "number" &&
    "title" in x && typeof (x as Record<string, unknown>).title === "string" &&
    "done" in x && typeof (x as Record<string, unknown>).done === "boolean"
  );
}

export async function loadTasks(): Promise<Task[]> {
  try {
    const raw = await readFile(FILE, "utf-8");
    const data: unknown = JSON.parse(raw);
    if (Array.isArray(data) && data.every(isTask)) {
      return data;
    }
    return [];                       // файл повреждён — начинаем с чистого листа
  } catch {
    return [];                       // файла ещё нет — это нормально
  }
}

export async function saveTasks(tasks: Task[]): Promise<void> {
  await writeFile(FILE, JSON.stringify(tasks, null, 2), "utf-8");
}
```

`isTask` — type guard (модуль 04): легализует внешние данные в типизированный мир.
Без него TS (и логика) поверили бы файлу на слово.

## Шаг 3. Логика операций (модули 03, 05)

`src/operations.ts`:

```ts
import type { Task, Priority, CommandResult } from "./task.ts";

export function addTask(tasks: Task[], title: string, priority: Priority): Task[] {
  const nextId = tasks.reduce((max, t) => Math.max(max, t.id), 0) + 1;
  const task: Task = { id: nextId, title, done: false, priority };
  return [...tasks, task];           // не мутируем вход — возвращаем новый массив
}

export function completeTask(tasks: Task[], id: number): CommandResult {
  const task = tasks.find((t) => t.id === id);
  if (!task) {
    return { kind: "error", message: `Задача #${id} не найдена` };
  }
  task.done = true;      // ⚠️ здесь мы мутируем найденный объект — см. заметку ниже
  return { kind: "ok", message: `Задача #${id} выполнена` };
}

// дженерик-хелпер сортировки (модуль 05) — by возвращает сравнимое значение
export function sortBy<T>(items: T[], by: (item: T) => number): T[] {
  return [...items].sort((a, b) => by(a) - by(b));
}

const priorityWeight: Record<Priority, number> = { high: 0, normal: 1, low: 2 };

export function sortByPriority(tasks: Task[]): Task[] {
  return sortBy(tasks, (t) => priorityWeight[t.priority]);
}
```

> **Заметка про мутацию (не пропускай).** `addTask` возвращает новый массив, а
> `completeTask` меняет найденный объект на месте — это осознанная несогласованность,
> чтобы ты её заметил. Помнишь ссылочную семантику из модуля 01? `tasks.find(...)` вернул
> **ссылку** на элемент массива, поэтому `task.done = true` меняет и сам массив. Работает,
> но снаружи это не видно из сигнатуры — читатель кода не ждёт, что функция, возвращающая
> `CommandResult`, что-то поменяла. Аккуратнее было бы вернуть и новый массив:
>
> ```ts
> export function completeTask(
>   tasks: Task[],
>   id: number,
> ): { tasks: Task[]; result: CommandResult } {
>   const exists = tasks.some((t) => t.id === id);
>   if (!exists) {
>     return { tasks, result: { kind: "error", message: `Задача #${id} не найдена` } };
>   }
>   return {
>     tasks: tasks.map((t) => (t.id === id ? { ...t, done: true } : t)),
>     result: { kind: "ok", message: `Задача #${id} выполнена` },
>   };
> }
> ```
>
> Перепиши по желанию — но тогда не забудь поправить вызов в `main.ts`.

## Шаг 4. Точка входа: разбор аргументов (модуль 04 — сужение)

`src/main.ts`:

```ts
import { loadTasks, saveTasks } from "./storage.ts";
import { addTask, completeTask, sortByPriority } from "./operations.ts";
import type { Priority } from "./task.ts";

function isPriority(s: string): s is Priority {
  return s === "low" || s === "normal" || s === "high";
}

async function main(): Promise<void> {
  const [command, ...args] = process.argv.slice(2);   // node tsx main.ts <command> ...
  let tasks = await loadTasks();

  switch (command) {
    case "add": {
      const title = args[0];
      const priorityArg = args[1] ?? "normal";
      if (!title) {
        console.error("Использование: add <title> [low|normal|high]");
        return;
      }
      const priority: Priority = isPriority(priorityArg) ? priorityArg : "normal";
      tasks = addTask(tasks, title, priority);
      await saveTasks(tasks);
      console.log(`Добавлено: "${title}" (${priority})`);
      break;
    }

    case "done": {
      const id = Number(args[0]);
      if (Number.isNaN(id)) {
        console.error("Использование: done <id>");
        return;
      }
      const result = completeTask(tasks, id);
      // дискриминированный union: сужаем по kind
      if (result.kind === "ok") {
        await saveTasks(tasks);
        console.log("✓", result.message);
      } else {
        console.error("✗", result.message);
      }
      break;
    }

    case "list": {
      const sorted = sortByPriority(tasks);
      if (sorted.length === 0) {
        console.log("Список пуст. Добавь задачу: add <title>");
      }
      for (const t of sorted) {
        const mark = t.done ? "[x]" : "[ ]";
        console.log(`${mark} #${t.id} (${t.priority}) ${t.title}`);
      }
      break;
    }

    default:
      console.log("Команды: add <title> [priority] | done <id> | list");
  }
}

// main() возвращает промис — его нельзя «забыть» (floating promise из модуля 08):
// иначе ошибка внутри main пропадёт, а процесс завершится с кодом 0.
main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;      // ненулевой код возврата — как os.Exit(1) в Go
});
```

Обрати внимание на последние строки: это тот самый `no-floating-promises` в действии.
`main()` — асинхронная, и если её результат не обработать, необработанная ошибка внутри
превратится в unhandled rejection, а CLI соврёт вызывающей стороне об успехе.

## Шаг 5. Запуск и проверка типов

```bash
npm run typecheck                       # tsc --noEmit — типы сходятся?
npm start -- add "Купить молоко" high   # двойной -- передаёт аргументы скрипту
npm start -- add "Помыть кота"
npm start -- list
npm start -- done 1
npm start -- list
```

Ожидаемо: задачи сохраняются в `tasks.json`, `list` показывает их отсортированными по
приоритету, `done 1` помечает первую выполненной. Открой `tasks.json` — увидишь свои
данные.

## Что мы применили (карта курса)

- **Модуль 01:** замыкания, неизменяемость (`[...tasks]` вместо мутации), `??`.
- **Модуль 02:** `strict`, `unknown` для данных из файла, запуск через `tsx`.
- **Модуль 03:** `interface Task`, `readonly id`, опциональные аргументы.
- **Модуль 04:** литеральный union `Priority`, дискриминированный `CommandResult`,
  type guards `isTask`/`isPriority`, сужение в `switch`.
- **Модуль 05:** дженерик `sortBy<T>`.
- **Модуль 06:** `Record<Priority, number>` для весов.
- **Модуль 08:** `async/await`, работа с промисами файловой системы, обработка промиса
  `main()` вместо floating promise.
- **Модуль 09:** ESM-модули, `package.json`, npm scripts, структура проекта.

## Mini-drill

```drill
type: free-form
prompt: "Добавь команду remove <id>, удаляющую задачу. Верни CommandResult (ok/error) по аналогии с completeTask, но без мутации — фильтрацией."
answer: "export function removeTask(tasks: Task[], id: number): { tasks: Task[]; result: CommandResult } { const exists = tasks.some(t => t.id === id); if (!exists) return { tasks, result: { kind: 'error', message: `#${id} не найдена` } }; return { tasks: tasks.filter(t => t.id !== id), result: { kind: 'ok', message: `#${id} удалена` } }; }"
check: manual
```

```drill
type: free-form
prompt: "Почему loadTasks принимает данные из файла как unknown и проверяет через isTask, а не доверяет JSON.parse напрямую?"
answer: "JSON.parse возвращает any/unknown — содержимое файла внешнее и непроверенное (граница программы). Файл могли испортить руками. Type guard гарантирует, что в код попадут только валидные Task."
check: manual
```

```drill
type: free-form
prompt: "Почему main().catch(...) лучше, чем просто main()? Что произойдёт при ошибке внутри main в обоих случаях?"
answer: "Просто main() — floating promise: ошибка станет unhandled rejection, а процесс может завершиться с кодом 0, будто всё хорошо. С .catch мы печатаем сообщение и ставим process.exitCode = 1."
check: manual
```

```drill
type: multiple-choice
prompt: "Зачем addTask возвращает [...tasks, task], а не делает tasks.push(task)?"
options: ["так короче", "чтобы не мутировать входной массив (предсказуемость, проще тестировать)", "push не работает с типами", "это обязательно в TS"]
answer: "чтобы не мутировать входной массив (предсказуемость, проще тестировать)"
check: exact
```

## Итог

Ты собрал работающую типобезопасную программу с нуля: модель данных, валидация внешних
данных, бизнес-логика, async-ввод-вывод, разбор аргументов — и всё это проверено
компилятором. Это и есть цель курса: не «знать синтаксис», а **уметь спроектировать и
собрать реальную программу на TypeScript**, опираясь на типы как на страховку.

Поздравляю — база TypeScript пройдена. Следующий логичный шаг — домен **Vue** (вся
типовая база уже у тебя в руках) или backend-трек на Node. Идеи и ссылки — в
`roadmap.md` домена.
