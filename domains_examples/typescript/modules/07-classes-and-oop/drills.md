---
id: typescript.classes-and-oop.drills
type: drills
title: "Классы и ООП — упражнения"
tags: [typescript, classes, oop, drills]
status: todo
updated: 2026-09-08
---

# Упражнения

## Основы классов

```drill
type: free-form
prompt: "Напиши класс BankAccount с приватным balance (нач. 0), методами deposit(n) и withdraw(n) (не уйти в минус) и геттером balance через get."
answer: "class BankAccount { #balance = 0; deposit(n: number) { this.#balance += n; } withdraw(n: number) { if (n <= this.#balance) this.#balance -= n; } get balance() { return this.#balance; } }"
check: manual
hint: # даёт настоящую приватность; геттер balance читает приватное поле.
```

```drill
type: multiple-choice
prompt: "constructor(public readonly id: number) {} — что это делает?"
options: ["ничего, синтаксическая ошибка", "объявляет поле id, делает его публичным и readonly, присваивает из аргумента", "создаёт локальную переменную", "только проверяет тип"]
answer: "объявляет поле id, делает его публичным и readonly, присваивает из аргумента"
check: exact
```

## Модификаторы

```drill
type: free-form
prompt: "Объясни разницу: к private-полю можно добраться через (obj as any).field, а к #-полю — нет. Почему?"
answer: "private — проверка только компилятора, в рантайме поле обычное (типы стёрты). #-поле — часть стандарта JS, настоящая рантайм-приватность, доступа извне нет."
check: manual
```

## Наследование и абстракции

```drill
type: free-form
prompt: "Напиши abstract class Shape с abstract area(): number и конкретным describe(): string, использующим area(). Затем класс Square."
answer: "abstract class Shape { abstract area(): number; describe() { return `S=${this.area()}`; } } class Square extends Shape { constructor(private s: number) { super(); } area() { return this.s ** 2; } }"
check: manual
```

```drill
type: multiple-choice
prompt: "new Shape() для abstract class Shape — что будет?"
options: ["создастся пустой объект", "ошибка компиляции: нельзя инстанцировать абстрактный класс", "ошибка в рантайме", "вызовется area()"]
answer: "ошибка компиляции: нельзя инстанцировать абстрактный класс"
check: exact
```

## Композиция vs наследование

```drill
type: free-form
prompt: "Перепиши идею 'NotificationService наследует EmailSender' на композицию: NotificationService получает Sender в конструкторе."
answer: "interface Sender { send(msg: string): void } class NotificationService { constructor(private sender: Sender) {} notify(m: string) { this.sender.send(m); } } — реализацию Sender подменяем снаружи, не наследуя."
check: manual
```

```drill
type: multiple-choice
prompt: "Когда наследование уместнее композиции?"
options: ["всегда", "при редком честном отношении 'is-a' и неглубокой иерархии", "никогда", "когда лень писать интерфейс"]
answer: "при редком честном отношении 'is-a' и неглубокой иерархии"
check: exact
```

## this в классах

```drill
type: free-form
prompt: "В классе Timer метод tick увеличивает this.count. Почему setInterval(this.tick, 1000) сломается и как починить?"
answer: "this.tick передан как оторванный колбэк — this потеряется. Починка: setInterval(() => this.tick(), 1000) или объявить tick = () => {...} стрелочным полем."
check: manual
```

```drill
type: multiple-choice
prompt: "Нужно ли писать implements Comparable, чтобы класс с методом compareTo подходил под тип Comparable?"
options: ["да, обязательно", "нет, структурная типизация сработает; implements — явная проверка/документация", "только в strict", "только для абстрактных классов"]
answer: "нет, структурная типизация сработает; implements — явная проверка/документация"
check: exact
```

## static и свои ошибки

```drill
type: free-form
prompt: "Напиши класс Money с приватным конструктором и static-фабрикой fromCents(cents: number), бросающей RangeError для отрицательных значений."
answer: "class Money { private constructor(readonly cents: number) {} static fromCents(cents: number): Money { if (cents < 0) throw new RangeError('отрицательная сумма'); return new Money(cents); } }"
check: manual
```

```drill
type: free-form
prompt: "Опиши класс ValidationError extends Error с полем field, корректно инициализированный."
answer: "class ValidationError extends Error { constructor(message: string, readonly field: string) { super(message); this.name = 'ValidationError'; } }"
check: manual
hint: super(message) обязателен, this.name — для читаемых логов.
```

```drill
type: multiple-choice
prompt: "Как в catch надёжно понять, что произошла именно ValidationError?"
options: ["err.name === 'ValidationError'", "err instanceof ValidationError", "typeof err === 'ValidationError'", "err as ValidationError"]
answer: "err instanceof ValidationError"
check: exact
hint: Класс существует в рантайме, поэтому instanceof работает и сужает тип.
```

```drill
type: free-form
prompt: "Как передать исходную ошибку внутрь своей, не теряя её? Назови аналог в Go."
answer: "new AppError('не смог сохранить', 'IO', { cause: err }) — стандартное поле Error.cause. Аналог в Go: fmt.Errorf(\"...: %w\", err)."
check: manual
```
