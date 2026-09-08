---
id: rust.collections-iterators-closures.cards
type: cards
title: "Коллекции, итераторы и замыкания — карточки"
tags: [rust, collections, iterators, closures, cards]
status: todo
updated: 2026-09-08
---

# Карточки

## Коллекции

```card
front: Vec<T> vs срез Go []T?
back: Vec<T> владеет растущим буфером в куче (как []T, но с владением). Срез Rust &[T] — это заём, не владелец. v[i] паникует при выходе за границы; v.get(i) -> Option<&T> — безопасный доступ.
tags: [rust, vec]
```

```card
front: Чем доступ к HashMap в Rust безопаснее, чем map в Go?
back: "scores.get(k) возвращает Option<&V>: нет ключа → None, нельзя спутать с «значение есть и оно ноль». В Go m[k] молча даёт нулевое значение, нужен v, ok := m[k]. entry(k).or_insert(d) — идиоматичный get-or-create без двойного поиска."
tags: [rust, hashmap]
```

```card
front: String vs &str и почему s[0] запрещено?
back: "String — владеющая растущая UTF-8 строка в куче; &str — заём (срез), в т.ч. литералы. Индексация s[0] запрещена: строки UTF-8, символ может быть многобайтным. Перебор: .chars() (символы) или .bytes() (байты)."
tags: [rust, string, str]
```

## Итераторы

```card
front: Что значит «итераторы ленивы»?
back: Адаптеры (map, filter, ...) ничего не вычисляют — только строят конвейер. Исполнение начинается на терминальной операции (collect, sum, fold, for). Забыл терминал — предупреждение «unused iterator that must be used».
tags: [rust, iterators, lazy]
```

```card
front: Почему конвейер итераторов zero-cost?
back: Компилятор разворачивает цепочку filter().map().sum() в один плотный цикл без промежуточных аллокаций и временных векторов. Скорость как у рукописного цикла — абстракция, за которую не платишь.
tags: [rust, iterators, zero-cost]
```

```card
front: iter() vs iter_mut() vs into_iter()?
back: iter() → &T (заём, коллекция цела). iter_mut() → &mut T (правим на месте, нужен mut). into_iter() → T (забирает владение, коллекция израсходована). for x in v == into_iter (теряет v!); for x in &v == iter.
tags: [rust, iterators, ownership]
```

```card
front: "Ловушка: for x in v против for x in &v?"
back: for x in v вызывает into_iter() и ЗАБИРАЕТ владение v — после цикла v использовать нельзя. for x in &v — это iter(), заём, v остаётся. Очень частая ошибка новичка.
tags: [rust, iterators, pitfall]
```

## Замыкания

```card
front: Три трейта замыканий и чем отличаются?
back: Fn — захват по & (только читает), вызывается многократно, шарится. FnMut — захват по &mut (меняет окружение), многократно. FnOnce — захват по значению (move, потребляет), вызывается один раз. Компилятор выбирает слабейший подходящий.
tags: [rust, closures, fn-traits]
```

```card
front: Что делает ключевое слово move перед замыканием?
back: Заставляет замыкание ЗАБРАТЬ владение захваченными переменными (а не одолжить). Нужно, когда замыкание переживает текущую область — передаётся в поток (thread::spawn) или async-задачу. Без move оно бы заимствовало, и заём не пережил бы область.
tags: [rust, closures, move]
```

```card
front: Зачем Rust три трейта замыканий, а Go обходится func-литералом?
back: Rust отслеживает владение/заём и внутри замыканий. Fn = «только читаю, можно шарить/звать параллельно», FnMut = «меняю состояние», FnOnce = «потребляю». Это позволяет безопасно решать, можно ли отдать замыкание в несколько потоков. В Go таких гарантий в типе нет.
tags: [rust, closures, why]
```

```card
front: Как функция принимает замыкание как параметр?
back: "Через bound на Fn-трейт: fn apply<F: Fn(i32) -> i32>(f: F, x: i32) -> i32 { f(x) }. Или FnMut/FnOnce по потребности. Можно и dyn: Box<dyn Fn(i32) -> i32> для динамического хранения."
tags: [rust, closures, generics]
```

## String и &str

```card
front: Какой тип брать в параметре функции, в поле структуры и в возвращаемом значении?
back: Параметр — &str (принимает String через deref coercion, литерал и срез). Поле структуры — String (владеть проще, чем тащить lifetime). Возврат — String, если строку создала функция; &str только если она заимствована из аргумента или self.
tags: [rust, string, str]
```

```card
front: Что вернёт "привет".len() и как посчитать символы?
back: "12 — len() считает БАЙТЫ, а строки в UTF-8. Символы: \"привет\".chars().count() == 6, и это O(n). Доступа «к i-му символу» за одно действие нет; если он нужен часто — бери Vec<char>."
tags: [rust, string, utf8]
```

```card
front: Три способа получить String из &str и один — обратно?
back: "s.to_string(), String::from(s), s.to_owned() (все аллоцируют). Обратно без аллокации: &s, s.as_str(), &s[..]."
tags: [rust, string, conversion]
```

## collect и коллекции

```card
front: Как одной строкой распарсить Vec<&str> в Vec<i32> так, чтобы первая ошибка прервала всё?
back: "let parsed: Result<Vec<i32>, _> = raw.iter().map(|s| s.parse::<i32>()).collect(); — collect умеет «выворачивать» коллекцию Result'ов в Result коллекции. Если плохие элементы надо просто выбросить: filter_map(|s| s.parse().ok())."
tags: [rust, iterators, collect, result]
```

```card
front: Во что ещё, кроме Vec, умеет собирать collect?
back: В String, HashMap, HashSet, BTreeMap, VecDeque — в любой тип с FromIterator; целевой тип берётся из аннотации (или турбофиша collect::<Vec<_>>()). Плюс в Result<Coll, E> / Option<Coll>.
tags: [rust, collect]
```

```card
front: Когда брать BTreeMap вместо HashMap, и что с порядком перебора?
back: "Порядок перебора HashMap не определён и меняется между запусками (как в Go). BTreeMap упорядочен по ключу: стабильный перебор и запросы по диапазону, ценой чуть более медленного поиска. Альтернатива — собрать ключи в Vec и отсортировать."
tags: [rust, hashmap, btreemap]
```

```card
front: Зачем Vec::with_capacity(n)?
back: "Vec растёт удвоением: при исчерпании ёмкости выделяется новый буфер и данные копируются. Если размер известен заранее, with_capacity(n) (аналог make([]T, 0, n) в Go) убирает перевыделения. В Rust момент аллокации виден в коде."
tags: [rust, vec, capacity]
```
