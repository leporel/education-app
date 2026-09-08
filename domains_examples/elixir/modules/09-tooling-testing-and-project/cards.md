---
id: elixir.tooling-testing-and-project.cards
type: cards
title: "Тулинг, тесты и проект — карточки"
tags: [elixir, exunit, doctest, mix, dialyzer, phoenix, cards]
status: todo
updated: 2026-09-08
---

# Карточки

## ExUnit

```card
front: Что такое ExUnit и чем assert лучше ручного сравнения?
back: "Встроенный тест-фреймворк (как testing в Go). assert/refute — макросы: при падении показывают разобранное выражение (что слева и справа от ==), а не просто false. mix test запускает; test/*_test.exs — файлы."
tags: [elixir, exunit]
```

```card
front: Что делает setup и как тест получает его данные?
back: "setup выполняется перед КАЖДЫМ тестом и возвращает мапу, сливаемую в контекст. Тест получает контекст вторым аргументом через сопоставление: `test \"...\", %{account: pid} do`. setup_all — один раз на модуль. Снова pattern matching."
tags: [elixir, exunit, setup]
```

```card
front: "Когда async: true безопасен?"
back: Гоняет тестовые МОДУЛИ параллельно (внутри модуля — последовательно). Безопасно, только если тесты не делят изменяемое глобальное состояние (один именованный процесс, файл, БД-таблица без изоляции). Благодаря изоляции процессов BEAM большинство юнит-тестов async-безопасны; тесты на общий ресурс — синхронные.
tags: [elixir, exunit, async]
```

```card
front: Как тестировать, что процессу пришло сообщение?
back: assert_receive (ждёт с таймаутом) / assert_received (проверяет уже пришедшее) в ExUnit. Плюс assert_raise для исключений. Это инструменты тестирования конкурентного кода.
tags: [elixir, exunit, concurrency]
```

## Doctests

```card
front: Что такое doctest?
back: "Примеры в @doc с префиксом `iex>`, которые проверяются как тесты. В тест-файле: `doctest MyMod` превращает примеры в тесты — mix test выполнит их и сверит вывод. Документация не «протухает». Хороши для маленьких чистых функций."
tags: [elixir, doctest]
```

## Mix и Hex

```card
front: Что создаёт mix new и роли файлов?
back: "mix new myapp (--sup для OTP-приложения): mix.exs (манифест: проект, deps, mod:), lib/ (исходники .ex), test/ (.exs), config/ (конфиг), mix.lock (фиксация версий deps ≈ go.sum)."
tags: [elixir, mix, project]
```

```card
front: Как объявляют и тянут зависимости? Что значит ~> 1.4?
back: "В mix.exs функция deps возвращает список {:jason, \\\"~> 1.4\\\"}; mix deps.get тянет через Hex (hex.pm), mix.lock фиксирует версии. ~> 1.4 = совместимая версия >= 1.4.0 и < 2.0.0 (semver-диапазон). only:/runtime: false — для dev-инструментов."
tags: [elixir, hex, deps]
```

```card
front: Соответствие mix-тулинга и Go?
back: "mix.exs deps ≈ require в go.mod; mix.lock ≈ go.sum; Hex ≈ модуль-прокси/реестр; mix test ≈ go test; mix format ≈ gofmt (но конфигурируемый); mix deps.get ≈ go mod download. Отличие: версии диапазоном (~>), mix.exs — исполняемый код."
tags: [elixir, mix, go]
```

## Качество и релизы

```card
front: format / Credo / Dialyzer — что каждый делает?
back: mix format — форматтер (как gofmt, конфигурируемый). Credo — линтер стиля/читаемости (mix credo). Dialyzer (dialyxir) — статический success-typing анализ по @spec/выводам, ловит несогласованные вызовы (mix dialyzer, первый прогон строит PLT-кеш, долгий).
tags: [elixir, format, credo, dialyzer]
```

```card
front: Что такое mix release?
back: "Самодостаточный артефакт: твой код + зависимости + (опц.) среда Erlang, запускается БЕЗ установленного Elixir на сервере. Конфиг в рантайме (runtime.exs), команды управления, горячая замена кода. Стандартный способ деплоя."
tags: [elixir, release]
```

## Phoenix-врезка

```card
front: Почему Phoenix — естественная витрина BEAM в проде?
back: Процесс на каждое соединение под супервизией (100k соединений = 100k дешёвых изолированных процессов, падение одного не задевает других); LiveView — real-time UI без JS (состояние страницы в серверном GenServer, DOM-диффы по WebSocket); PubSub/Presence из коробки. Веб тут — тонкий слой над OTP, а не магия фреймворка.
tags: [elixir, phoenix, liveview]
```

```card
front: Что такое LiveView в двух словах?
back: "Серверный real-time UI: состояние страницы живёт в процессе (GenServer), сервер шлёт DOM-диффы по WebSocket, JS почти не пишешь. Живые дашборды/формы/чаты на Elixir. Прямое следствие дешёвых процессов и pub/sub поверх BEAM. На лето 2026 — LiveView 1.1."
tags: [elixir, liveview]
```

## Изоляция тестов

```card
front: "Что делает start_supervised!/1 и зачем он в тестах?"
back: "Запускает процесс под тестовым супервизором ExUnit и гарантированно гасит его после теста. Благодаря этому каждый тест получает свой свежий GenServer (адресуемый по pid), тесты становятся независимыми — и async: true снова безопасен."
tags: [elixir, exunit, start-supervised]
```

```card
front: "Почему общий именованный процесс мешает async: true?"
back: "Все тесты работают с одним и тем же состоянием: параллельный прогон даёт гонку и флаки (счётчики и данные перемешиваются). Лечение — поднимать процесс на каждый тест через start_supervised! в setup и обращаться по pid, а не по глобальному имени."
tags: [elixir, exunit, async]
```

```card
front: "Полезные флаги mix test?"
back: "mix test path/file.exs:42 — один тест по строке; --stale — только затронутое изменениями; --failed — только упавшие в прошлый раз; --only integration — тесты с @tag :integration; --seed 0 — отключить случайный порядок при отладке флаков."
tags: [elixir, mix, test]
```

## Logger

```card
front: "Чем Logger отличается от IO.inspect и почему ему нужен require?"
back: "IO.inspect — отладочная печать без уровней и настроек. Logger — стандартное логирование: уровни (:debug…:error), метаданные процесса, конфигурация. Logger.info и компания — МАКРОСЫ (чтобы отсекать лишние вызовы вплоть до этапа компиляции), а макросы требуют require Logger."
tags: [elixir, logger]
```

```card
front: "Что такое Logger.metadata и на что это похоже в Go?"
back: "Logger.metadata(job_id: id) привязывает пары ключ-значение к ПРОЦЕССУ: они попадут во все последующие записи этого процесса. В Go для этого таскают logger := logger.With(\"job_id\", id) по всем вызовам; здесь контекст живёт в процессе и передавать его не нужно."
tags: [elixir, logger, metadata]
```

```card
front: "Нужно ли логировать падения процессов вручную?"
back: "Нет: падение ребёнка логирует супервизор автоматически, со стектрейсом и причиной. Оборачивать код в try/rescue ради лога — анти-OTP: это прячет причину и мешает рестарту. Логируй бизнес-события, а сбои оставь дереву супервизии."
tags: [elixir, logger, otp]
```
