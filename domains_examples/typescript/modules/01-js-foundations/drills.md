---
id: typescript.js-foundations.drills
type: drills
title: "JavaScript под капотом TS — упражнения"
tags: [typescript, javascript, foundations, drills]
status: todo
updated: 2026-09-08
---

# Упражнения

Совет: всё это удобно проверять прямо в браузерной консоли (F12 → Console) или в
TS Playground (typescriptlang.org/play). Прежде чем запускать — предскажи результат
в голове, потом сверься. Расхождение «предсказал/получил» — самое ценное в этом модуле.

## Предскажи вывод

```drill
type: free-form
prompt: "Что выведет: console.log(0.1 + 0.2 === 0.3) ? И почему?"
answer: "false — number это 64-битный float (IEEE 754), 0.1+0.2 даёт 0.30000000000000004"
check: manual
hint: Тот же эффект, что у float64 в Go.
```

```drill
type: multiple-choice
prompt: "Что выведет: console.log('1'); setTimeout(() => console.log('2'), 0); console.log('3');"
options: ["1 2 3", "1 3 2", "2 1 3", "3 2 1"]
answer: "1 3 2"
check: exact
hint: setTimeout уходит в очередь и ждёт, пока синхронный код доработает.
```

```drill
type: multiple-choice
prompt: "Чему равно [] == ![] ?"
options: ["true", "false", "ошибка", "undefined"]
answer: "true"
check: exact
hint: Это и есть причина, по которой == нужно избегать. ![] → false, дальше дикое приведение.
```

```drill
type: free-form
prompt: "Будет ли выполнен блок: if ([]) { ... } ? Объясни."
answer: "Да. Пустой массив — truthy. Falsy только: false, 0, '', null, undefined, NaN, 0n."
check: manual
```

## null / undefined и значения по умолчанию

```drill
type: fill-in
prompt: "Дополни так, чтобы при пустом массиве в total попал 0, но при значении 0 оно сохранилось: const total = received ___ 0;"
answer: "??"
check: exact
hint: Нужен оператор, срабатывающий только на null/undefined.
```

```drill
type: free-form
prompt: "let x; const obj = {}; — какие значения у x и у obj.foo, и одинаковы ли они по смыслу?"
answer: "Оба undefined. Это 'значение не задавали' от языка, а не намеренное null."
check: manual
```

## Замыкания

```drill
type: free-form
prompt: "Напиши функцию makeAdder(n), которая возвращает функцию, прибавляющую n к своему аргументу. makeAdder(5)(3) === 8."
answer: "const makeAdder = (n) => (x) => x + n;"
check: manual
hint: Внутренняя стрелка замыкается над n.
```

```drill
type: free-form
prompt: "Объясни, почему в makeCounter() переменная count сохраняется между вызовами возвращённой функции, хотя makeCounter уже завершилась."
answer: "Возвращённая функция замкнулась над count: пока на функцию есть ссылка, её 'рюкзачок' с count жив и не собирается сборщиком мусора."
check: manual
```

## this

```drill
type: free-form
prompt: "const u = { name: 'Ann', greet() { return this.name } }; const f = u.greet; f(); — что вернёт f() и почему?"
answer: "Не вернёт 'Ann' (this потерян: undefined или ошибка в strict). this зависит от способа вызова; f() вызвана без объекта-владельца."
check: manual
```

```drill
type: multiple-choice
prompt: "В колбэке forEach внутри метода объекта, чтобы this остался указывать на объект, какую функцию использовать?"
options: ["обычную function", "arrow-функцию", "var-функцию", "любую, разницы нет"]
answer: "arrow-функцию"
check: exact
hint: Стрелка берёт this лексически из окружающего метода.
```

## Прототипы и стирание типов

```drill
type: free-form
prompt: "Откуда у массива [1,2,3] берётся метод .map, хотя ты его не определял?"
answer: "Из прототипа Array.prototype: при обращении к .map движок не находит его на самом объекте и идёт по цепочке прототипов."
check: manual
```

```drill
type: free-form
prompt: "Почему нельзя в рантайме спросить 'а какой TS-тип у этой переменной'? Сравни с Go."
answer: "Типы TS стираются при компиляции в JS — спрашивать не у кого. В Go типы живут в рантайме (reflect), в TS — нет."
check: manual
```

