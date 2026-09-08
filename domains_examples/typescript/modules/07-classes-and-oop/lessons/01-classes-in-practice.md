---
id: typescript.classes-and-oop.lesson-01
type: lesson
title: "Урок 01 — Классы на практике и переход к композиции"
tags: [typescript, classes, oop, lesson]
status: todo
updated: 2026-06-26
---

# Урок 01 — Классы на практике и переход к композиции

Цель: построить маленькую систему сначала «как тянет» — через наследование, затем
почувствовать его ограничения и переписать на композицию. Это упражнение прокачивает
главный инстинкт хорошего дизайна.

## Разогрев

- Чем `#field` отличается от `private field`?
- Зачем `abstract`?
- Почему «favor composition over inheritance»?

## Шаг 1. Класс с инкапсуляцией

```ts
class Inventory {
  #items = new Map<string, number>();          // приватно по-настоящему

  add(sku: string, qty: number): void {
    const current = this.#items.get(sku) ?? 0;
    this.#items.set(sku, current + qty);
  }

  count(sku: string): number {
    return this.#items.get(sku) ?? 0;
  }

  get totalUnits(): number {
    let sum = 0;
    for (const qty of this.#items.values()) sum += qty;
    return sum;
  }
}

const inv = new Inventory();
inv.add("apple", 3);
inv.add("apple", 2);
inv.count("apple");    // 5
inv.totalUnits;        // 5
```

`#items` спрятан намертво — снаружи к Map не подобраться, только через публичный API.
Это честная инкапсуляция, ровно та дисциплина, что и неэкспортируемое поле структуры в Go.

## Шаг 2. Соблазн наследования

Захотелось «уведомления» в нескольких сервисах. Первая мысль — базовый класс:

```ts
class BaseService {
  protected notify(msg: string): void {
    console.log(`[LOG] ${msg}`);
  }
}

class OrderService extends BaseService {
  placeOrder(id: number): void {
    this.notify(`Заказ ${id} оформлен`);   // унаследовали notify
  }
}

class UserService extends BaseService {
  register(name: string): void {
    this.notify(`Пользователь ${name} зарегистрирован`);
  }
}
```

Работает. Но вопросы копятся: а если `OrderService` нужно слать в Slack, а
`UserService` — в файл? А если сервису нужно поведение из двух разных базовых классов
(множественного наследования в JS нет)? Базовый класс быстро становится свалкой «всего
полезного», а потомки — заложниками его решений.

## Шаг 3. Та же задача на композиции

```ts
interface Notifier {
  notify(msg: string): void;
}

class ConsoleNotifier implements Notifier {
  notify(msg: string): void { console.log(`[LOG] ${msg}`); }
}

class SlackNotifier implements Notifier {
  constructor(private channel: string) {}
  notify(msg: string): void { console.log(`[SLACK #${this.channel}] ${msg}`); }
}

class OrderService {
  constructor(private notifier: Notifier) {}     // зависимость передаётся снаружи
  placeOrder(id: number): void {
    this.notifier.notify(`Заказ ${id} оформлен`);
  }
}

// сборка: каждый сервис получает нужную реализацию
const orders = new OrderService(new SlackNotifier("orders"));
const orders2 = new OrderService(new ConsoleNotifier());

orders.placeOrder(1);    // [SLACK #orders] Заказ 1 оформлен
orders2.placeOrder(2);   // [LOG] Заказ 2 оформлен
```

Разница принципиальна: `OrderService` больше не привязан к одному способу уведомлять.
Поведение **передаётся** (dependency injection), а не **наследуется**. Тестировать тоже
проще — подсунул фейковый `Notifier` и проверил, что вызвали. Это и есть Go-подобный
стиль: маленькие интерфейсы + композиция.

## Шаг 4. Когда наследование всё же ок

Не впадай в догму «наследование = зло». Честное «is-a» с неглубокой иерархией —
нормально, особенно с `abstract` для общего шаблона:

```ts
abstract class Shape {
  abstract area(): number;
  compare(other: Shape): number { return this.area() - other.area(); }
}

class Circle extends Shape {
  constructor(private r: number) { super(); }
  area(): number { return Math.PI * this.r ** 2; }
}

class Rect extends Shape {
  constructor(private w: number, private h: number) { super(); }
  area(): number { return this.w * this.h; }
}

[new Circle(2), new Rect(3, 4)].sort((a, b) => a.compare(b));
```

`Circle` действительно «является» `Shape`, иерархия плоская (один уровень), общий метод
`compare` живёт в базе. Это уместное наследование.

## Mini-drill

```drill
type: free-form
prompt: "Перепиши OrderService так, чтобы он принимал ещё и Logger (отдельный интерфейс) — два внедряемых зависимостью поведения."
answer: "interface Logger { log(m: string): void } class OrderService { constructor(private notifier: Notifier, private logger: Logger) {} placeOrder(id: number){ this.logger.log(`order ${id}`); this.notifier.notify(`Заказ ${id}`); } }"
check: manual
```

```drill
type: multiple-choice
prompt: "Главная причина, по которой композиция (DI) удобнее для тестирования?"
options: ["код короче", "можно подсунуть фейковую реализацию интерфейса вместо настоящей", "не нужны типы", "работает быстрее"]
answer: "можно подсунуть фейковую реализацию интерфейса вместо настоящей"
check: exact
```

```drill
type: free-form
prompt: "В Inventory поле #items приватно. Что вернёт (inv as any).items извне? А если бы поле было private items?"
answer: "#items недоступно никак — (inv as any).items даст undefined. private items в рантайме доступно: (inv as any).items вернёт Map (private — лишь compile-time контракт)."
check: manual
```

## Итог

Классы дают инкапсуляцию (`#`-поля — настоящую), наследование и абстракции. Но сила —
в умеренности: наследование держи плоским и только для честных «is-a», а основным
инструментом сделай **композицию** — передачу поведения через интерфейсы извне. Это и
тестируемее, и гибче, и ровно тот стиль, к которому тебя приучил Go. Твой инстинкт «без
наследования» — здесь не баг, а фича.
