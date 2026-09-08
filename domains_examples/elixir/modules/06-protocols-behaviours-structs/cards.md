---
id: elixir.protocols-behaviours-structs.cards
type: cards
title: "Структуры, протоколы и behaviours — карточки"
tags: [elixir, structs, protocols, behaviours, cards]
status: todo
updated: 2026-09-08
---

# Карточки

## Структуры

```card
front: Что такое структура в Elixir под капотом?
back: "Мапа с фиксированным набором полей и специальным ключом __struct__ = имя модуля. Определяется defstruct. Даёт: известные поля (опечатка — ошибка компиляции), тег типа для матча %User{}, значения по умолчанию."
tags: [elixir, struct]
```

```card
front: Чем структура Elixir отличается от struct в Go?
back: Неизменяема (обновление = новая копия), без методов внутри (функции в модуле, данные первым аргументом), это всё ещё мапа (is_map → true, работает с Map.*/Enum). Нет тегов полей и embedding — композиция через обычные поля.
tags: [elixir, struct, go]
```

```card
front: Зачем матчить по %User{} в образце?
back: "Тег __struct__ делает образец %User{} совпадающим только со структурой User, а не с любой мапой. Так multi-clause/case различают типы данных: `def f(%User{}), do: ...` сработает только для User."
tags: [elixir, struct, match]
```

## Протоколы

```card
front: Что такое протокол и как выбирается реализация?
back: "Набор функций, чья реализация выбирается ПО ТИПУ ПЕРВОГО АРГУМЕНТА в рантайме. defprotocol объявляет, defimpl ... for: Type реализует. Примеры: Enumerable, Inspect, String.Chars. Полиморфизм по типу ДАННЫХ."
tags: [elixir, protocol]
```

```card
front: Чем протокол Elixir принципиально отличается от интерфейса Go?
back: "Go-интерфейс реализуется неявно типом (если есть методы) и проверяется компилятором. Протокол реализуется ОТДЕЛЬНО (defimpl for: Type), диспетчеризуется в рантайме и может быть добавлен для ЧУЖИХ типов (даже встроенных) без правки их исходников. Это open polymorphism."
tags: [elixir, protocol, go]
```

```card
front: Что делает @derive перед defstruct?
back: "Просит автоматически вывести реализацию протокола для структуры, например @derive {Inspect, only: [:name]} сгенерит реализацию Inspect (печать). Экономит ручной defimpl для типовых протоколов."
tags: [elixir, protocol, derive]
```

```card
front: Что будет, если вызвать протокол для типа без реализации?
back: "Protocol.UndefinedError в рантайме (диспетч поздний). Можно задать @fallback_to_any true и реализацию for: Any как «дефолт для всего остального»."
tags: [elixir, protocol, error]
```

## Behaviours

```card
front: Что такое behaviour и чем отличается от протокола?
back: "Контракт МОДУЛЯ: набор @callback-функций, которые модуль обязан реализовать (@behaviour). Полиморфизм по модулю, не по данным. Протокол — диспетч по типу данных в рантайме; behaviour — «этот модуль реализует контракт» (плагины, стратегии, OTP)."
tags: [elixir, behaviour, protocol]
```

```card
front: Роль @callback, @behaviour и @impl?
back: "@callback name(args) :: ret — объявляет требуемую функцию в модуле-контракте. @behaviour Mod в реализующем модуле включает проверку (забыл колбэк → warning). @impl Mod помечает функцию как реализацию колбэка (компилятор проверит имя/арность). @impl ставить всегда."
tags: [elixir, behaviour, impl]
```

```card
front: Где behaviours встречаются в OTP?
back: GenServer, Supervisor, Application — это behaviours со своими колбэками (init/1, handle_call/3, ...). `use GenServer` + @impl true = реализация behaviour. Фундамент модуля 08.
tags: [elixir, behaviour, otp]
```

## Типы

```card
front: Что такое @spec и обязателен ли он?
back: "Необязательная аннотация типов функции (@spec add(integer, integer) :: integer) для документации, Dialyzer и системы типов. Типы в сигнатурах НЕ пишут; @spec — отдельно. Рекомендуется на публичные функции."
tags: [elixir, spec, types]
```

```card
front: Что ловит set-theoretic типизация Elixir и чего не ловит?
back: "Выводит типы БЕЗ аннотаций и ловит часть ошибок на компиляции (несовместимые матчи, неверные вызовы; с 1.19 — анонимные функции и протоколы). НЕ ловит всё: вывод неполон, многие ошибки по-прежнему в рантайме (MatchError, FunctionClauseError). Это не статика Go."
tags: [elixir, types]
```

```card
front: Что такое Dialyzer?
back: Отдельный статический анализатор (success typing), использует @spec и выводы, находит «невозможные»/несогласованные вызовы. Запускается отдельной командой, не на каждой компиляции. Дополняет встроенную типизацию.
tags: [elixir, dialyzer]
```

## use и структуры

```card
front: "Что делает use GenServer на самом деле?"
back: "Компилятор делает require GenServer и вызывает макрос GenServer.__using__/1, а возвращённый им код вставляется в твой модуль: @behaviour GenServer, дефолтные реализации колбэков и child_spec/1. Это генерация кода на компиляции, а не наследование."
tags: [elixir, use, macro]
```

```card
front: "Как написать свой use?"
back: "Объявить в модуле макрос defmacro __using__(_opts) do quote do ... end end — всё, что внутри quote, окажется в модуле, который напишет use MyMod. quote — это «код как данные». Не понимаешь чужой use — открой его __using__, там обычный Elixir."
tags: [elixir, use, using]
```

```card
front: "Почему user[:name] падает, если user — структура?"
back: "Структуры по умолчанию не реализуют протокол Access, который отвечает за доступ по скобкам. Работают строгий user.name и Map.get(user, :name). Это отличие структуры от обычной мапы, хотя is_map(%User{}) и даёт true."
tags: [elixir, struct, access]
```

```card
front: "Что делает @enforce_keys?"
back: "Список полей, без которых структуру нельзя СОЗДАТЬ: %User{age: 30} при @enforce_keys [:name] бросит ArgumentError. Это проверка обязательности при создании, а не проверка типов; спасает от nil, всплывающего где-то дальше по коду."
tags: [elixir, struct, enforce-keys]
```

```card
front: "Как превратить структуру в голую мапу и обратно?"
back: "Map.from_struct(%User{...}) убирает ключ __struct__ и отдаёт обычную мапу (удобно перед сериализацией). Обратно — struct!(User, %{name: \"Сэм\"}) (с проверкой ключей) или struct/2 (мягкий вариант)."
tags: [elixir, struct, map]
```

## Протокол vs behaviour простыми словами

```card
front: "Протокол и behaviour — объясни разницу без терминов."
back: "Протокол — это глагол, который умеют разные ДАННЫЕ («покажи себя», «посчитай размер»): объявляем один раз, а как его выполняет каждый тип — рассказываем отдельно через defimpl. Behaviour — вакансия для МОДУЛЯ: список обязанностей (@callback), на которую можно нанять любой модуль, который их выполняет. В Go обе роли играет интерфейс."
tags: [elixir, protocol, behaviour]
```
