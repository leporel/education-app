---
id: rust.types-structs-enums-pattern-matching.cards
type: cards
title: "Типы, структуры, enum и сопоставление — карточки"
tags: [rust, types, struct, enum, match, option, cards]
status: todo
updated: 2026-09-08
---

# Карточки

## Типы

```card
front: Чем числовые типы Rust отличаются от Go по приведению и переполнению?
back: "Приведение всегда явное (x as u64), смешивать типы нельзя — как в Go. Но переполнение в debug-сборке ПАНИКУЕТ (в release заворачивается). Для явного поведения: wrapping_add/checked_add/saturating_add. По умолчанию целое — i32, дробь — f64."
tags: [rust, numbers]
```

```card
front: char в Rust — это байт?
back: Нет, это скаляр Unicode (4 байта), хранит один codepoint. Байт — это u8. Строки UTF-8, индексация по байтам, не по символам.
tags: [rust, char]
```

## Структуры и impl

```card
front: Три вида структур в Rust?
back: "1) с именованными полями (struct User { name: String }); 2) кортежная (struct Point(i32, i32), доступ по индексу); 3) единичная/unit (struct Marker — без полей, для маркеров/трейтов)."
tags: [rust, struct]
```

```card
front: &self vs &mut self vs self в методах?
back: &self — читаем через заём (как получатель-указатель для чтения). &mut self — меняем поля. self — забирает владение (move), для «потребляющих» преобразований. Ассоциированная функция без self (User::new) — обычно конструктор.
tags: [rust, impl, self]
```

## Enum и match

```card
front: Чем enum Rust принципиально отличается от констант/iota в Go?
back: "Это сумм-тип: значение — ровно один из вариантов, и варианты несут данные разной формы (Circle(f64), Rectangle{w,h}, Point). В Go такого нет — там городят интерфейс+реализации или флаг-дискриминатор без гарантий полноты."
tags: [rust, enum]
```

```card
front: Чем match отличается от switch в Go?
back: Исчерпывающий (забыл вариант enum — ошибка компиляции non-exhaustive), это выражение (возвращает значение), деструктурирует данные из образца, нет fallthrough. _ — «всё остальное».
tags: [rust, match]
```

```card
front: Что даёт исчерпываемость match на практике?
back: Добавил новый вариант в enum — компилятор укажет все match, которые его не покрыли. Невозможно молча забыть случай. Рефакторинг сумм-типов становится безопасным.
tags: [rust, match, exhaustive]
```

## Option

```card
front: Как Rust обходится без nil?
back: Через Option<T> = Some(T) | None. «Отсутствие» — это вариант None, который компилятор заставляет обработать. Нельзя использовать Option<T> как T, не разобрав None. Класс багов «забыл проверить на nil» исчезает на компиляции.
tags: [rust, option, null]
```

```card
front: Чем Option лучше *T с nil из Go?
back: В Go *T может быть nil, забыл проверку → panic в рантайме, компилятор молчит. Option<T> делает отсутствие видимым в типе и обязательным к обработке — проверка форсируется на компиляции.
tags: [rust, option, go]
```

```card
front: Способы разобрать Option (4 шт.) и когда что?
back: match (полный разбор), if let Some(x) (интересен один вариант), let else (достань-или-ранний-выход, плоский код), комбинаторы map/unwrap_or/unwrap_or_else (без ветвлений). unwrap()/expect() — паникует на None, только прототип/тест.
tags: [rust, option, patterns]
```

## Базовая грамматика

```card
front: Чем shadowing отличается от mut?
back: "Shadowing — повторное let с тем же именем: создаётся НОВАЯ переменная, можно даже другого типа (let spaces = \"   \"; let spaces = spaces.len();). mut разрешает менять то же самое значение, тип поменять нельзя. Shadowing идиоматичен для пошаговой доработки значения."
tags: [rust, shadowing]
```

```card
front: if и loop в Rust — операторы или выражения?
back: "Выражения: let g = if x > 90 { \"A\" } else { \"B\" }; и let n = loop { ... break value; };. Блок { ... } тоже выражение. Поэтому тернарного оператора в языке нет — он не нужен. В Go if — только оператор."
tags: [rust, expressions]
```

```card
front: const vs static в Rust?
back: const — константа с обязательным типом, вычисляется на компиляции и подставляется в места использования. static — одно значение по одному адресу на всю программу. По умолчанию бери const; static mut требует unsafe и в нормальном коде не встречается (берут OnceLock/Mutex).
tags: [rust, const, static]
```

## derive, Debug, Default

```card
front: Почему println!("{}", my_struct) не компилируется и что делать?
back: "{} требует трейт Display, который пишут руками. Для отладки нужен Debug: добавь #[derive(Debug)] и печатай через {:?} (или {:#?} для многострочного вида). Без Debug структуру ещё и в assert_eq! не использовать."
tags: [rust, debug, derive]
```

```card
front: "Что даёт #[derive(Default)] и синтаксис ..Default::default()?"
back: "Default::default() создаёт структуру из нулевых значений полей (0, false, \"\"). Struct update syntax Config { retries: 5, ..Default::default() } задаёт одно-два поля, остальные берёт из дефолта — замена привычке Go «нулевое значение структуры уже годное»."
tags: [rust, default, struct]
```

## Образцы

```card
front: Что такое guard в match и как выглядит?
back: "Дополнительное условие поверх образца: Msg::Move { x, y } if x == y => ... Ветка срабатывает, только если образец подошёл И условие истинно. Полезно, когда данные вынуты, а решение зависит от их значений."
tags: [rust, match, guard]
```

```card
front: Зачем @ и .. в образцах, и что делает matches!?
back: small @ 0..=9 — проверить диапазон И привязать значение целиком. Msg::Move { x, .. } — «остальные поля не интересуют». matches!(value, Pattern) — булев ответ «подходит ли под образец», без полного match.
tags: [rust, match, patterns]
```

```card
front: Что такое match ergonomics и почему в match по &Msg привязка даёт &String?
back: "При сопоставлении по ссылке Rust автоматически делает привязки ссылками, поэтому Msg::Text(s) даёт s: &String и НЕ забирает строку из значения. Раньше для этого писали ref s — теперь это происходит само."
tags: [rust, match, references]
```
