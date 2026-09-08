---
id: typescript.functions-objects-interfaces.lesson-01
type: lesson
title: "Урок 01 — Моделируем данные типами"
tags: [typescript, objects, interfaces, lesson]
status: todo
updated: 2026-06-26
---

# Урок 01 — Моделируем данные типами

Цель: взять маленькую предметную область (магазинная корзина) и аккуратно описать её
типами — так, чтобы компилятор стал твоим напарником, а не врагом.

## Разогрев

- Чем `email?: string` отличается от `email: string | undefined`?
- Когда срабатывает excess property check?
- В каком случае берём `interface`, а в каком `type`?

## Шаг 1. Опишем товар и корзину

```ts
interface Product {
  readonly id: number;
  title: string;
  priceCents: number;        // цену храним в копейках (целое!) — помним про float из модуля 01
  tags?: string[];           // опционально
}

interface CartItem {
  product: Product;
  qty: number;
}

interface Cart {
  items: CartItem[];
  readonly createdAt: Date;
}
```

Уже на этом этапе типы документируют намерения: `id` менять нельзя, цена — целое число
копеек, `tags` могут отсутствовать. Это не комментарии, которые врут, — это контракт,
который проверяется.

## Шаг 2. Функции над данными

```ts
function lineTotal(item: CartItem): number {
  return item.product.priceCents * item.qty;
}

function cartTotal(cart: Cart): number {
  return cart.items.reduce((sum, item) => sum + lineTotal(item), 0);
}

// тип функции-скидки как значение
type Discount = (totalCents: number) => number;

const tenPercent: Discount = (total) => Math.round(total * 0.9);
const noDiscount: Discount = (total) => total;

function checkout(cart: Cart, discount: Discount = noDiscount): number {
  return discount(cartTotal(cart));
}
```

Здесь видно сразу несколько идей модуля: тип-сигнатура `Discount`, default-параметр
`discount = noDiscount`, контекстная типизация в `reduce` (параметры `sum`, `item` не
аннотированы — TS вывел их сам).

## Шаг 3. Соберём корзину и почувствуем компилятор

```ts
const milk: Product = { id: 1, title: "Молоко", priceCents: 8900 };
const bread: Product = { id: 2, title: "Хлеб", priceCents: 4500, tags: ["выпечка"] };

const cart: Cart = {
  items: [
    { product: milk, qty: 2 },
    { product: bread, qty: 1 },
  ],
  createdAt: new Date(),
};

console.log(checkout(cart));            // полная сумма
console.log(checkout(cart, tenPercent)); // со скидкой 10%
```

## Шаг 4. Намеренно ошибёмся (учимся читать ошибки)

Попробуй каждую строку по очереди и прочитай, что скажет компилятор:

```ts
milk.id = 99;                          // ❌ readonly: Cannot assign to 'id'
const bad: Product = { id: 3, title: "X", priceCents: 100, discount: 10 };
                                       // ❌ excess property: 'discount' не из Product (опечатался в названии поля — хотел tags?)
cartTotal(cart.items);                 // ❌ ждали Cart, дали CartItem[]
checkout(cart, (t) => "дёшево");       // ❌ Discount должен вернуть number, а не string
```

Каждая из этих ошибок в чистом JS прошла бы молча и аукнулась бы позже. Здесь они
подсвечены сразу. Вторая особенно поучительна: excess property check поймал, что поля
`discount` у товара нет — возможно, ты перепутал с `tags`.

## Mini-drill

```drill
type: free-form
prompt: "Добавь в Cart опциональное поле coupon?: string и функцию applyCoupon(cart: Cart): string, возвращающую купон или 'без купона', если его нет."
answer: "В Cart: coupon?: string. Функция: function applyCoupon(cart: Cart): string { return cart.coupon ?? 'без купона'; } — coupon имеет тип string | undefined, ?? даёт запасной вариант."
check: manual
```

```drill
type: free-form
prompt: "Почему priceCents целое число копеек, а не price дробью? (вспомни модуль 01)"
answer: "number в JS — это float (IEEE 754), дробные деньги накапливают ошибку (0.1+0.2). Целые копейки складываются точно."
check: manual
```

```drill
type: multiple-choice
prompt: "Тип Discount описан как (totalCents: number) => number. Что использовать для такого имени — interface или type?"
options: ["interface", "type", "class", "enum"]
answer: "type"
check: exact
hint: Это alias функции — interface для функции-типа неудобен.
```

## Итог

Ты смоделировал маленькую предметную область типами: `readonly` защитил неизменяемые
поля, опциональные свойства и `??` аккуратно обработали отсутствие данных, типы-функции
описали поведение (скидку) как значение. Главное ощущение: **сначала проектируешь
типы (форму данных), потом пишешь логику — и компилятор страхует каждый шаг.** Это та
же дисциплина «сначала типы, потом код», что и в Go, только инструменты гибче.
