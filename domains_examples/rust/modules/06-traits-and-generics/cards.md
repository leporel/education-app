---
id: rust.traits-and-generics.cards
type: cards
title: "Трейты и дженерики — карточки"
tags: [rust, traits, generics, dyn, cards]
status: todo
updated: 2026-09-08
---

# Карточки

## Трейты vs интерфейсы Go

```card
front: Три главных отличия трейта Rust от интерфейса Go?
back: 1) Реализация ЯВНАЯ (impl Trait for Type), не структурная как в Go. 2) Можно задать методы по умолчанию в трейте. 3) Можно реализовать чужой трейт для своего типа (и наоборот), с правилом сиротства.
tags: [rust, traits, go]
```

```card
front: Что такое правило сиротства (orphan rule)?
back: Реализовать трейт можно, только если трейт ИЛИ тип объявлены в твоём крейте. Нельзя реализовать чужой трейт для чужого типа (иначе конфликты реализаций между крейтами). Обход — newtype-обёртка struct My(TheirType).
tags: [rust, traits, orphan]
```

## Дженерики и bounds

```card
front: Что такое trait bound и как записать «T умеет Display и сравниваться»?
back: "Ограничение на дженерик-параметр: какие трейты тип обязан реализовывать. fn f<T: Display + PartialOrd>(x: T) или через where: fn f<T>(x: T) where T: Display + PartialOrd. Аналог constraints в дженериках Go."
tags: [rust, generics, bounds]
```

```card
front: Что такое мономорфизация и почему дженерики Rust бесплатны?
back: Компилятор генерирует отдельную копию функции под каждый конкретный тип (announce::<i32>, announce::<String>). Нет боксинга, рантайм-приведений и виртуальных вызовов — скорость как у рукописного кода. Цена — размер бинарника.
tags: [rust, monomorphization]
```

```card
front: Чем дженерики Rust отличаются от any/дженериков Go по реализации?
back: Rust всегда мономорфизирует (быстрее в рантайме, дороже компиляция/размер). Go с any боксирует и теряет тип до рантайма; даже дженерики Go частично используют словари методов. dyn в Rust — ближайший аналог интерфейс-значения Go.
tags: [rust, generics, go]
```

## Static vs dynamic dispatch

```card
front: impl Trait vs dyn Trait — в чём разница?
back: "impl Trait/дженерик — статическая диспетчеризация: один конкретный тип, прямой вызов, мономорфизация, максимум перфа. dyn Trait — динамическая: trait object с vtable, можно хранить РАЗНЫЕ типы за общим трейтом, вызов косвенный (чуть медленнее), нужен указатель (Box/&)."
tags: [rust, dispatch]
```

```card
front: Почему Vec<Box<dyn Greet>> можно, а Vec<impl Greet> с разными типами — нет?
back: impl Greet — это ОДИН конкретный тип (выведенный), все элементы должны быть им. dyn Greet — trait object фиксированного размера (жирный указатель), за ним прячутся разные типы. Гетерогенная коллекция требует dyn.
tags: [rust, dyn, vec]
```

```card
front: Что такое trait object физически и почему нужен указатель?
back: "dyn Trait — жирный указатель: данные + указатель на vtable (таблицу методов). Размер конкретного типа неизвестен на компиляции, поэтому хранят за указателем (Box<dyn>/&dyn). Вызов метода идёт через vtable."
tags: [rust, dyn, vtable]
```

```card
front: "Правило по умолчанию: дженерики или dyn?"
back: "По умолчанию — дженерики/impl Trait (статика, бесплатно). dyn — осознанно: гетерогенные коллекции, плагины/расширяемость, или ради меньшего бинарника/времени компиляции."
tags: [rust, dispatch, rule]
```

## derive и associated types

