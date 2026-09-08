---
id: elixir.tooling-testing-and-project.lesson-01
type: lesson
title: "Урок 01 — Капстоун: супервизируемый пул воркеров"
tags: [elixir, capstone, otp, task, supervisor, testing, phoenix, lesson]
status: todo
updated: 2026-09-08
---

# Урок 01 — Капстоун: супервизируемый пул воркеров

Цель: собрать всё вместе в одно работающее OTP-приложение — конкурентный пул воркеров,
обрабатывающий задания, считающий результаты в GenServer и переживающий падения под
супервизором. Плюс тесты на ExUnit. Финал — врезка про Phoenix как «то же самое, но в вебе».

## Что строим

Мини-краулер/обработчик: на вход список «заданий» (URL-ы, имитируем работу), нужно обработать
их **конкурентно с лимитом одновременности**, собрать статистику (успехи/ошибки) в живой
процесс, и чтобы сбой обработки одного задания не валил всю систему. Используем: `Task.async_stream`
(05/08), `GenServer` для статистики (08), `Supervisor` + `Application` (08), `with`/тегированные
кортежи (04), `Enum` (05).

## Шаг 0. Создаём проект

```bash
mix new crawler --sup
cd crawler
```

`--sup` сразу даёт `lib/crawler/application.ex` с корневым супервизором.

## Шаг 1. GenServer статистики

Живой счётчик результатов — классический GenServer (модуль 08):

```elixir
# lib/crawler/stats.ex
defmodule Crawler.Stats do
  use GenServer

  def start_link(_opts), do: GenServer.start_link(__MODULE__, %{ok: 0, error: 0}, name: __MODULE__)

  def record(result), do: GenServer.cast(__MODULE__, {:record, result})
  def snapshot, do: GenServer.call(__MODULE__, :snapshot)

  @impl true
  def init(state), do: {:ok, state}

  @impl true
  def handle_cast({:record, :ok}, state), do: {:noreply, %{state | ok: state.ok + 1}}
  def handle_cast({:record, :error}, state), do: {:noreply, %{state | error: state.error + 1}}

  @impl true
  def handle_call(:snapshot, _from, state), do: {:reply, state, state}
end
```

`record` через `cast` (быстрая запись, ответ не нужен), `snapshot` через `call` (нужен
результат). Состояние — мапа с двумя счётчиками.

## Шаг 2. Логика обработки одного задания

Чистая функция с тегированным результатом (модули 03–04). Имитируем работу и случайный сбой:

```elixir
# lib/crawler/worker.ex
defmodule Crawler.Worker do
  @doc """
  Обрабатывает одно задание. Возвращает {:ok, url} или {:error, {url, reason}}.

      iex> Crawler.Worker.process("ok://safe")
      {:ok, "ok://safe"}
  """
  def process("fail://" <> _ = url), do: {:error, {url, :simulated_failure}}
  def process(url) do
    Process.sleep(10)            # имитация I/O-работы
    {:ok, url}
  end
end
```

Заметь doctest в `@doc` — он проверится тестом. Multi-clause различает «плохие» URL по
префиксу через сопоставление бинаря `"fail://" <> _`.

## Шаг 3. Конкурентный прогон с лимитом

Сердце капстоуна — `Task.async_stream` (модуль 08): параллельно, но не более N разом.

```elixir
# lib/crawler.ex
defmodule Crawler do
  alias Crawler.{Worker, Stats}

  @doc "Обрабатывает список заданий конкурентно (max_concurrency), пишет статистику."
  def run(urls, max_concurrency \\ 8) do
    urls
    |> Task.async_stream(
      fn url -> Worker.process(url) end,
      max_concurrency: max_concurrency,
      timeout: 5_000,
      on_timeout: :kill_task
    )
    |> Enum.each(fn
      {:ok, {:ok, _url}}        -> Stats.record(:ok)
      {:ok, {:error, _details}} -> Stats.record(:error)
      {:exit, _reason}          -> Stats.record(:error)   # таск убит/упал
    end)

    Stats.snapshot()
  end
end
```

Разбор:
- `Task.async_stream` раздаёт задания пулу задач (не больше `max_concurrency` одновременно),
  возвращает ленивый поток результатов. Это «пул горутин + семафор» из Go — одной строкой.
