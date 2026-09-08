# CLAUDE.md — rust

Domain-specific instructions. Loaded after the root `CLAUDE.md` at the start of every
session in this domain. Keep it short and factual.

## Goal

Take the learner from zero Rust to writing real Rust programs on their own — confidently
using ownership/borrowing, the type system (structs, enums, pattern matching), error
handling, traits/generics, and Rust's concurrency/async model — and understanding *why*
the language is shaped the way it is. Emphasis on mental models and trade-offs, not
syntax recall. The borrow checker should feel like a collaborator, not an enemy.

## Starting level

Experienced programmer with a strong **Go** background, new to Rust specifically and to
systems languages with manual-but-checked memory management. Comfortable with: static
types, interfaces, goroutines/channels/CSP, `if err != nil`, the Go toolchain
(`go mod`/`go test`/`go fmt`). **New to**: ownership/borrowing/lifetimes, move semantics,
sum types + exhaustive matching, traits & generics with bounds, `Result`/`Option`,
`Send`/`Sync`, `async`/`await` with an external runtime.

This domain is **independent** of the `typescript` and `vue` domains — do not anchor on
them. The single anchor is **Go**.

Freeze this — progress goes into `memory.md`, not here.

## Methodology

- **Why-first.** Every feature is introduced with the problem it solves (what unsafe or
  manual alternative it replaces), then the trade-off it carries — never as an isolated rule.
- **Single anchor: Go.** Compare relentlessly to Go: GC vs ownership, `if err != nil` vs
  `Result`/`?`, interfaces vs traits, goroutines/CSP vs threads + `Send`/`Sync` + async,
  `nil` vs `Option`, `go mod` vs Cargo. Show the Go equivalent inline (`// Go: ...`).
- **Compiler as teacher.** Show wrong code and the **actual compiler / borrow-checker
  message** (e.g. `error[E0382]: borrow of moved value`), then the fix. Reading rustc
  diagnostics is a core skill — train it explicitly.
- **Ownership before everything.** Modules 02–03 (ownership, borrowing, lifetimes) are the
  spine; nothing later makes sense without them. Do not rush past them.
- **Pitfalls explicitly.** Name the classic footguns (fighting the borrow checker, moved
  values, `&mut` aliasing, `String` vs `&str`, `unwrap` everywhere, `Rc<RefCell>` cycles,
  blocking inside async). Each module ends with a "Типичные ошибки и заблуждения" section.
- **Drill over passive reading.** Each module ends with `drill` blocks; SRS on `cards`.

## Preferred sources / authors

Real, verifiable references only:
- **The Rust Programming Language** ("The Book") — doc.rust-lang.org/book (canonical).
- **Rust by Example** — doc.rust-lang.org/rust-by-example.
- **std documentation** — doc.rust-lang.org/std; **Edition Guide** — doc.rust-lang.org/edition-guide.
- **Tokio** — tokio.rs (docs + tutorial); **Async Book** — rust-lang.github.io/async-book.
- **The Rustonomicon** — doc.rust-lang.org/nomicon (only for pointed `unsafe` asides).
- Crates: `clap`, `anyhow`, `thiserror`, `axum` (docs.rs).

## Explanation style

- Content in **Russian**; code, identifiers, and compiler diagnostics stay in English.
- **Engaging, not dry.** Conversational tone, vivid analogies, light humor where it lands.
  Humor serves the point, never replaces it. The borrow checker is a recurring "character".
- Lead with intuition ("почему так"), then formalize.
- Show the Go equivalent inline when it sharpens the contrast (`// Go: передаём по значению`).
- Show wrong code and the resulting rustc error before the fix.
- Use **stable Rust 1.96+, Edition 2024**. Async examples use **Tokio**; mention runtime
  choice (`async-std` dead, `smol` niche) as a real fork in the road, not dogma. Native
  `async fn` in traits is stable — use it, but flag the `dyn`-trait caveat.

## Out of scope

- **Embedded / `no_std` / bare metal.** Mention they exist; do not teach them here.
- **Macro authoring** (`macro_rules!` beyond reading, proc-macros) — overview only.
- **Deep `unsafe` / FFI.** One honest section on what `unsafe` means; no Nomicon deep dive.
- **Deployment / packaging / cross-compilation.** Out of scope for this slice.
- Web is touched only as a capstone sidebar (axum + tokio), not a backend course.

## Optional folders

- `misc/` — reference files; link from theory/lessons via relative paths. Do not parse.
- `notes/` — user-owned `.md` notes managed by the UI. Do not write there unless asked.

## Links

- Memory: [`memory.md`](./memory.md)
- Roadmap: [`roadmap.md`](./roadmap.md)
- Index:   [`README.md`](./README.md)
