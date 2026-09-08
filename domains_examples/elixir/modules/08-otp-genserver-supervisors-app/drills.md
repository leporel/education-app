---
id: elixir.otp-genserver-supervisors-app.drills
type: drills
title: "OTP: GenServer, супервизоры, Application — упражнения"
tags: [elixir, otp, genserver, supervisor, drills]
status: todo
updated: 2026-09-08
---

# Упражнения

## GenServer

```drill
type: multiple-choice
prompt: "Нужен запрос, который ВОЗВРАЩАЕТ результат и тормозит клиента до ответа. Какой колбэк?"
options: ["handle_cast/2", "handle_call/3", "handle_info/2", "init/1"]
answer: "handle_call/3"
check: exact
hint: call синхронен и возвращает {:reply, answer, state}.
```

```drill
type: multiple-choice
prompt: "Что должен вернуть handle_cast({:inc, n}, state)?"
options: ["{:reply, state + n, state}", "{:noreply, state + n}", "state + n", "{:ok, state + n}"]
answer: "{:noreply, state + n}"
check: exact
hint: cast не отвечает — только обновляет состояние.
```

```drill
type: free-form
prompt: "Почему «всё на cast» — опасный паттерн, и когда cast уместен?"
answer: "cast асинхронен и не создаёт back-pressure: при перегрузке клиент не ждёт, а сообщения копятся в mailbox сервера, который растёт без удержу и съедает память. call синхронен — клиент ждёт ответа, что естественно ограничивает темп. cast уместен только для честного «огонь и забыл», где переполнение в принципе невозможно (редкие, ненагруженные команды без результата)."
check: manual
```

```drill
type: free-form
prompt: "Сопоставь ручной процесс из модуля 07 с колбэками GenServer: начальный balance, синхронный {:balance, from}, асинхронный {:deposit, amount}."
answer: "Начальный balance -> init/1, возвращает {:ok, balance}. Синхронный {:balance, from} (клиент ждёт ответ) -> handle_call(:balance, _from, state), возвращает {:reply, state, state}. Асинхронный {:deposit, amount} (без ответа) -> handle_cast({:deposit, amount}, state), возвращает {:noreply, state + amount}. Каркас GenServer заменяет ручной loop, send/receive и таймауты."
check: manual
```

## Supervisor

```drill
type: multiple-choice
prompt: "Дети независимы; упал один — надо поднять только его. Стратегия?"
options: [":one_for_all", ":rest_for_one", ":one_for_one", ":simple_one_for_one"]
answer: ":one_for_one"
check: exact
hint: Самая частая стратегия для независимых детей.
```

```drill
type: multiple-choice
prompt: "Процесс C запускается после B и зависит от него. B упал. Какая стратегия перезапустит B и C, но не трогавшихся раньше?"
options: [":one_for_one", ":one_for_all", ":rest_for_one", ":permanent"]
answer: ":rest_for_one"
check: exact
hint: Перезапускает упавшего и всех, объявленных ПОСЛЕ.
```

```drill
type: free-form
prompt: "Что произойдёт, если ребёнок падает чаще max_restarts за max_seconds? Почему это не баг?"
answer: "Супервизор сдаётся и падает сам, эскалируя проблему выше по дереву (его собственному супервизору). Это намеренно: если повторный рестарт не помогает, значит проблема глубже, и решать должен родительский уровень — возможно, перезапустив более крупное поддерево или всё приложение. Дерево локализует сбой и эскалирует, когда локального лечения мало."
check: manual
```

```drill
type: multiple-choice
prompt: "Почему супервизор не должен содержать бизнес-логику?"
options: ["Из-за производительности", "Супервизор должен только запускать/следить/перезапускать — простота делает его надёжным; логика живёт в GenServer'ах под ним", "Логика в супервизоре запрещена компилятором", "Чтобы экономить процессы"]
answer: "Супервизор должен только запускать/следить/перезапускать — простота делает его надёжным; логика живёт в GenServer'ах под ним"
check: exact
hint: Надёжен тот, кто туп и прост.
```

## Application и абстракции