## Объекты, массивы, ссылки

```drill
type: free-form
prompt: "const a = { n: 1 }; const b = a; b.n = 42; — что выведет console.log(a.n) и почему?"
answer: "42. Объекты живут по ссылке: a и b указывают на один объект. Копию нужно делать явно: { ...a }."
check: manual
```

```drill
type: multiple-choice
prompt: "Что вернёт [10, 9, 1].sort() ?"
options: ["[1, 9, 10]", "[1, 10, 9]", "[10, 9, 1]", "ошибку"]
answer: "[1, 10, 9]"
check: exact
hint: Без компаратора элементы сравниваются как строки.
```

```drill
type: free-form
prompt: "Дан const users = [{ name: 'Ann', age: 30 }, { name: 'Bob', age: 17 }]. Получи массив имён совершеннолетних (одной цепочкой методов)."
answer: "users.filter((u) => u.age >= 18).map((u) => u.name)  // ['Ann']"
check: manual
```

```drill
type: multiple-choice
prompt: "Нужно перебрать значения массива. Какая конструкция правильная?"
options: ["for (const i in arr)", "for (const v of arr)", "for (const v in arr)", "любая"]
answer: "for (const v of arr)"
check: exact
hint: for...in даёт ключи-строки и для массивов не предназначен.
```

```drill
type: free-form
prompt: "Посчитай сумму цен из массива items: [{ price: 100 }, { price: 250 }] через reduce."
answer: "items.reduce((sum, it) => sum + it.price, 0)  // 350"
check: manual
```

## Деструктуризация и spread

```drill
type: fill-in
prompt: "Достань из объекта user поля name и age в одноимённые переменные: const ___ = user;"
answer: "{ name, age }"
check: fuzzy
```

```drill
type: free-form
prompt: "Напиши функцию createTask, принимающую объект { title, priority = 'normal' } и возвращающую строку `${title} (${priority})`."
answer: "function createTask({ title, priority = 'normal' }) { return `${title} (${priority})`; }"
check: manual
```

```drill
type: free-form
prompt: "Дано const cfg = { host: 'localhost', port: 80 }. Получи новый объект с port = 8080, не мутируя cfg."
answer: "const next = { ...cfg, port: 8080 }; — при совпадении ключей побеждает правый."
check: manual
```

```drill
type: free-form
prompt: "Убери из объекта user поле password, получив остальное в safeUser. Одной строкой."
answer: "const { password, ...safeUser } = user;  // rest собирает остаток"
check: manual
```

```drill
type: multiple-choice
prompt: "const orig = { u: { n: 1 } }; const copy = { ...orig }; copy.u.n = 2; чему равно orig.u.n?"
options: ["1", "2", "undefined", "ошибка"]
answer: "2"
check: exact
hint: Spread копирует только верхний уровень — вложенный объект общий.
```

## Опциональная цепочка и ошибки

```drill
type: fill-in
prompt: "Безопасно достань city, если address может отсутствовать: const city = user.address___city ?? 'нет';"
answer: "?."
check: exact
```

```drill
type: free-form
prompt: "Напиши функцию parseAge(raw), которая бросает Error для нечисловой строки, и вызов с try/catch/finally."
answer: "function parseAge(raw){ const n = Number(raw); if (Number.isNaN(n)) throw new Error(`не число: ${raw}`); return n; } try { parseAge('x'); } catch (e) { console.error(e.message); } finally { console.log('готово'); }"
check: manual
```

```drill
type: free-form
prompt: "Почему по сигнатуре JS/TS-функции нельзя понять, бросает ли она исключение? Как с этим живут на практике?"
answer: "В типах нет аналога throws — информации о бросаемых ошибках в сигнатуре нет. На практике: документируют, ловят try/catch на границе или возвращают результат-объект (паттерн Result)."
check: manual
```

```drill
type: multiple-choice
prompt: "console.log(x); let x = 1; — что произойдёт?"
options: ["выведет undefined", "выведет 1", "ReferenceError (TDZ)", "SyntaxError"]
answer: "ReferenceError (TDZ)"
check: exact
hint: К let/const нельзя обращаться до строки объявления.
```
