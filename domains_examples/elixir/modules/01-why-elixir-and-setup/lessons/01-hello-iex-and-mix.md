---
id: elixir.why-elixir-and-setup.lesson-01
type: lesson
title: "Урок 01 — Первая программа: iex и mix"
tags: [elixir, setup, iex, mix, lesson]
status: todo
updated: 2026-06-26
---

# Урок 01 — Первая программа: iex и mix

Цель: поставить Elixir, пощупать `iex` как живой REPL, собрать первый `mix`-проект и
прогнать тест. К концу у тебя рабочее окружение и ощущение тулинга «как в Go, только REPL».

## Шаг 0. Установка

Поставь **Erlang/OTP сначала, Elixir потом**. Самый беспроблемный путь — менеджер версий:

```bash
# вариант с mise (или asdf — синтаксис похож)
mise use -g erlang@27
mise use -g elixir@1.19

elixir --version
# Erlang/OTP 27 [...]
# Elixir 1.19.x (compiled with Erlang/OTP 27)
```

Если версия Elixir < 1.19 или OTP < 27 — обнови, мы опираемся на свежий компилятор и
проверки типов. На Windows/macOS можно и официальными сборщиками с elixir-lang.org, но
менеджер версий избавит от рассинхрона Erlang↔Elixir.

## Шаг 1. iex как песочница

Запусти `iex` и поиграй. REPL вычисляет выражения сразу:

```elixir
iex> 40 + 2
42
iex> "Go" <> "+" <> "Elixir"        # <> — конкатенация строк (бинарей)
"Go+Elixir"
iex> name = "мир"                   # пока выглядит как присваивание...
"мир"
iex> "Привет, #{name}!"             # #{} — интерполяция
"Привет, мир!"
iex> Enum.map([1, 2, 3], fn x -> x * x end)
[1, 4, 9]
iex> i 42                           # i — «расскажи про значение» (тип, и т.п.)
```

Полезное в `iex`:
- `h Enum.map` — документация прямо в REPL (`h` = help). В Go так нельзя.
- `i value` — информация о значении.
- `recompile` — перекомпилировать проект (если запущен через `iex -S mix`).
- Выход: `Ctrl+C` дважды, или `Ctrl+\`.

> **Сразу замечание про `=`.** `name = "мир"` *выглядит* как присваивание, но на самом
> деле это сопоставление с образцом, которое в простом случае ведёт себя как связывание.
> Почему это важно и где это кусается — целый модуль 02. Пока просто знай: тут не всё так
> просто, как кажется.

## Шаг 2. Первый mix-проект

```bash
mix new playground
cd playground
```

`mix` сгенерил структуру (узнаваемо, если знаешь Go-проекты):

```
playground/
├── mix.exs              # манифест: имя, версия, deps (≈ go.mod, но это код на Elixir)
├── lib/
│   └── playground.ex    # тут живёт код
├── test/
│   ├── test_helper.exs
│   └── playground_test.exs
└── .formatter.exs       # настройки mix format (≈ gofmt, но конфигурируемый)
```

Открой `lib/playground.ex` и замени содержимое:

```elixir
defmodule Playground do
  @moduledoc "Песочница первого модуля."

  @doc "Приветствие по имени."
  def greet(name) do
    "Привет, #{name}!"
  end

  @doc "Сумма квадратов списка чисел."
  def sum_of_squares(nums) do
    nums
    |> Enum.map(fn n -> n * n end)
    |> Enum.sum()
  end
end
```

Разбор по косточкам:
- `defmodule Playground do ... end` — модуль (пространство имён + контейнер функций).
- `@moduledoc` / `@doc` — документация (это *атрибуты модуля*; из них растут doctests, см. модуль 09).
- `def greet(name) do ... end` — публичная функция. Возвращается **последнее выражение**
  (нет `return`; `# Go: return greet`). Тела без `return` — норма.
- `|>` — **пайп**: берёт значение слева и подставляет первым аргументом в функцию справа.
  `nums |> Enum.map(f)` это `Enum.map(nums, f)`. Читается сверху вниз, как конвейер. Будет
  везде; подробнее в модуле 03.

Запусти руками через REPL проекта:

```bash
iex -S mix
```

```elixir
iex> Playground.greet("Go-разработчик")
"Привет, Go-разработчик!"
iex> Playground.sum_of_squares([1, 2, 3, 4])
30
iex> recompile()         # после правки файла — перекомпилировать, не выходя
```

## Шаг 3. Тест и форматтер

Открой `test/playground_test.exs`:

```elixir
defmodule PlaygroundTest do
  use ExUnit.Case

  test "greet вставляет имя" do
    assert Playground.greet("Сэм") == "Привет, Сэм!"
  end

  test "sum_of_squares складывает квадраты" do
    assert Playground.sum_of_squares([1, 2, 3]) == 14
  end
end
```

Прогон:

```bash
mix test
# ..
# Finished in 0.0X seconds
# 2 tests, 0 failures
```

`# Go:` это твой `go test`. `ExUnit` встроен, как `testing`. `assert` — макрос, который при
падении красиво покажет, что слева и справа от `==` (приятнее, чем ручной `if got != want`).

Форматирование:

```bash
mix format        # причешет весь проект по .formatter.exs (≈ gofmt, но настраиваемый)
```

## Mini-drill

```drill
type: multiple-choice
prompt: "Функция `def greet(name), do: \"Hi #{name}\"` — что она вернёт и где return?"
options: ["Нужен явный return, иначе ошибка", "Вернёт строку Hi <name>: возвращается последнее выражение, return не нужен", "Вернёт :ok", "Не скомпилируется без типа аргумента"]
answer: "Вернёт строку Hi <name>: возвращается последнее выражение, return не нужен"
check: exact
hint: В Elixir нет оператора return.
```

```drill
type: free-form
prompt: "Что делает пайп: `[1,2,3] |> Enum.map(&(&1*2)) |> Enum.sum()` — перепиши без пайпа и скажи результат."
answer: "Эквивалент: Enum.sum(Enum.map([1,2,3], &(&1*2))). Пайп подставляет левое значение первым аргументом. Результат: [2,4,6] -> 12. (&(&1*2) — короткая запись анонимной функции, разберём в модуле 03.)"
check: manual
```

```drill
type: fill-in
prompt: "Чтобы запустить REPL внутри проекта с доступом ко всем модулям — команда ____; перекомпилировать код, не выходя из неё — функция ____."
answer: "iex -S mix; recompile()"
check: fuzzy
hint: Вторая вызывается прямо в iex.
```

## Итог

У тебя стоит Elixir 1.19+ на OTP 27+, ты умеешь: щупать выражения в `iex`, создавать
`mix`-проект, писать модуль с функциями и пайпом, гонять `mix test` и `mix format`. Тулинг
ощущается как `go` + REPL. Дальше — самое важное и непривычное: `=` это **не** присваивание,
а сопоставление с образцом. С этого начинается настоящий Elixir.
