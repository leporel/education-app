---
id: elixir.protocols-behaviours-structs.drills
type: drills
title: "Структуры, протоколы и behaviours — упражнения"
tags: [elixir, structs, protocols, behaviours, drills]
status: todo
updated: 2026-09-08
---

# Упражнения

## Структуры

```drill
type: multiple-choice
prompt: "defstruct name: \"\", age: 0. Что вернёт is_map(%User{})?"
options: ["false — структура это отдельный тип", "true — структура это мапа с ключом __struct__", "ошибку", "nil"]
answer: "true — структура это мапа с ключом __struct__"
check: exact
hint: Под капотом структура — мапа со специальным тегом типа.
```

```drill
type: free-form
prompt: "Зачем матчить `def role(%User{admin: true}), do: :admin` через тег структуры, а не просто `%{admin: true}`?"
answer: "Образец %User{} совпадёт ТОЛЬКО со структурой User, тогда как %{admin: true} совпал бы с любой мапой, где admin == true (например с %Account{} или сырым JSON-мапом). Тег __struct__ даёт типобезопасный диспетч по конкретному типу данных."
check: manual
```

```drill
type: multiple-choice
prompt: "У структуры User поля name, age. Что произойдёт при `%User{nick: \"x\"}`?"
options: ["Создастся структура с лишним полем nick", "Ошибка компиляции/KeyError: поля структуры фиксированы", "nick станет nil", "Молча проигнорируется"]
answer: "Ошибка компиляции/KeyError: поля структуры фиксированы"
check: exact
hint: Это и есть страховка структур против опечаток в полях.
```

## Протоколы

```drill
type: multiple-choice
prompt: "Главное отличие протокола Elixir от интерфейса Go?"
options: ["Протокол быстрее", "Протокол реализуется отдельно (defimpl for: Type), диспетчеризуется в рантайме и может быть добавлен для ЧУЖИХ типов", "Протокол проверяется компилятором как Go-интерфейс", "Никакого отличия"]
answer: "Протокол реализуется отдельно (defimpl for: Type), диспетчеризуется в рантайме и может быть добавлен для ЧУЖИХ типов"
check: exact
hint: Open polymorphism vs неявная реализация типом.
```

```drill
type: free-form
prompt: "Напиши протокол Sizeable с функцией size/1 и реализуй его для List и для BitString (строк). Объясни, как выбирается реализация."
answer: "defprotocol Sizeable do\n  def size(value)\nend\ndefimpl Sizeable, for: List do\n  def size(list), do: length(list)\nend\ndefimpl Sizeable, for: BitString do\n  def size(s), do: byte_size(s)\nend\nРеализация выбирается в рантайме по типу первого аргумента: для списка вызовется List-реализация, для строки — BitString. Нет реализации для типа → Protocol.UndefinedError."
check: manual
```

```drill
type: fill-in
prompt: "Чтобы автоматически вывести реализацию протокола Inspect для структуры, показывающую только поле name, перед defstruct пишут `@____ {Inspect, only: [:name]}`."
answer: "derive"
check: fuzzy
hint: Автогенерация реализации протокола.
```

## Behaviours

```drill
type: multiple-choice
prompt: "Что объявляет `@callback parse(String.t()) :: {:ok, term()} | {:error, term()}`?"
options: ["Реализацию функции parse", "Требование к модулю-реализатору behaviour: он обязан реализовать parse/1 с такой подписью", "Протокол для строк", "Спецификацию приватной функции"]
answer: "Требование к модулю-реализатору behaviour: он обязан реализовать parse/1 с такой подписью"
check: exact
hint: "@callback — пункт контракта behaviour."
```

```drill
type: free-form
prompt: "Зачем ставить @impl на функции, реализующие колбэки behaviour? Что сломается без него?"
answer: "@impl Mod (или @impl true) говорит компилятору «это реализация колбэка»; компилятор проверит, что такой колбэк есть и имя/арность согласуются. Без @impl опечатка в имени или неверная арность пройдёт молча — функция не будет считаться реализацией колбэка, а warning о «нереализованном колбэке» собьёт с толку. @impl даёт раннюю проверку."
check: manual
```

```drill
type: multiple-choice
prompt: "Что из перечисленного — behaviour, а не протокол?"
options: ["Enumerable", "Inspect", "GenServer", "String.Chars"]
answer: "GenServer"
check: exact
hint: GenServer/Supervisor/Application — behaviours (контракт модуля с колбэками).
```

## Протокол vs behaviour

```drill
type: free-form
prompt: "Тебе нужно: (а) уметь печатать любой свой тип данных единообразно; (б) подключать разные модули-парсеры (JSON/CSV) под общий контракт. Что выбрать под каждый случай и почему?"
answer: "(а) Протокол: полиморфизм по типу ДАННЫХ — одно действие (печать) для разных типов значений, диспетч по типу в рантайме, реализации через defimpl. (б) Behaviour: полиморфизм по МОДУЛЮ — общий контракт parse/1 + extensions/0, который реализуют JSONParser, CSVParser; модуль выбираешь/передаёшь сам. Протокол — «разные данные, одно действие»; behaviour — «разные модули, один контракт»."
check: manual
```

## Типы

```drill
type: multiple-choice
prompt: "Как корректно описать @spec и систему типов Elixir?"
options: ["@spec обязателен, иначе не компилируется", "@spec необязателен; реальную проверку дают выводимая set-theoretic типизация (частично, автоматически) и Dialyzer (отдельно)", "@spec — это статическая типизация уровня Go", "Типы пишут прямо в сигнатуре функции"]
answer: "@spec необязателен; реальную проверку дают выводимая set-theoretic типизация (частично, автоматически) и Dialyzer (отдельно)"
check: exact
hint: Аннотации декларативны; вывод неполон; многое всё ещё в рантайме.
```

## use

```drill
type: multiple-choice
prompt: "Что происходит при use GenServer?"
options: ["Модуль наследуется от GenServer", "Вызывается макрос GenServer.__using__/1, и возвращённый им код вставляется в твой модуль (@behaviour, дефолтные колбэки, child_spec/1)", "Подключается библиотека во время выполнения", "Ничего, это просто комментарий для читателя"]
answer: "Вызывается макрос GenServer.__using__/1, и возвращённый им код вставляется в твой модуль (@behaviour, дефолтные колбэки, child_spec/1)"
check: exact
hint: "Генерация кода на компиляции, не наследование."
```

```drill
type: free-form
prompt: "Тебе непонятно, что приносит в модуль чужой use SomeLib. Как это выяснить?"
answer: "Открыть исходник SomeLib и найти макрос __using__/1: всё, что он возвращает внутри quote, и вставляется в модуль (импорты, @behaviour, функции, атрибуты). Это обычный Elixir-код, читаемый глазами; никакой скрытой магии рантайма там нет."
check: manual
```

## Структуры

```drill
type: multiple-choice
prompt: "user = %User{name: \"Сэм\"}. Какое обращение НЕ сработает?"
options: ["user.name", "Map.get(user, :name)", "user[:name]", "%User{name: n} = user"]
answer: "user[:name]"
check: exact
hint: "Структуры не реализуют протокол Access."
```

```drill
type: fill-in
prompt: "Чтобы структуру нельзя было создать без поля :name, перед defstruct пишут @____ [:name]."
answer: "enforce_keys"
check: fuzzy
```

```drill
type: free-form
prompt: "Нужно отдать структуру во внешний JSON-сериализатор, который ждёт обычную мапу. Что сделать?"
answer: "Map.from_struct(user) — уберёт служебный ключ __struct__ и вернёт обычную мапу с полями. Обратная операция при разборе входных данных — struct!(User, map) (с проверкой ключей) или struct/2."
check: manual
```
