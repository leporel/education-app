---
id: elixir.tooling-testing-and-project.drills
type: drills
title: "Тулинг, тесты и проект — упражнения"
tags: [elixir, exunit, doctest, mix, phoenix, drills]
status: todo
updated: 2026-09-08
---

# Упражнения

## ExUnit

```drill
type: free-form
prompt: "Напиши тест-модуль для функции Calc.double/1 с setup, который кладёт в контекст базовое число, и одним тестом, использующим контекст."
answer: "defmodule CalcTest do\n  use ExUnit.Case, async: true\n\n  setup do\n    %{n: 21}\n  end\n\n  test \"double удваивает\", %{n: n} do\n    assert Calc.double(n) == 42\n  end\nend\n(setup возвращает мапу %{n: 21}, тест получает её через сопоставление вторым аргументом.)"
check: manual
```

```drill
type: multiple-choice
prompt: "Когда НЕ стоит ставить async: true?"
options: ["Когда тестов мало", "Когда тесты делят изменяемое глобальное состояние (общий именованный процесс, файл, БД без изоляции)", "Когда используешь setup", "Всегда стоит ставить async"]
answer: "Когда тесты делят изменяемое глобальное состояние (общий именованный процесс, файл, БД без изоляции)"
check: exact
hint: Async безопасен при изоляции; общий ресурс → флаки.
```

```drill
type: multiple-choice
prompt: "Чем assert лучше ручного `if got != want`?"
options: ["Ничем", "assert — макрос: при падении показывает разобранное выражение (левую и правую части), давая диагностику бесплатно", "assert быстрее выполняется", "assert не требует mix test"]
answer: "assert — макрос: при падении показывает разобранное выражение (левую и правую части), давая диагностику бесплатно"
check: exact
hint: Интроспекция выражения — фишка макроса.
```

## Doctests

```drill
type: free-form
prompt: "Добавь к функции `def square(n), do: n*n` doctest-пример и покажи, как подключить его в тест-файле."
answer: "@doc \"\"\"\nКвадрат числа.\n\n    iex> MyMod.square(5)\n    25\n\"\"\"\ndef square(n), do: n * n\n\n# в тесте:\ndefmodule MyModTest do\n  use ExUnit.Case, async: true\n  doctest MyMod\nend\nmix test выполнит MyMod.square(5) и сверит с 25."
check: manual
```

## Mix и Hex

```drill
type: multiple-choice
prompt: "Что означает {:jason, \"~> 1.4\"} в deps?"
options: ["Ровно версия 1.4", "Любая версия", ">= 1.4.0 и < 2.0.0 (совместимая по semver)", ">= 1.4.0 и < 1.5.0"]
answer: ">= 1.4.0 и < 2.0.0 (совместимая по semver)"
check: exact
hint: ~> допускает minor/patch обновления до следующего major.
```

```drill
type: fill-in
prompt: "mix.lock в Elixir выполняет ту же роль, что ____ в Go; зависимости тянут командой mix ____.____."
answer: "go.sum; deps.get"
check: fuzzy
hint: Фиксация версий + загрузка.
```

## Качество

```drill
type: multiple-choice
prompt: "Какой инструмент делает статический success-typing анализ по @spec и выводам?"
options: ["mix format", "Credo", "Dialyzer (dialyxir)", "ExUnit"]
answer: "Dialyzer (dialyxir)"
check: exact
hint: Первый прогон строит PLT и потому долгий.
```

## Phoenix-врезка

```drill
type: free-form
prompt: "Объясни одним абзацем, почему всё, что ты выучил про процессы/GenServer/супервизоры, прямо проявляется в Phoenix и LiveView."
answer: "Phoenix обслуживает каждое соединение отдельным изолированным процессом под супервизией — это дешёвые BEAM-процессы и деревья супервизии из модулей 07–08, поэтому 100k соединений масштабируются, а падение одного не задевает других. LiveView держит состояние страницы в серверном процессе (фактически GenServer) и шлёт DOM-диффы по WebSocket — это тот же receive-цикл с состоянием. PubSub — обмен сообщениями между процессами/нодами. То есть веб в Elixir — тонкий слой над OTP, а не магия фреймворка: ты уже знаешь, как он устроен внутри."
check: manual
```

```drill
type: multiple-choice
prompt: "Что делает LiveView особенным?"
options: ["Генерирует много JavaScript на клиенте", "Состояние страницы живёт в серверном процессе, DOM-диффы летят по WebSocket — real-time UI почти без JS", "Это замена Ecto", "Работает только без супервизии"]
answer: "Состояние страницы живёт в серверном процессе, DOM-диффы летят по WebSocket — real-time UI почти без JS"
check: exact
hint: Прямое следствие дешёвых процессов BEAM.
```

## Изоляция тестов

```drill
type: free-form
prompt: "Тесты дёргают общий GenServer, зарегистрированный под именем модуля, поэтому async отключён. Как сделать тесты независимыми?"
answer: "Дать серверу возможность стартовать без глобального имени (start_link(opts) с передачей opts в GenServer.start_link, а API принимать pid), в setup поднимать свой экземпляр через start_supervised!({Stats, []}) и обращаться к нему по pid. Тестовый супервизор погасит процесс после теста, тесты перестанут делить состояние — и async: true снова безопасен."
check: manual
hint: "start_supervised! + адресация по pid."
```

```drill
type: multiple-choice
prompt: "Тест упал, и хочется прогнать только его. Какая команда?"
options: ["mix test --only failed", "mix test test/my_test.exs:42", "mix test --seed 42", "mix run test"]
answer: "mix test test/my_test.exs:42"
check: exact
hint: "Ещё есть mix test --failed для всех упавших в прошлый раз."
```

## Logger

```drill
type: multiple-choice
prompt: "Logger.info(\"старт\") в модуле не компилируется: undefined function. Что забыл?"
options: ["import Logger", "require Logger — Logger.info это макрос", "alias Logger", "use Logger"]
answer: "require Logger — Logger.info это макрос"
check: exact
hint: "Макросы требуют require (модуль 03)."
```

```drill
type: free-form
prompt: "Почему Logger сделан макросами, а не обычными функциями?"
answer: "Чтобы вызовы ниже настроенного уровня можно было отсекать максимально дёшево — вплоть до полного вырезания на этапе компиляции (compile_time_purge_matching). Обычная функция сначала вычислила бы аргументы (например, дорогой inspect больших данных), а макрос может выбросить весь вызов ещё до рантайма. Поэтому Logger.debug в горячем коде почти бесплатен."
check: manual
```

```drill
type: fill-in
prompt: "Привязать job_id ко всем последующим логам текущего процесса: Logger.____(job_id: id)."
answer: "metadata"
check: fuzzy
```
