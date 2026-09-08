---
id: rust.error-handling.cards
type: cards
title: "Обработка ошибок — карточки"
tags: [rust, error, result, question-mark, panic, cards]
status: todo
updated: 2026-09-08
---

# Карточки

## Result vs Go

```card
front: Чем Result<T,E> упакован иначе, чем пара (значение, err) в Go?
back: "Это один enum-сумм: либо Ok(T), либо Err(E), но не оба. До значения нельзя добраться, не разобрав ошибку. В Go возвращаются два значения, и язык не мешает использовать результат, забыв проверить err."
tags: [rust, result]
```

```card
front: Result можно молча проигнорировать, как err в Go?
back: "Труднее: Result помечен #[must_use], игнор результата даёт предупреждение компилятора. В Go забыть проверку err легко."
tags: [rust, result, must-use]
```

## Оператор ?

```card
front: Что делает expr? в функции, возвращающей Result?
back: Если expr == Ok(v) — разворачивает в v и продолжает. Если Err(e) — немедленно return Err(e) из функции. Заменяет ручной if err != nil { return err } одним символом, поток остаётся явным.
tags: [rust, question-mark]
```

```card
front: "? и конвертация ошибок — как разные ошибки попадают в общий тип?"
back: "? приводит ошибку к типу ошибки функции через трейт From. Если есть From< io::Error> for MyError, можно ? пробрасывать io::Error в функции, возвращающей Result<_, MyError>. thiserror #[from] и anyhow дают это автоматически."
tags: [rust, question-mark, from]
```

```card
front: Работает ли ? на Option?
back: "Да: на None оператор ? делает ранний return None из функции (которая должна возвращать Option). Пример: let c = s.chars().next()?;"
tags: [rust, question-mark, option]
```

```card
front: Как конвертировать Option<T> в Result и обратно?
back: "Option→Result: opt.ok_or(err) или ok_or_else(|| err). Result→Option: res.ok() (теряет причину ошибки). Это позволяет смешивать ? в одной функции под нужный возвращаемый тип."
tags: [rust, option, result, convert]
```

## panic vs error

```card
front: Где Result/Option, а где panic!?
back: "Result/Option — ожидаемые восстановимые ошибки (нет файла, кривой ввод, юзер не найден): вызывающий обрабатывает. panic! — невосстановимое/нарушенный инвариант («такого не должно быть»): разворачивает стек и роняет поток."
tags: [rust, panic]
```

```card
front: Что такое unwrap()/expect() по сути и где уместны?
back: "Запрос паники: «дай значение или паникуй» на None/Err. Уместны в тестах, прототипах и где Err/None логически невозможен (expect документирует почему). В проде — ?/match/комбинаторы."
tags: [rust, unwrap, panic]
```

## Свои ошибки

```card
front: thiserror vs anyhow — когда что?
back: "thiserror — для БИБЛИОТЕК: derive-макрос генерирует Display/Error/From для типизированного enum ошибок, чтобы вызывающий различал случаи. anyhow — для ПРИЛОЖЕНИЙ: один тип anyhow::Error проглотит любую ошибку + .context(), когда важно «сообщить и упасть»."
tags: [rust, thiserror, anyhow]
```

```card
front: Что генерирует #[derive(Error)] из thiserror и зачем #[from]?
back: Реализации Display (из #[error(\"...\")]) и std::error::Error для твоего enum. #[from] на поле генерирует From-конверсию (напр. io::Error -> твоя ошибка), чтобы ? пробрасывал её автоматически.
tags: [rust, thiserror]
```

```card
front: Как main может пользоваться ? напрямую?
back: Объявить fn main() -> Result<(), Box<dyn std::error::Error>>. Тогда внутри можно писать ?, а Err завершит программу с ненулевым кодом и печатью ошибки. Box<dyn Error> — «любая ошибка с трейтом Error».
tags: [rust, main, result]
```

## Обработка на месте

```card
front: Как в Rust различить «файла нет» и другие io-ошибки?
back: "По e.kind(): match fs::read_to_string(p) { Err(e) if e.kind() == ErrorKind::NotFound => ..., ... }. Это аналог errors.Is(err, os.ErrNotExist) из Go. Для своего enum-типа ошибки — обычный исчерпывающий match по вариантам."
tags: [rust, error, errorkind]
```

```card
front: Четыре частых комбинатора на Result и что делают?
back: unwrap_or(default) — значение или дефолт; unwrap_or_default() — «нуль своего типа»; unwrap_or_else(|e| ...) — дефолт с обработкой ошибки (напр. лог); map_err(|e| ...) — заменить/обогатить ошибку перед ? ; and_then(f) — цепочка, где следующий шаг тоже может упасть.
tags: [rust, result, combinators]
```

```card
front: Откуда берётся блок «Caused by:» при печати ошибки?
back: "Из цепочки причин: трейт std::error::Error отдаёт причину через source(), а anyhow/thiserror печатают её списком. Аналог обёртки fmt.Errorf(\"...: %w\", err) в Go, только цепочка строится сама, а .context(\"...\") добавляет человеческий слой."
tags: [rust, error, anyhow]
```

```card
front: Как избавиться от гирлянды unwrap() в тесте?
back: "Дать тесту возвращаемый тип Result: #[test] fn t() -> Result<(), Box<dyn std::error::Error>> { let n: i32 = \"42\".parse()?; assert_eq!(n, 42); Ok(()) } — внутри теста работает ?."
tags: [rust, tests, result]
```

## Паника изнутри

```card
front: Что происходит при панике по шагам?
back: 1) Печатается сообщение и место. 2) Раскрутка стека (unwinding) с вызовом drop у всех живых значений — файлы/замки освобождаются. 3) Умирает паникующий поток; если это main — процесс выходит с кодом 101, иначе handle.join() вернёт Err.
tags: [rust, panic]
```

```card
front: Как увидеть стек вызовов паники и что делает panic = "abort"?
back: "RUST_BACKTRACE=1 cargo run печатает backtrace. [profile.release] panic = \"abort\" в Cargo.toml отключает раскрутку: бинарник меньше и быстрее, но drop'ы не вызываются и панику нельзя перехватить."
tags: [rust, panic, tooling]
```

```card
front: catch_unwind — это Rust-аналог try/catch?
back: Нет. Он существует для границ FFI и серверов-надзирателей, но панику не «обрабатывают» — её не допускают. Ожидаемые ошибки идут через Result; изоляция сбоев делается по потокам/задачам (упавшая задача отдаёт Err в join/await).
tags: [rust, panic, recover]
```