```drill
type: multiple-choice
prompt: "Чем GenServer/Supervisor принципиально превосходят ручную реализацию рестарта воркеров в Go?"
options: ["Они быстрее исполняются", "Дают самовосстановление декларативно (дерево + стратегия) вместо ручного recover/цикла рестарта/бэк-офф — отказоустойчивость как структура программы", "Используют меньше памяти", "Ничем, это то же самое"]
answer: "Дают самовосстановление декларативно (дерево + стратегия) вместо ручного recover/цикла рестарта/бэк-офф — отказоустойчивость как структура программы"
check: exact
hint: В Go супервизии нет из коробки.
```

```drill
type: free-form
prompt: "Нужно скачать 100 URL параллельно, не более 10 одновременно, собрать результаты. Какой инструмент OTP и почему не просто spawn?"
answer: "Task.async_stream(urls, &fetch/1, max_concurrency: 10). Он сам ограничивает одновременность (10), управляет жизненным циклом задач, собирает результаты по порядку и интегрирован с супервизией/таймаутами. Просто spawn 100 процессов не даст лимита одновременности (можно перегрузить цель/сеть) и потребует руками собирать ответы и ловить падения — async_stream это и есть «пул воркеров с семафором», но из коробки."
check: manual
```

```drill
type: multiple-choice
prompt: "Нужно простое разделяемое состояние-ячейка без логики обработки сообщений. Что взять?"
options: ["Полный GenServer", "Agent", "Supervisor", "Application"]
answer: "Agent"
check: exact
hint: Agent — тонкая обёртка «процесс как ячейка состояния».
```

```drill
type: multiple-choice
prompt: "Один GenServer стал бутылочным горлом на read-heavy нагрузке. Что разумно рассмотреть?"
options: ["Перевести всё на cast", "Вынести данные в :ets для быстрого конкурентного чтения вне сериализации через процесс", "Увеличить max_restarts", "Сделать handle_call тяжелее"]
answer: "Вынести данные в :ets для быстрого конкурентного чтения вне сериализации через процесс"
check: exact
hint: GenServer сериализует доступ; ETS даёт конкурентное чтение.
```

## Child spec и старт

```drill
type: free-form
prompt: "В дереве написано children = [Counter]. Что произойдёт при старте и откуда супервизор знает, как запускать Counter?"
answer: "Короткая форма разворачивается в Counter.child_spec([]), а эту функцию сгенерировал use GenServer. Из неё супервизор берёт start: {Counter, :start_link, [[]]} и вызывает Counter.start_link([]), а также id, restart, shutdown и type. То есть никакой магии: карточка ребёнка — обычная мапа, сгенерированная use."
check: manual
hint: "child_spec/1 приходит из use GenServer."
```

```drill
type: multiple-choice
prompt: "Ребёнок запущен под супервизором через GenServer.start (без link). Что сломается?"
options: ["Ничего", "Супервизор не узнает о падении ребёнка — надзор и перезапуск работать не будут", "Процесс не стартует", "Состояние не сохранится"]
answer: "Супервизор не узнает о падении ребёнка — надзор и перезапуск работать не будут"
check: exact
hint: "Надзор стоит на link из модуля 07."
```

```drill
type: free-form
prompt: "GenServer при старте должен прогреть кэш из БД (2 секунды). Как сделать правильно и почему не в init?"
answer: "Вернуть из init заготовку с инструкцией продолжения: {:ok, %{cache: nil}, {:continue, :warmup}}, а саму загрузку сделать в handle_continue(:warmup, state). В init нельзя, потому что супервизор блокируется до его возврата — старт всего дерева и приложения будет ждать эти 2 секунды. handle_continue выполнится сразу после старта, но до первого клиентского сообщения."
check: manual
```

## Динамические процессы

```drill
type: multiple-choice
prompt: "Нужен процесс на каждую игровую комнату, комнаты создаются и исчезают в рантайме. Что взять?"
options: ["Обычный Supervisor со списком детей", "DynamicSupervisor + Registry ({:via, Registry, {...}})", "Agent на каждую комнату без надзора", "Один GenServer с мапой комнат"]
answer: "DynamicSupervisor + Registry ({:via, Registry, {...}})"
check: exact
hint: "Список детей заранее неизвестен, а имён-атомов на всех не хватит."
```

```drill
type: fill-in
prompt: "Зарегистрировать процесс в Registry под ключом id: GenServer.start_link(__MODULE__, opts, name: {:____, Registry, {MyApp.Registry, id}})."
answer: "via"
check: fuzzy
```
