---
id: rust.error-handling.drills
type: drills
title: "Обработка ошибок — упражнения"
tags: [rust, error, result, question-mark, drills]
status: todo
updated: 2026-09-08
---

# Упражнения

## Result и ?

```drill
type: free-form
prompt: "Перепиши с оператором ?: fn load() -> Result<String, std::io::Error> { let r = std::fs::read_to_string(\"f\"); match r { Ok(s) => Ok(s), Err(e) => Err(e) } }"
answer: "fn load() -> Result<String, std::io::Error> { let s = std::fs::read_to_string(\"f\")?; Ok(s) }  — ? пробрасывает Err и разворачивает Ok."
check: manual
hint: "? заменяет match с пробросом."
```

```drill
type: multiple-choice
prompt: "Что делает ? при Err(e)?"
options: ["Паникует", "Делает return Err(e) из текущей функции (с возможной From-конверсией)", "Логирует и продолжает", "Игнорирует ошибку"]
answer: "Делает return Err(e) из текущей функции (с возможной From-конверсией)"
check: exact
hint: Это проброс, не паника.
```

```drill
type: fill-in
prompt: "Чтобы ? мог привести io::Error к MyError, для MyError нужна реализация трейта ____ (или #[from] из thiserror)."
answer: "From<std::io::Error> (трейт From)"
check: fuzzy
hint: "? конвертирует через From."
```

## panic vs error

```drill
type: multiple-choice
prompt: "Файл конфига отсутствует. Что вернуть?"
options: ["panic!(\"нет файла\")", "Result::Err — это ожидаемая восстановимая ситуация", "unwrap()", "process::exit(1) сразу"]
answer: "Result::Err — это ожидаемая восстановимая ситуация"
check: exact
hint: Ожидаемое → значение, не паника.
```

```drill
type: free-form
prompt: "Объясни Go-разработчику, чем граница panic/Result в Rust похожа на panic/error в Go."
answer: "В обоих языках ожидаемые ошибки — это значения (Result / error), а panic — для невосстановимого/багов, и в библиотеках паники избегают. Отличие Rust: оператор ? вместо if err != nil, и Result нельзя молча проигнорировать (#[must_use])."
check: manual
```

```drill
type: multiple-choice
prompt: "Где unwrap() оправдан?"
options: ["В библиотечной функции на горячем пути", "В тесте, где None/Err означал бы провал теста", "В обработчике пользовательского ввода", "Всегда — это удобно"]
answer: "В тесте, где None/Err означал бы провал теста"
check: exact
```

## Свои ошибки

```drill
type: multiple-choice
prompt: "Пишешь переиспользуемую БИБЛИОТЕКУ парсинга. Чем оформить ошибки?"
options: ["anyhow::Error", "thiserror — типизированный enum, чтобы вызывающий различал случаи", "panic на любой проблеме", "возвращать String"]
answer: "thiserror — типизированный enum, чтобы вызывающий различал случаи"
check: exact
hint: Библиотека → типизированные ошибки.
```

```drill
type: free-form
prompt: "В CLI-приложении хочется быстро пробрасывать любые ошибки с пояснениями и падать. Какой крейт и какой метод для контекста?"
answer: "anyhow; метод .context(\"...\") (из трейта Context) добавляет пояснение к ошибке. fn main() -> anyhow::Result<()> позволяет писать ? прямо в main."
check: manual
```

## Обработка на месте

```drill
type: free-form
prompt: "Конфига может не быть — тогда берём дефолт; любая другая ошибка чтения должна пробрасываться наверх. Опиши конструкцию."
answer: "match fs::read_to_string(path) { Ok(s) => Ok(s), Err(e) if e.kind() == ErrorKind::NotFound => Ok(default_config()), Err(e) => Err(e.into()) } — различаем по e.kind(), NotFound обрабатываем, остальное пробрасываем."
check: manual
hint: e.kind() + guard в match.
```

```drill
type: multiple-choice
prompt: "Надо превратить ParseIntError в свою AppError::Invalid перед пробросом через ?. Чем?"
options: [".unwrap()", ".map_err(|_| AppError::Invalid(...))?", ".ok()?", ".expect(\"...\")"]
answer: ".map_err(|_| AppError::Invalid(...))?"
check: exact
hint: map_err меняет ошибку, значение не трогает.
```

```drill
type: fill-in
prompt: "Чтобы увидеть стек вызовов паники, программу запускают с переменной окружения ____=1."
answer: "RUST_BACKTRACE"
check: fuzzy
```

## Паника

```drill
type: multiple-choice
prompt: "Паника в рабочем потоке (не main). Что произойдёт с программой?"
options: ["Процесс сразу упадёт", "Умрёт только этот поток; handle.join() вернёт Err, программа может продолжать", "Паника проигнорируется", "Все потоки перезапустятся"]
answer: "Умрёт только этот поток; handle.join() вернёт Err, программа может продолжать"
check: exact
hint: Паника убивает поток, а не всегда процесс.
```

```drill
type: free-form
prompt: "Го-разработчик спрашивает: «а где здесь recover()?». Что ответить?"
answer: "Прямого аналога в идиоматичном коде нет: catch_unwind существует, но применяется на границах FFI и в надзирателях. Вместо перехвата паники: ожидаемые ошибки возвращают через Result/?, а сбои изолируют по потокам/задачам — упавшая задача отдаёт Err в join()/await, и надзиратель решает, что делать."
check: manual
```
