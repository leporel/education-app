---
id: typescript.ts-why-and-setup.lesson-01
type: lesson
title: "Урок 01 — Окружение и первые типы"
tags: [typescript, setup, lesson]
status: todo
updated: 2026-09-08
---

# Урок 01 — Окружение и первые типы

Цель: поднять рабочее окружение, запустить первый `.ts`-файл и почувствовать, как
компилятор ловит ошибки, которых JS бы не заметил.

## Разогрев

- Что значит «типы стираются»? Почему `instanceof MyType` для `type MyType` не работает?
- Чем `unknown` отличается от `any`?
- Зачем нужен `strict: true`?

## Шаг 1. Поставить окружение

1. Установи **Node.js LTS (24+)** с nodejs.org. Проверь:

```bash
node --version    # ожидаем v24.x или выше
```

2. Создай папку проекта и инициализируй её:

```bash
mkdir ts-playground && cd ts-playground
npm init -y                 # создаст package.json
npm install -D typescript tsx
```

3. Создай `tsconfig.json`:

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

> Если предпочитаешь не ставить ничего локально — открой
> [TS Playground](https://www.typescriptlang.org/play). Там тот же компилятор в
> браузере, без установки. Для первого знакомства этого хватит.

## Шаг 2. Первый типизированный файл

Создай `app.ts`:

```ts
function area(width: number, height: number): number {
  return width * height;
}

const a = area(3, 4);
console.log(`Площадь: ${a}`);
```

Запусти любым способом:

```bash
node app.ts        # Node 24 нативно
# или
npx tsx app.ts     # через tsx
```

Должно вывести `Площадь: 12`.

## Шаг 3. Пусть компилятор тебя поймает

Теперь добавь заведомо неправильный вызов и проверь типы:

```ts
area("3", "4");    // строки вместо чисел
area(3);           // забыли второй аргумент
```

```bash
npx tsc --noEmit
```

Ты увидишь две ошибки — `Argument of type 'string' is not assignable to parameter of
type 'number'` и `Expected 2 arguments, but got 1`. В чистом JS обе строки молча
вернули бы `NaN`, и ты узнал бы о проблеме когда-нибудь потом. Это и есть «сдвиг
ошибок влево» в действии. Убери неправильные строки, прежде чем идти дальше.

## Шаг 4. Почувствовать стирание типов

Добавь и запусти:

```ts
type User = { id: number; name: string };

function describe(u: User): string {
  // Попробуй раскомментировать — TS подчеркнёт ошибку:
  // if (u instanceof User) { }   // ❌ 'User' only refers to a type, but is being used as a value

  // А так — правильно, проверяем реальные значения:
  if (typeof u.id === "number" && typeof u.name === "string") {
    return `#${u.id} ${u.name}`;
  }
  return "невалидный пользователь";
}

console.log(describe({ id: 1, name: "Ann" }));
```

Вывод: `#1 Ann`. Запомни ощущение: тип `User` помогал тебе, пока ты писал код, но в
рантайме его нет — проверять можно только конкретные поля.

## Шаг 5. unknown против any

```ts
function parseConfig(raw: string) {
  const data: unknown = JSON.parse(raw);   // честно: что внутри — не знаем

  // data.port;   // ❌ TS не пустит: тип unknown
  if (typeof data === "object" && data !== null && "port" in data) {
    return data;   // здесь TS уже знает, что у data есть свойство port
  }
  throw new Error("в конфиге нет port");
}
```

Поменяй `unknown` на `any` и увидишь, что `data.port` перестаёт подсвечиваться — но
вместе с безопасностью. `unknown` заставляет проверить; `any` молча доверяет. Выбирай
`unknown`.

## Шаг 6. Соблазн `as` и почему он опаснее, чем кажется

Есть более короткий путь: просто сказать компилятору, что данные правильные.

```ts
type Config = { port: number };

function parseConfigLazy(raw: string): Config {
  return JSON.parse(raw) as Config;    // «поверь мне»
}

const cfg = parseConfigLazy('{"port":"3000"}');   // в JSON строка, а не число!
console.log(cfg.port.toFixed(0));                 // ❌ TypeError в рантайме
```

Компилятор молчал: `as Config` — это обещание, а не проверка, и оно испарилось при
компиляции. Запусти пример и убедись, что падение произошло именно в рантайме, хотя
`tsc --noEmit` был доволен.

Теперь сравни с честным вариантом из шага 5: там проверка реально выполняется во время
работы программы, поэтому ошибка обнаруживается в момент разбора конфига, а не через три
экрана кода.

> Мораль: `as` — не инструмент «убрать красную подсветку», а осознанное «я знаю больше
> компилятора». Если знания нет — проверяй.

## Mini-drill

```drill
type: free-form
prompt: "Напиши функцию half(x: number): number, возвращающую половину числа, и вызови её с числом и со строкой. Что скажет tsc --noEmit на второй вызов?"
answer: "function half(x: number): number { return x / 2; } — вызов half('10') даст ошибку 'string is not assignable to number'."
check: manual
```

```drill
type: free-form
prompt: "Почему JSON.parse(raw) as Config не защищает от неверного конфига, а type guard — защищает?"
answer: "as стирается при компиляции: никакой проверки в рантайме нет. Type guard — обычный JS-код, он реально проверяет поля во время выполнения."
check: manual
```

```drill
type: multiple-choice
prompt: "Ты запустил node app.ts в Node 24, и код с ошибкой типа выполнился без жалоб. Почему?"
options: ["Node проверил типы и решил, что всё ок", "Node только стирает типы, не проверяя их — проверка делается через tsc", "в app.ts не было ошибок", "strict был выключен"]
answer: "Node только стирает типы, не проверяя их — проверка делается через tsc"
check: exact
```

## Итог

У тебя есть рабочее окружение и интуиция о трёх вещах: компилятор ловит ошибки до
запуска (`tsc --noEmit`), типы стираются (проверять в рантайме можно только значения),
и для неизвестных данных есть безопасный `unknown`. Дальше можно нырять в саму систему
типов — функции, объекты и интерфейсы.
