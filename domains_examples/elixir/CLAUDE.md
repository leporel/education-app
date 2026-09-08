# CLAUDE.md — elixir

Domain-specific instructions. Loaded after the root `CLAUDE.md` at the start of every
session in this domain. Keep it short and factual.

## Goal

Take the learner from zero Elixir to writing real Elixir programs on their own —
confidently using pattern matching, immutable data, the pipe, multi-clause functions,
the `{:ok, _}`/`{:error, _}` convention with `with`, protocols, and — above all — the
**process/actor model and OTP** (GenServer, supervisors, "let it crash"). Emphasis on
mental models and *why* the language and the BEAM are shaped the way they are, not
syntax recall. The runtime (concurrency, isolation, fault tolerance) is the real subject;
the syntax is just how you talk to it.

## Starting level

Experienced programmer with a strong **Go** background, new to Elixir specifically and
to functional / actor-model languages. Comfortable with: static types, interfaces,
goroutines/channels/CSP, `if err != nil`, the Go toolchain (`go mod`/`go test`/`go fmt`).
**New to**: immutability everywhere, pattern matching as the core control mechanism, the
match operator `=`, recursion instead of loops, dynamic typing (with an *inferred*
set-theoretic type system on top), share-nothing processes + message passing, links /
monitors / supervisors, "let it crash", `mix`/Hex/IEx.

This domain is **independent** of the `typescript`, `vue`, and `rust` domains — do not
anchor on them. The single anchor is **Go**.

Freeze this — progress goes into `memory.md`, not here.

## Methodology

- **Why-first.** Every feature is introduced with the problem it solves, then the
  trade-off it carries — never as an isolated rule. Especially: *why share-nothing +
  message passing buys you fault tolerance you cannot get from shared-memory goroutines*.
- **Single anchor: Go.** Compare relentlessly to Go: goroutines/channels/CSP vs
  processes/mailboxes/actors, `if err != nil` vs tagged tuples + `with`, interfaces vs
  protocols/behaviours, mutable structs vs immutable data, `for` loops vs recursion +
  `Enum`, `go mod` vs `mix`/Hex. Show the Go equivalent inline (`# Go: ...`).
- **The runtime is the point.** Keep returning to the BEAM: cheap isolated processes,
  preemptive scheduling, per-process heaps & GC, supervision. This is the payoff Go
  cannot replicate, and the reason to learn the language.
- **Pattern matching before everything.** Module 02 (the match operator + immutability)
  is the spine; functions, control flow, and `receive` are all pattern matching wearing
  hats. Do not rush past it.
- **Pitfalls explicitly.** Name the classic footguns (treating `=` as assignment,
  forgetting the pin `^`, atom exhaustion, unbounded mailboxes, blocking a GenServer,
  rescuing what you should let crash, charlist-vs-string surprises, `Enum` over huge/
  infinite data instead of `Stream`). Each module ends with a "Типичные ошибки и
  заблуждения" section.
- **Drill over passive reading.** Each module ends with `drill` blocks; SRS on `cards`.

## Preferred sources / authors

Real, verifiable references only:
- **Official guides** — elixir-lang.org/getting-started and hexdocs.pm/elixir (canonical).
- **HexDocs** — hexdocs.pm (std lib: `Enum`, `Stream`, `GenServer`, `Supervisor`, `Task`).
- **"Elixir in Action"** by Saša Jurić (Manning) — the canonical OTP/BEAM mental-model book.
- **"Programming Elixir ≥ 1.6"** by Dave Thomas (PragProg) — language fundamentals.
- **Erlang/OTP docs** — erlang.org/doc (for BEAM/processes background).
- **Phoenix / LiveView** — hexdocs.pm/phoenix, hexdocs.pm/phoenix_live_view (capstone
  sidebar only).

## Explanation style

- Content in **Russian**; code, identifiers, atoms, and tooling output stay as-is (English).
- **Engaging, not dry.** Conversational tone, vivid analogies, light humor where it lands.
  Humor serves the point, never replaces it. The supervisor is a recurring "character"
  (the manager who restarts crashed workers without blinking).
- Lead with intuition ("почему так"), then formalize.
- Show the Go equivalent inline when it sharpens the contrast (`# Go: канал вместо мейлбокса`).
- Use **Elixir 1.19+ on Erlang/OTP 27+** (compatible with OTP 28.1 / 29). Mention the
  **set-theoretic type system** honestly: it is gradual and *inferred* (you don't write
  annotations yet), it already type-checks more each release and catches real bugs — but
  Elixir is still a dynamic language, not Go's static typing. Don't oversell it.

## Out of scope

- **Phoenix / Ecto as a real course.** Phoenix + LiveView appear only as a capstone
  sidebar ("async/real-time in prod, why BEAM wins"). A full web/DB course is a separate domain.
- **Distributed Elixir / clustering** (multi-node, `:global`, libcluster) — mention it
  exists; do not teach it here.
- **Macros / metaprogramming deep dive** (`quote`/`unquote`, writing DSLs) — overview only.
- **Nx / Nerves / embedded / GenStage / Broadway** — name-drop as ecosystem, do not teach.
- **Erlang the language.** Show the BEAM heritage and occasional `:erlang`/`:ets` calls;
  do not teach Erlang syntax as a track.

## Optional folders

- `misc/` — reference files; link from theory/lessons via relative paths. Do not parse.
- `notes/` — user-owned `.md` notes managed by the UI. Do not write there unless asked.

## Links

- Memory: [`memory.md`](./memory.md)
- Roadmap: [`roadmap.md`](./roadmap.md)
- Index:   [`README.md`](./README.md)
