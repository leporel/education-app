---
id: rust.traits-and-generics.drills
type: drills
title: "Трейты и дженерики — упражнения"
tags: [rust, traits, generics, dyn, drills]
status: todo
updated: 2026-09-08
---

# Упражнения

## Трейты

```drill
type: free-form
prompt: "Объяви трейт Area с методом area(&self) -> f64 и реализуй его для struct Circle { r: f64 }."
answer: "trait Area { fn area(&self) -> f64; } impl Area for Circle { fn area(&self) -> f64 { std::f64::consts::PI * self.r * self.r } }"
check: manual
hint: "Реализация явная: impl Area for Circle."
```

```drill
type: multiple-choice
prompt: "Чем реализация трейта в Rust отличается от интерфейса Go?"
options: ["Ничем", "В Rust она явная (impl Trait for Type), в Go — структурная/неявная", "В Go реализация явная, в Rust нет", "Трейты нельзя реализовать вообще"]
answer: "В Rust она явная (impl Trait for Type), в Go — структурная/неявная"
check: exact
```

```drill
type: multiple-choice
prompt: "Можно ли реализовать стандартный трейт Display для своей структуры Point?"
options: ["Нет, Display чужой", "Да: тип Point твой, правило сиротства соблюдено", "Только через unsafe", "Только для примитивов"]
answer: "Да: тип Point твой, правило сиротства соблюдено"
check: exact
hint: Трейт ИЛИ тип должен быть твой.
```

## Дженерики и bounds

```drill
type: fill-in
prompt: "fn print_all<T: ____>(items: &[T]) — чтобы печатать каждый элемент через {}, нужен bound ____."
answer: "Display"
check: fuzzy
hint: "{} требует Display."
```

```drill
type: free-form
prompt: "Объясни, почему дженерик-функция в Rust не медленнее рукописной, через слово 'мономорфизация'."
answer: "Компилятор мономорфизирует: генерирует отдельную специализированную копию функции под каждый конкретный тип, использованный в коде. Нет боксинга и виртуальных вызовов, вызовы прямые и инлайнятся. Цена — размер бинарника, а не скорость."
check: manual
```

## Static vs dynamic dispatch

```drill
type: multiple-choice
prompt: "Нужно сложить в один Vec фигуры РАЗНЫХ типов (Circle, Square), вызывая area(). Какой тип элемента?"
options: ["Vec<impl Area>", "Vec<Box<dyn Area>>", "Vec<Area>", "Vec<T: Area>"]
answer: "Vec<Box<dyn Area>>"
check: exact
hint: Разнородные типы за общим трейтом → dyn.
```

```drill
type: multiple-choice
prompt: "Что верно про dyn Trait?"
options: ["Быстрее дженериков", "Вызов метода идёт через vtable (динамическая диспетчеризация), нужен указатель", "Хранит ровно один конкретный тип", "Это рефлексия"]
answer: "Вызов метода идёт через vtable (динамическая диспетчеризация), нужен указатель"
check: exact
```

```drill
type: free-form
prompt: "Когда предпочесть dyn Trait статической диспетчеризации? Назови 2 случая."
answer: "1) Гетерогенная коллекция — хранить разные типы за общим трейтом (Vec<Box<dyn T>>). 2) Расширяемость/плагины и/или желание уменьшить размер бинарника и время компиляции (избежать раздувания от мономорфизации). По умолчанию — статика."
check: manual
```

## derive

```drill
type: multiple-choice
prompt: "Хочешь печатать struct через {:?} и класть в HashSet. Какой derive нужен?"
options: ["#[derive(Debug, Hash, PartialEq, Eq)]", "#[derive(Copy)]", "#[derive(Display)]", "Ничего, всё работает само"]
answer: "#[derive(Debug, Hash, PartialEq, Eq)]"
check: exact
hint: Display не derive-ится; для HashSet нужны Hash+Eq.
```

## Дженерики шире функций

```drill
type: free-form
prompt: "Нужен метод print_all у Wrapper<T>, но только когда T умеет печататься через {}. Как оформить?"
answer: "Отдельным impl-блоком с bound: impl<T: std::fmt::Display> Wrapper<T> { fn print_all(&self) { println!(\"{}\", self.inner); } } — метод появится только у тех Wrapper<T>, где T: Display."
check: manual
hint: Условная часть API через impl с bound.
```

```drill
type: fill-in
prompt: "Собрать итератор в вектор, указав тип явно «рыбкой»: iter.collect::<____>()."
answer: "Vec<_>"
check: fuzzy
hint: Турбофиш; _ выводится сам.
```

## Стандартные трейты

```drill
type: multiple-choice
prompt: "Хочешь, чтобы println!(\"{}\", money) работал для своей структуры Money. Что делать?"
options: ["#[derive(Display)]", "Реализовать impl std::fmt::Display for Money руками", "#[derive(Debug)] достаточно", "Ничего, работает само"]
answer: "Реализовать impl std::fmt::Display for Money руками"
check: exact
hint: Display не derive'ится; derive есть только у Debug.
```

```drill
type: free-form
prompt: "Ты реализовал только impl From<u64> for Money. Какие возможности появились бесплатно и почему?"
answer: "Появился Money::from(500u64) и обратная запись let m: Money = 500u64.into(): в std есть blanket implementation, дающая Into<U> для любого T, где есть From<T> for U. Плюс такая конверсия автоматически работает в операторе ? для ошибок."
check: manual
hint: Blanket impl из std.
```

```drill
type: multiple-choice
prompt: "let mut v: Vec<f64> = ...; v.sort(); — почему не компилируется?"
options: ["Vec нельзя сортировать", "sort() требует Ord, а f64 только PartialOrd (из-за NaN); нужен v.sort_by(f64::total_cmp)", "Нужен mut у элементов", "f64 не Clone"]
answer: "sort() требует Ord, а f64 только PartialOrd (из-за NaN); нужен v.sort_by(f64::total_cmp)"
check: exact
hint: «Partial» — это про NaN.
```
