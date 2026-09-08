---
id: rust.collections-iterators-closures.drills
type: drills
title: "Коллекции, итераторы и замыкания — упражнения"
tags: [rust, collections, iterators, closures, drills]
status: todo
updated: 2026-09-08
---

# Упражнения

## Коллекции

```drill
type: multiple-choice
prompt: "Безопасный доступ к элементу Vec, который вернёт None при выходе за границы?"
options: ["v[i]", "v.get(i)", "v.at(i)", "v.index(i)"]
answer: "v.get(i)"
check: exact
hint: get → Option<&T>, [] паникует.
```

```drill
type: free-form
prompt: "Есть HashMap<String, i32> counts. Увеличь счётчик для ключа \"a\" на 1, создав запись с 0, если её нет."
answer: "*counts.entry(\"a\".to_string()).or_insert(0) += 1; — entry API: or_insert вставит 0, если ключа нет, и вернёт &mut к значению."
check: manual
hint: entry().or_insert().
```

```drill
type: multiple-choice
prompt: "Почему s[0] для String s не компилируется?"
options: ["String нельзя индексировать байтом — UTF-8, символ может быть многобайтным", "Нужно s.0", "Индексация только с usize-переменной", "Это работает, ошибки нет"]
answer: "String нельзя индексировать байтом — UTF-8, символ может быть многобайтным"
check: exact
hint: .chars().next() для первого символа.
```

## Итераторы

```drill
type: free-form
prompt: "Дано nums: Vec<i32>. Получи сумму квадратов чётных чисел одним конвейером итераторов."
answer: "let s: i32 = nums.iter().filter(|&&x| x % 2 == 0).map(|&x| x * x).sum();"
check: manual
hint: filter → map → sum.
```

```drill
type: multiple-choice
prompt: "let it = v.iter().map(|x| x*2); — что вычислится в этой строке?"
options: ["Удвоенный вектор", "Ничего: итераторы ленивы, нужна терминальная операция (collect/sum/for)", "Сумма элементов", "Ошибка"]
answer: "Ничего: итераторы ленивы, нужна терминальная операция (collect/sum/for)"
check: exact
hint: map — адаптер, не терминал.
```

```drill
type: free-form
prompt: "for s in v { ... } где v: Vec<String>, а после цикла нужен v. Что не так и как починить?"
answer: "for s in v вызывает into_iter() и забирает владение v — после цикла v потрачен (ошибка при использовании). Починка: for s in &v (это iter(), заём), v остаётся валиден."
check: manual
hint: &v вместо v.
```

```drill
type: multiple-choice
prompt: "Нужно изменить каждый элемент Vec на месте (удвоить). Какой итератор?"
options: ["v.iter()", "v.iter_mut() с *x *= 2", "v.into_iter()", "v.get()"]
answer: "v.iter_mut() с *x *= 2"
check: exact
hint: Изменяемый заём элементов.
```

## Замыкания

```drill
type: multiple-choice
prompt: "let mut n=0; let f = || n += 1; — какой это трейт замыкания?"
options: ["Fn", "FnMut (меняет захваченное n)", "FnOnce", "никакой"]
answer: "FnMut (меняет захваченное n)"
check: exact
hint: Меняет окружение → FnMut.
```

```drill
type: free-form
prompt: "Замыкание нужно передать в новый поток (thread::spawn). Почему обычно требуется move и что оно делает?"
answer: "move заставляет замыкание забрать ВЛАДЕНИЕ захваченными переменными вместо заёма. Поток может пережить текущую область, поэтому одолженные ссылки были бы невалидны; move переносит данные в замыкание, и они живут вместе с ним."
check: manual
hint: Заём не переживёт область — нужен перенос владения.
```

## String и &str

```drill
type: multiple-choice
prompt: "Функция должна принимать и String, и литерал, и срез строки. Какой параметр?"
options: ["s: String", "s: &String", "s: &str", "s: Vec<char>"]
answer: "s: &str"
check: exact
hint: "&String сужает без причины."
```

```drill
type: free-form
prompt: "Почему \"привет\".len() == 12, и как получить 6?"
answer: "len() возвращает число байтов, а кириллица в UTF-8 занимает по 2 байта на символ. Число символов: \"привет\".chars().count() == 6 (проход по строке, O(n))."
check: manual
hint: UTF-8 — переменная длина.
```

## collect

```drill
type: free-form
prompt: "Дан Vec<&str> строк-чисел. Напиши вариант «падать на первой ошибке» и вариант «пропускать мусор»."
answer: "Падать: let r: Result<Vec<i32>, _> = raw.iter().map(|s| s.parse::<i32>()).collect(); Пропускать: let ok: Vec<i32> = raw.iter().filter_map(|s| s.parse::<i32>().ok()).collect();"
check: manual
hint: collect в Result vs filter_map + ok().
```

```drill
type: multiple-choice
prompt: "Нужен перебор словаря в порядке возрастания ключей. Что взять?"
options: ["HashMap — он и так упорядочен", "BTreeMap (или собрать ключи в Vec и отсортировать)", "HashSet", "VecDeque"]
answer: "BTreeMap (или собрать ключи в Vec и отсортировать)"
check: exact
hint: Порядок HashMap не определён, как и в Go.
```

```drill
type: fill-in
prompt: "Заранее выделить память под 1000 элементов: let v = Vec::____(1000);"
answer: "with_capacity"
check: fuzzy
hint: Аналог make([]T, 0, 1000).
```