```card
front: Что делает #[derive(Debug, Clone, PartialEq)] и это рантайм-рефлексия?
back: Компилятор генерирует реализации этих трейтов на этапе компиляции (макрос), zero-cost — не рефлексия. Debug → {:?}, Clone → .clone(), PartialEq → ==. Крейты добавляют свои derive (Serialize, Error).
tags: [rust, derive]
```

```card
front: Что такое associated type на примере Iterator?
back: Связанный тип трейта, задаваемый реализацией один раз. trait Iterator { type Item; fn next(&mut self) -> Option<Self::Item>; }. Для счётчика Item=u32, для строк Item=char. Чище, чем таскать параметр Iterator<Item> повсюду.
tags: [rust, associated-type]
```

## Мономорфизация и vtable

```card
front: Объясни мономорфизацию и vtable через «два честных способа» скомпилировать дженерик.
back: "(а) Размножить: выпустить отдельную копию функции под каждый конкретный тип — прямые инлайнящиеся вызовы, но больше кода (мономорфизация, дженерики/impl Trait). (б) Приложить справочник: одна функция получает данные + таблицу адресов методов (vtable) — вызов косвенный, зато типы можно смешивать (dyn Trait). Go для интерфейсов всегда использует (б)."
tags: [rust, monomorphization, vtable]
```

```card
front: Что такое жирный указатель (fat pointer)?
back: Указатель плюс ещё одно слово рядом. У &dyn Trait это адрес данных + адрес vtable; у &[T] — адрес + длина. Поэтому dyn-значения нельзя хранить «голыми» — их держат за Box/&.
tags: [rust, dyn, pointer]
```

## Дженерики шире функций

```card
front: "Что означают три разных impl-блока: impl<T> W<T>, impl<T: Display> W<T>, impl W<u32>?"
back: Первый — методы для любого T. Второй — методы, появляющиеся только когда T умеет Display (условная часть API). Третий — методы только у W<u32>. Так устроен и Option в std (copied только для Option<&T>, flatten только для Option<Option<T>>).
tags: [rust, generics, impl]
```

```card
front: Что такое турбофиш и когда он нужен?
back: "Синтаксис ::<> для явного указания типа-параметра: \"42\".parse::<i32>(), iter.collect::<Vec<_>>(), Vec::<u8>::new(). Нужен, когда компилятор не может вывести тип сам; _ внутри означает «этот выведи»."
tags: [rust, generics, turbofish]
```

## Стандартные трейты

```card
front: Debug vs Display — чем отличаются и что можно derive?
back: "Debug — отладочный вывод {:?}, генерируется через #[derive(Debug)]. Display — человеческий вывод {} и метод .to_string(); derive'ом НЕ получить, пишется руками (как показать тип человеку — решение автора)."
tags: [rust, display, debug]
```

```card
front: Что такое blanket implementation и какой подарок она даёт?
back: "Реализация «для всех типов с некоторым свойством», записанная в std один раз: impl<T: Display> ToString for T. Поэтому, написав Display, ты бесплатно получаешь .to_string(); написав From<X> for Y — получаешь x.into(). В Go такого механизма нет."
tags: [rust, traits, blanket]
```

```card
front: Почему PartialEq/PartialOrd называются «частичными»?
back: "Из-за плавающей точки: NaN != NaN, и для NaN не определены < и >. Значит равенство и порядок у f64 определены не для всех значений. Eq/Ord — «настоящие» равенство и полный порядок (i32, String). Следствие: f64 нельзя ключом HashMap и нельзя v.sort() — нужен v.sort_by(f64::total_cmp)."
tags: [rust, eq, ord, float]
```

```card
front: Любой ли трейт можно использовать как dyn Trait?
back: "Нет, нужна dyn-совместимость (object safety): в трейте не должно быть дженерик-методов и методов, возвращающих Self. Иначе компилятор скажет «the trait cannot be made into an object». Обход — отдельный «объектный» трейт-фасад над обобщённым."
tags: [rust, dyn, object-safety]
```