- Внешний тег `{:ok, ...}` / `{:exit, ...}` — от самого `async_stream` (отработал/упал-таск);
  **внутренний** `{:ok, url}` / `{:error, _}` — наш результат из `Worker.process`. Их
  различаем вложенным сопоставлением (модуль 02) прямо в `Enum.each`.
- Если `Worker` на задании упадёт или зависнет — `on_timeout: :kill_task` + `{:exit, _}`
  поймают это, мы запишем `:error`, а **остальные задания продолжат** (изоляция, модуль 07).

## Шаг 4. Дерево супервизии

`Stats` должен жить под присмотром (модуль 08). Правим сгенерённый Application:

```elixir
# lib/crawler/application.ex
defmodule Crawler.Application do
  use Application

  @impl true
  def start(_type, _args) do
    children = [
      Crawler.Stats
    ]
    Supervisor.start_link(children, strategy: :one_for_one, name: Crawler.Supervisor)
  end
end
```

Теперь `iex -S mix` поднимет `Stats` под супервизором. Если `Stats` упадёт — супервизор
поднимет новый (со сброшенными счётчиками, что для статистики приемлемо).

```elixir
iex -S mix
iex> Crawler.run(["a", "b", "fail://x", "c", "fail://y"])
%{ok: 3, error: 2}

# проверим устойчивость: убьём Stats и убедимся, что система жива
iex> Process.exit(Process.whereis(Crawler.Stats), :kill)
iex> Crawler.run(["a", "b"])     # супервизор уже поднял новый Stats
%{ok: 2, error: 0}
```

## Шаг 5. Тесты

```elixir
# test/crawler_test.exs
defmodule CrawlerTest do
  use ExUnit.Case          # без async: используем общий именованный Stats
  doctest Crawler.Worker

  setup do
    # сбросить статистику перед каждым тестом: проще всего перезапустить процесс,
    # но для теста просто создадим свежий снимок-ожидание относительно дельты
    :ok
  end

  test "run обрабатывает успехи и ошибки" do
    result = Crawler.run(["ok://1", "fail://2", "ok://3"])
    assert result.ok >= 2
    assert result.error >= 1
  end

  test "worker помечает fail:// как ошибку" do
    assert {:error, {"fail://x", :simulated_failure}} = Crawler.Worker.process("fail://x")
    assert {:ok, "ok://y"} = Crawler.Worker.process("ok://y")
  end
end
```

Заметь: модуль **без** `async: true`, потому что тесты делят общий именованный `Stats`
(модуль 09 — это и есть та оговорка про общее состояние). `doctest Crawler.Worker` проверит
пример из `@doc`. Запуск — `mix test`; форматирование — `mix format`.

## Что ты собрал

- **Конкурентность с лимитом** — `Task.async_stream` (вместо ручного пула горутин).
- **Живое состояние под присмотром** — `Stats` GenServer в дереве супервизии.
- **Изоляцию сбоев** — падение/таймаут одного задания не валит прогон.
- **Тегированные результаты + вложенный матч** — `{:ok,_}`/`{:error,_}` на двух уровнях.
- **Тесты + doctests** — ExUnit, `mix test`.

Это маленький, но честный OTP-проект: ровно те кирпичи, из которых сложены большие системы на
Elixir.

## Шаг 6. Делаем тесты независимыми

В шаге 5 пришлось отказаться от `async: true`: все тесты дёргают один общий `Crawler.Stats`,
зарегистрированный под именем модуля. Это лечится — пусть каждый тест поднимает **свой**
экземпляр под присмотром ExUnit.

Сначала дадим `Stats` возможность жить без глобального имени:

```elixir
# lib/crawler/stats.ex — добавляем опции и явный адрес сервера
def start_link(opts \\ []) do
  GenServer.start_link(__MODULE__, %{ok: 0, error: 0}, opts)
end

def record(server \\ __MODULE__, result), do: GenServer.cast(server, {:record, result})
def snapshot(server \\ __MODULE__), do: GenServer.call(server, :snapshot)
```

В дереве приложения по-прежнему стартуем именованным — `{Crawler.Stats, name: Crawler.Stats}`,
поэтому боевой код (`Crawler.run/2`) продолжает звать `Stats.record(:ok)` без изменений.

Теперь тест поднимает собственный процесс и работает с ним по pid:

