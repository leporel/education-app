---
id: typescript.js-foundations.lesson-02
type: lesson
title: "Урок 02 — Объекты, массивы и три точки"
tags: [typescript, javascript, foundations, lesson]
status: todo
updated: 2026-09-08
---

# Урок 02 — Объекты, массивы и три точки

Цель урока — довести до автоматизма тот синтаксис, которым написан весь современный
JS/TS-код: объекты и массивы, методы массивов вместо циклов, деструктуризация и `...`.
После этого чужой код перестанет выглядеть как шифровка. Всё ниже можно вставлять в
консоль браузера (F12 → Console) или в Node.

## Разогрев

- Что вернёт `user.nmae`, если такого свойства нет (и почему это опасно)?
- Чем `for...of` отличается от `for...in`?
- Что делают `...` слева и справа от `=`?

## Шаг 1. Ссылка, а не копия — почувствуй на пальцах

Это самое неочевидное место для человека, пришедшего из Go. Прогони построчно:

```js
const a = { n: 1 };
const b = a;
b.n = 42;
console.log(a.n);          // 42  — один объект на две переменные

const c = { ...a };        // а вот это уже копия (верхнего уровня)
c.n = 7;
console.log(a.n);          // 42  — исходный не тронут

console.log(a === b);      // true  — та же ссылка
console.log(a === c);      // false — другой объект, пусть и похожий
```

Теперь то же самое с функцией — момент, где Go-разработчик обычно ловит баг:

```js
function addTag(user) {
  user.tags = ["new"];     // мутируем ЧУЖОЙ объект
}

const u = { name: "Ann" };
addTag(u);
console.log(u.tags);       // ["new"] — функция изменила наши данные

// Аккуратный вариант: не мутировать, а вернуть новый объект
function withTag(user, tag) {
  return { ...user, tags: [tag] };
}
const u2 = withTag({ name: "Bob" }, "vip");
```

`// Go: addTag(user *User) — там звёздочка в сигнатуре предупреждала бы тебя. В JS
предупреждения нет: любой объект приходит «по указателю».` Отсюда правило хорошего кода:
**по умолчанию не мутируй то, что тебе передали** — возвращай новое значение.

## Шаг 2. Массивы: методы вместо циклов

Возьмём маленький «датасет» и обработаем его так, как это делают в реальном коде.

```js
const products = [
  { id: 1, title: "Молоко", priceCents: 8900, tags: ["еда"] },
  { id: 2, title: "Хлеб", priceCents: 4500, tags: ["еда", "выпечка"] },
  { id: 3, title: "Носки", priceCents: 19900, tags: ["одежда"] },
];

// 1. Только еда
const food = products.filter((p) => p.tags.includes("еда"));
console.log(food.length);                        // 2

// 2. Только названия
const titles = products.map((p) => p.title);
console.log(titles);                             // ["Молоко", "Хлеб", "Носки"]

// 3. Сумма чека
const total = products.reduce((sum, p) => sum + p.priceCents, 0);
console.log(total);                              // 33300

// 4. Найти по id
const bread = products.find((p) => p.id === 2);
console.log(bread?.title);                       // "Хлеб"  (?. — на случай undefined)

// 5. Есть ли дорогие товары?
console.log(products.some((p) => p.priceCents > 15000));   // true

// 6. Сортировка по цене — обязательно на копии и с компаратором
const byPrice = [...products].sort((a, b) => a.priceCents - b.priceCents);
console.log(byPrice.map((p) => p.title));        // ["Хлеб", "Молоко", "Носки"]
```

Проверь себя экспериментом: убери `[...products]` из шага 6 и посмотри, что исходный
`products` теперь тоже переупорядочен. `sort` — мутирующий, и это регулярно всплывает как
баг «почему список на экране перетасовался».

## Шаг 3. Группировка: объект как словарь

Классическая задача — сгруппировать по признаку. Заодно увидишь объект в роли словаря и
цепочку `??`:

```js
const byTag = {};

for (const p of products) {
  for (const tag of p.tags) {
    byTag[tag] = byTag[tag] ?? [];    // ключа может не быть — создаём пустой массив
    byTag[tag].push(p.title);
  }
}

console.log(byTag);
// { "еда": ["Молоко", "Хлеб"], "выпечка": ["Хлеб"], "одежда": ["Носки"] }

// Перебрать словарь
for (const [tag, names] of Object.entries(byTag)) {
  console.log(`${tag}: ${names.join(", ")}`);
}
```

