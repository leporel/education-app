---
id: rust.smart-pointers-and-interior-mutability.drills
type: drills
title: "Умные указатели и внутренняя изменяемость — упражнения"
tags: [rust, box, rc, refcell, weak, drills]
status: todo
updated: 2026-09-08
---

# Упражнения

## Box

```drill
type: multiple-choice
prompt: "enum Tree { Node(i32, Tree, Tree), Leaf } не компилируется (E0072 infinite size). Минимальная починка?"
options: ["Добавить #[derive(Copy)]", "Обернуть рекурсивные поля в Box: Node(i32, Box<Tree>, Box<Tree>)", "Заменить i32 на i64", "Сделать всё pub"]
answer: "Обернуть рекурсивные поля в Box: Node(i32, Box<Tree>, Box<Tree>)"
check: exact
hint: Box даёт фиксированный размер указателя.
```

```drill
type: multiple-choice
prompt: "Когда Box реально нужен?"
options: ["Чтобы положить любой i32 в кучу", "Для рекурсивных типов и trait objects (Box<dyn T>)", "Для всех структур", "Vec и так не работает без Box"]
answer: "Для рекурсивных типов и trait objects (Box<dyn T>)"
check: exact
```

## Rc / Arc

```drill
type: free-form
prompt: "Объясни, чем Rc::clone(&a) отличается от a.as_ref().clone() для Rc<String>."
answer: "Rc::clone(&a) копирует указатель и +1 к счётчику ссылок — данные общие, дёшево. a.as_ref().clone() делает глубокую копию самой String (новая аллокация). Первое — разделение владения, второе — независимая копия данных."
check: manual
```

```drill
type: multiple-choice
prompt: "Нужно делить данные между несколькими ПОТОКАМИ. Rc или Arc?"
options: ["Rc — он дешевле", "Arc — атомарный счётчик, Send/Sync; Rc компилятор не пустит в другой поток", "Оба одинаковы", "Ни тот, ни другой"]
answer: "Arc — атомарный счётчик, Send/Sync; Rc компилятор не пустит в другой поток"
check: exact
hint: Atomic Rc = Arc.
```

## RefCell

```drill
type: free-form
prompt: "let c = RefCell::new(0); ... что произойдёт: let a = c.borrow_mut(); let b = c.borrow_mut();?"
answer: "Паника в рантайме: already borrowed: BorrowMutError. RefCell проверяет правило заёма (один writer) в рантайме; два одновременных borrow_mut его нарушают. На компиляции это не ловится (в отличие от обычного &mut)."
check: manual
hint: Проверка в рантайме, паника.
```

```drill
type: multiple-choice
prompt: "RefCell 'обходит' borrow checker?"
options: ["Да, отключает его", "Нет: переносит ту же проверку «писатель ИЛИ читатели» в рантайм (паника при нарушении)", "Да, через unsafe", "Только для Copy-типов"]
answer: "Нет: переносит ту же проверку «писатель ИЛИ читатели» в рантайм (паника при нарушении)"
check: exact
```

## Rc<RefCell> и Weak

```drill
type: free-form
prompt: "Зачем паттерн Rc<RefCell<T>> и какой его многопоточный аналог?"
answer: "Rc даёт нескольких владельцев, RefCell — изменяемость через & (рантайм-проверка заёма). Вместе — общий изменяемый узел в одном потоке (деревья/графы). Многопоточный аналог — Arc<Mutex<T>>: Arc вместо Rc, Mutex вместо RefCell."
check: manual
```

```drill
type: multiple-choice
prompt: "Дерево: узлы держат Rc на детей И Rc на родителя. Что случится?"
options: ["Всё хорошо", "Цикл Rc → счётчики не дойдут до нуля → утечка памяти; родителя надо держать через Weak", "Ошибка компиляции", "Двойное освобождение"]
answer: "Цикл Rc → счётчики не дойдут до нуля → утечка памяти; родителя надо держать через Weak"
check: exact
hint: Weak не удерживает данные живыми.
```

```drill
type: fill-in
prompt: "Weak::____ возвращает Option<Rc<T>> — Some, если данные живы, и None, если уже уничтожены."
answer: "upgrade"
check: fuzzy
hint: «повысить» слабую ссылку до сильной.
```

## Выбор инструмента

```drill
type: multiple-choice
prompt: "Данные читают два модуля в ОДНОМ потоке, менять их никто не будет. Минимально достаточный инструмент?"
options: ["Rc<RefCell<T>>", "Arc<Mutex<T>>", "Rc<T>", "Box<RefCell<T>>"]
answer: "Rc<T>"
check: exact
hint: Изменяемость не нужна — RefCell лишний.
```

```drill
type: free-form
prompt: "Коллега завернул все структуры приложения в Rc<RefCell<T>>, «чтобы не спорить с borrow checker». Какие два аргумента против?"
answer: "1) Ошибки компиляции обменялись на паники BorrowMutError в рантайме — стало хуже, а не лучше. 2) Появились ненужные счётчики ссылок и косвенность, а 90% данных прекрасно живут с одним владельцем; Rc<RefCell> нужен только там, где реально есть разделённое изменяемое состояние (графы/деревья/наблюдатели)."
check: manual
```

```drill
type: fill-in
prompt: "«Инициализировать ровно один раз на всю программу» в std делается типом ____ и методом get_or_init."
answer: "OnceLock"
check: fuzzy
hint: Аналог sync.Once из Go.
```

```drill
type: multiple-choice
prompt: "Почему нельзя написать let x: dyn Shape = ...;?"
options: ["Так не разрешает clippy", "dyn Shape — тип неизвестного размера (DST): его держат только за указателем (Box<dyn Shape>, &dyn Shape)", "Нужен unsafe", "Надо добавить mut"]
answer: "dyn Shape — тип неизвестного размера (DST): его держат только за указателем (Box<dyn Shape>, &dyn Shape)"
check: exact
hint: Размер должен быть известен на компиляции.
```