```elixir
defmodule Crawler.StatsTest do
  use ExUnit.Case, async: true            # безопасно: процесс у каждого теста свой

  setup do
    pid = start_supervised!({Crawler.Stats, []})
    %{stats: pid}
  end

  test "считает успехи и ошибки", %{stats: stats} do
    Crawler.Stats.record(stats, :ok)
    Crawler.Stats.record(stats, :error)
    assert Crawler.Stats.snapshot(stats) == %{ok: 1, error: 1}
  end
end
```

`start_supervised!/1` запускает процесс под тестовым супервизором и сам гасит его после теста:
ни ручного `stop`, ни висящих процессов между прогонами. Приём универсальный: **общий
именованный процесс делает тесты зависимыми, отдельный процесс на тест возвращает `async`**.

## Врезка: а в вебе это Phoenix

Представь, что вместо списка URL приходят HTTP-запросы или WebSocket-сообщения. Меняется
немного:

- Каждое соединение Phoenix обслуживает **отдельным процессом под супервизией** — ровно как
  наши задания, но живущие, пока открыто соединение. 100k соединений = 100k дешёвых
  процессов; один упал — остальные целы.
- **LiveView** заменил бы наш `Stats.snapshot()` на **живую** страницу: состояние дашборда
  держит серверный процесс (тот же GenServer-паттерн), а изменения летят в браузер DOM-диффами
  по WebSocket — без написания JS. Счётчик `%{ok: 3, error: 2}` обновлялся бы на экране в
  реальном времени сам.
- **PubSub** разослал бы событие «задание обработано» всем подписанным процессам/страницам.

То есть Phoenix — это твой капстоун, надетый на веб: те же процессы, GenServer, супервизоры и
тегированные результаты. Веб-слой тонкий; фундамент — OTP, который ты уже знаешь. Полное
освоение Phoenix/Ecto — это следующий отдельный домен, но теперь ты понимаешь, *почему* там
всё устроено именно так.

## Mini-drill

```drill
type: free-form
prompt: "В Enum.each после async_stream мы матчим И {:ok, {:ok, url}}, И {:ok, {:error, _}}, И {:exit, _}. Объясни, откуда берётся каждый из трёх вариантов."
answer: "Внешний тег — от Task.async_stream: {:ok, value} если задача отработала и вернула value; {:exit, reason} если задача упала или была убита (таймаут с on_timeout: :kill_task). Внутренний тег — наш результат из Worker.process: {:ok, url} (успех) или {:error, details} (бизнес-ошибка). Поэтому успешно отработавшая задача с бизнес-успехом — {:ok, {:ok, url}}; отработавшая, но с бизнес-ошибкой — {:ok, {:error, _}}; а рухнувшая/зависшая задача — {:exit, _}. Два уровня тегов = два источника исхода."
check: manual
```

```drill
type: multiple-choice
prompt: "Почему CrawlerTest объявлен без async: true?"
options: ["Async устарел", "Тесты делят общий именованный процесс Stats — параллельный прогон дал бы гонку счётчиков (флаки)", "doctest несовместим с async", "Так быстрее"]
answer: "Тесты делят общий именованный процесс Stats — параллельный прогон дал бы гонку счётчиков (флаки)"
check: exact
hint: Общее изменяемое состояние → синхронные тесты.
```

```drill
type: free-form
prompt: "Чем `Task.async_stream(..., max_concurrency: 8)` лучше, чем `Enum.map(urls, &spawn(fn -> process(&1) end))`?"
answer: "async_stream ограничивает одновременность (8 задач разом) — не перегрузит цель/сеть/CPU, тогда как spawn на каждый URL запустит их все сразу без лимита. Он также управляет жизненным циклом задач, ловит падения/таймауты как {:exit,_}, возвращает результаты (spawn ничего не возвращает — пришлось бы вручную собирать сообщения) и интегрирован с супервизией. Это «пул воркеров с семафором» из коробки против ручной самоделки."
check: manual
```

## Итог

Ты собрал работающее OTP-приложение: конкурентный пул с лимитом (`Task.async_stream`), живую
статистику под супервизией (`GenServer` + `Supervisor` + `Application`), изоляцию сбоев,
двухуровневый матч результатов и тесты с doctests. И увидел, что Phoenix/LiveView — это тот же
фундамент, надетый на веб. Это финал курса: от «`=` это не присваивание» до самовосстанавли-
вающейся конкурентной системы. Поздравляю — теперь ты пишешь на Elixir.
