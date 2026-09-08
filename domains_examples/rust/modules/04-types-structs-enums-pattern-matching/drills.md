---
id: rust.types-structs-enums-pattern-matching.drills
type: drills
title: "Типы, структуры, enum и сопоставление — упражнения"
tags: [rust, struct, enum, match, option, drills]
status: todo
updated: 2026-09-08
---

# Упражнения

## Структуры

```drill
type: free-form
prompt: "Объяви struct Counter { value: u32 } с методами new() -> Self и increment(&mut self). Напиши."
answer: "struct Counter { value: u32 } impl Counter { fn new() -> Self { Self { value: 0 } } fn increment(&mut self) { self.value += 1; } }"
check: manual
hint: Конструктор — ассоциированная функция без self; мутация — &mut self.
```

```drill
type: multiple-choice
prompt: "Метод должен ТОЛЬКО прочитать поля и вернуть строку. Какой получатель?"
options: ["self", "&self", "&mut self", "без получателя"]
answer: "&self"
check: exact
hint: Чтение через заём.
```

## Enum и match

```drill
type: free-form
prompt: "Объяви enum Shape с вариантами Circle(f64) и Square(f64), и напиши area(&self) через match."
answer: "enum Shape { Circle(f64), Square(f64) } impl Shape { fn area(&self) -> f64 { match self { Shape::Circle(r) => std::f64::consts::PI*r*r, Shape::Square(s) => s*s } } }"
check: manual
```

```drill
type: multiple-choice
prompt: "Добавили в enum новый вариант, но забыли обновить match без _. Что будет?"
options: ["Молча выберется первая ветка", "Паника в рантайме", "Ошибка компиляции: non-exhaustive patterns", "Новый вариант проигнорируется"]
answer: "Ошибка компиляции: non-exhaustive patterns"
check: exact
hint: В этом и сила исчерпываемости.
```

```drill
type: fill-in
prompt: "В match диапазон 3..=9 покрывает значения от 3 до ____ включительно."
answer: "9"
check: exact
hint: ..= — включающий диапазон.
```

## Option

```drill
type: multiple-choice
prompt: "fn f() -> Option<i32>. Как безопасно получить значение или 0, без match?"
options: ["f().unwrap()", "f().unwrap_or(0)", "f() + 0", "*f()"]
answer: "f().unwrap_or(0)"
check: exact
hint: unwrap_or даёт дефолт вместо паники на None.
```

```drill
type: free-form
prompt: "Перепиши через let else: let r = find(2); if r.is_none() { return; } let name = r.unwrap();"
answer: "let Some(name) = find(2) else { return; }; — дальше name точно есть, без unwrap и без вложенности."
check: manual
hint: «достань-или-выйди».
```

```drill
type: free-form
prompt: "Go-разработчик спрашивает: почему Option<T> лучше, чем вернуть nil-указатель? Ответь одним абзацем."
answer: "Option<T> делает отсутствие частью типа: компилятор не даст использовать значение, не обработав None. В Go *T может быть nil, забытая проверка превращается в panic в рантайме, а компилятор молчит. Option переносит этот класс ошибок на этап компиляции."
check: manual
```

```drill
type: multiple-choice
prompt: "Где unwrap() уместен?"
options: ["В прод-обработчике HTTP-запроса", "В прототипе/тесте, где паника = осознанный краш", "Везде, это удобно", "Никогда нельзя"]
answer: "В прототипе/тесте, где паника = осознанный краш"
check: exact
hint: unwrap паникует на None; в проде — match/?/комбинаторы.
```

## Базовая грамматика

```drill
type: free-form
prompt: "Перепиши по-Rust'овски: var label string; if n > 10 { label = \"много\" } else { label = \"мало\" }"
answer: "let label = if n > 10 { \"много\" } else { \"мало\" }; — if это выражение, обе ветки возвращают значение, mut не нужен."
check: manual
hint: Ветка возвращает значение.
```

```drill
type: multiple-choice
prompt: "let s = \"12\"; let s = s.parse::<i32>().unwrap(); — что здесь произошло?"
options: ["Мутация переменной s", "Shadowing: объявлена новая переменная s другого типа", "Ошибка: s не mut", "Ошибка типов"]
answer: "Shadowing: объявлена новая переменная s другого типа"
check: exact
hint: mut для этого не нужен и не помог бы (тип меняется).
```

```drill
type: fill-in
prompt: "Бесконечный цикл, который возвращает значение наружу, начинается ключевым словом ____, а значение отдаёт через ____ value."
answer: "loop; break"
check: fuzzy
hint: loop — выражение.
```

## derive и образцы

```drill
type: multiple-choice
prompt: "Хочешь напечатать свою структуру во время отладки. Минимальный набор?"
options: ["Ничего не нужно, работает само", "#[derive(Debug)] + println!(\"{x:?}\")", "impl Display + println!(\"{x}\")", "#[derive(Copy)]"]
answer: "#[derive(Debug)] + println!(\"{x:?}\")"
check: exact
hint: "{} требует Display, который derive'ом не получить."
```

```drill
type: free-form
prompt: "Напиши ветку match, которая срабатывает на Msg::Move { x, y } только когда x и y равны, и печатает x."
answer: "Msg::Move { x, y } if x == y => println!(\"по диагонали на {x}\"), — guard if x == y поверх образца."
check: manual
hint: Guard.
```

```drill
type: multiple-choice
prompt: "Нужен просто булев ответ «это вариант Quit?». Самый короткий способ?"
options: ["match m { Msg::Quit => true, _ => false }", "matches!(m, Msg::Quit)", "m == Msg::Quit всегда работает", "if let Msg::Quit = m { true }"]
answer: "matches!(m, Msg::Quit)"
check: exact
hint: Макрос ровно для этого.
```

```drill
type: free-form
prompt: "Есть cfg: Config с пятью полями, нужен такой же, но с verbose = true. Как записать, не перечисляя остальные поля?"
answer: "let c = Config { verbose: true, ..cfg }; (или ..Default::default(), если базой служит дефолт) — struct update syntax берёт остальные поля из указанного значения."
check: manual
hint: Двоеточие-двоеточие не нужно, нужны две точки.
```