`byTag[tag] ?? []` — это ровно то, что в Go делает проверка `v, ok := m[k]`: «нет ключа —
подставь пустое». Только тут вместо `ok` работает тот факт, что отсутствующее свойство
равно `undefined`.

## Шаг 4. Деструктуризация и `...` в одном примере

Соберём всё вместе на функции, которая готовит товар к отправке клиенту:

```js
function toPublic({ id, title, priceCents, ...rest }) {
  //                ^^^^^^^^^^^^^^^^^^^^^  достали нужное
  //                                       ^^^^^^^ остальное собрали в rest
  return {
    id,
    title,
    price: (priceCents / 100).toFixed(2),   // 8900 → "89.00"
    extra: rest,
  };
}

console.log(toPublic(products[0]));
// { id: 1, title: "Молоко", price: "89.00", extra: { tags: ["еда"] } }
```

И «именованные аргументы» через объект-параметр с значениями по умолчанию:

```js
function search({ query, limit = 10, sort = "relevance" } = {}) {
  return `q=${query ?? ""}&limit=${limit}&sort=${sort}`;
}

search({ query: "молоко" });                    // "q=молоко&limit=10&sort=relevance"
search({ query: "хлеб", limit: 3 });            // "q=хлеб&limit=3&sort=relevance"
search();                                        // "q=&limit=10&sort=relevance"
```

Обрати внимание на `= {}` в конце списка параметров: без него вызов `search()` без
аргументов упал бы с ошибкой — нельзя деструктурировать `undefined`. Это популярные
грабли.

## Шаг 5. Опциональная цепочка против «Cannot read properties of undefined»

```js
const orders = [
  { id: 1, customer: { name: "Ann", address: { city: "Praha" } } },
  { id: 2, customer: { name: "Bob" } },              // адреса нет
];

for (const o of orders) {
  // console.log(o.customer.address.city);   // ❌ на втором заказе упадёт
  console.log(o.customer.address?.city ?? "город не указан");
}
// Praha
// город не указан
```

Разница между `??` и `||` здесь тоже важна: если бы город был пустой строкой `""`, то
`|| "город не указан"` подменил бы его, а `??` — нет (он реагирует только на
`null`/`undefined`).

## Mini-drill

```drill
type: free-form
prompt: "Из массива products получи объект { title: price } только для товаров дешевле 100 рублей (10000 копеек). Используй filter + reduce (или Object.fromEntries)."
answer: "Object.fromEntries(products.filter(p => p.priceCents < 10000).map(p => [p.title, p.priceCents]))"
check: manual
hint: Object.fromEntries превращает массив пар в объект — обратная операция к Object.entries.
```

```drill
type: free-form
prompt: "Напиши функцию rename(user, newName), возвращающую НОВЫЙ объект с изменённым именем, не мутируя исходный."
answer: "const rename = (user, newName) => ({ ...user, name: newName });"
check: manual
hint: Скобки вокруг объекта нужны, чтобы стрелка не приняла { за тело функции.
```

```drill
type: multiple-choice
prompt: "function f({ a = 1 }) {} — что произойдёт при вызове f() без аргументов?"
options: ["a будет 1", "TypeError: нельзя деструктурировать undefined", "вернёт undefined", "SyntaxError"]
answer: "TypeError: нельзя деструктурировать undefined"
check: exact
hint: "Нужен дефолт для всего параметра: function f({ a = 1 } = {}) {}."
```

```drill
type: free-form
prompt: "Объясни, почему [...arr].sort() безопаснее, чем arr.sort()."
answer: "sort мутирует массив, на котором вызван. Spread создаёт копию, поэтому исходный порядок в arr сохраняется — важно, если массив используется где-то ещё."
check: manual
```

## Итог

Что должно остаться в мышечной памяти: **объекты и массивы передаются по ссылке**
(мутировать чужое — плохой тон, возвращай новое через `...`); **вместо циклов —
`map`/`filter`/`reduce`/`find`**, помня, кто из методов мутирует; **деструктуризация**
достаёт нужные поля и делает «именованные аргументы»; **`?.` и `??`** аккуратно
обрабатывают отсутствие данных. Этот синтаксис — не украшение, а язык, на котором написан
весь код, который тебе предстоит читать, включая Vue-компоненты в следующем домене.
