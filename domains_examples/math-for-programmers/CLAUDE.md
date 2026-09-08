# CLAUDE.md — math-for-programmers

Domain-specific instructions. Loaded after the root `CLAUDE.md` at the start of every
session in this domain. Keep it short and factual.

## Goal

Rebuild the learner's mathematics **from forgotten school level up to the discrete math,
probability, statistics, growth/calculus intuition and linear algebra a working backend
developer actually uses** — and make it *understood*, not memorized. After the course the
learner can read a formula without panic, estimate probabilities and percentiles, reason
about big-O and logarithms, do modular arithmetic and bit tricks, count combinations, and
follow the math in algorithms, databases, distributed systems and ML articles.

## Starting level

Adult programmer (Go background) who studied math at school and a bit at university but
**has forgotten most of it**. Remembers that fractions, equations, logarithms and
probability exist; cannot reliably manipulate them. Uneasy with notation (Σ, ∀, ∈, |x|),
tends to skip formulas when reading. Comfortable with code, so code is the bridge: a loop
is a sum, a function is a mapping, a `%` is modular arithmetic.

Freeze this — progress goes into `memory.md`, not here.

## Methodology

- **Remember first, then extend.** Every module opens with «Вспоминаем школу»: the school
  version of the topic in plain words, with the one or two facts everyone forgets. Only then
  the "grown-up" version and the programmer's use of it.
- **Zero unexplained notation.** Every symbol (Σ, ∏, ∈, ⊆, ∀, ∃, ⇒, ⇔, |A|, n!, C(n,k),
  log, ⌊x⌋, mod) is introduced the first time with a plain-Russian reading and a code
  analogue. A «Словарь обозначений» section lives in module 01 and is linked everywhere.
- **Why-first for programmers.** Each concept is motivated by a real programming situation
  before the definition: hash collisions → probability; p99 → percentiles; retry backoff →
  exponential growth; `%` and overflow → modular arithmetic; embeddings → vectors.
- **Worked examples step by step.** Never "obviously". Every example shows each
  transformation on its own line with a one-phrase reason.
- **Code as a second notation.** Show the same idea as a formula and as a short Go (or
  Python for quick numeric checks) snippet: `sum := 0; for i := 1; i <= n; i++ { sum += i }`
  next to Σ. Let the learner *verify* formulas by running code.
- **Intuition before rigor.** Proofs are shown when they teach a technique (induction,
  contradiction, counting two ways); otherwise an intuitive argument plus a check is enough.
- **Mistakes named.** Each module has «Типичные ошибки»: dividing by zero in probability,
  confusing permutations with combinations, log base confusion, "average hides p99",
  correlation vs causation, floating-point equality.
- **Drill daily, small.** Cards hold definitions, notation and key formulas; drills mix
  short computations (`exact`/`fuzzy`), multiple-choice concept checks and `free-form`
  "explain why" tasks with `check: manual`.

## Preferred sources / authors

Real, verifiable references only:
- **Khan Academy** — khanacademy.org (arithmetic, algebra, probability, statistics refreshers).
- **Lehman, Leighton, Meyer — "Mathematics for Computer Science"** (MIT OpenCourseWare 6.042,
  free PDF) — the canonical discrete math text.
- **Rosen — "Discrete Mathematics and Its Applications"**.
- **Graham, Knuth, Patashnik — "Concrete Mathematics"** (for sums, recurrences, asymptotics; cite pointedly).
- **Blitzstein & Hwang — "Introduction to Probability"** (free at probabilitybook.net) and Stat 110 lectures.
- **Paul Orland — "Math for Programmers"** (Manning, 2020).
- **3Blue1Brown** (Grant Sanderson, YouTube) — "Essence of Linear Algebra", "Essence of Calculus".
- **BetterExplained** — betterexplained.com (Kalid Azad) — intuition-first articles.
- **Paul's Online Math Notes** — tutorial.math.lamar.edu (algebra/calculus refreshers).
- **Go spec / pkg.go.dev** (`math`, `math/big`, `math/bits`, `math/rand/v2`), IEEE 754 basics
  via **"What Every Computer Scientist Should Know About Floating-Point Arithmetic"** (Goldberg, 1991).

## Explanation style

- Content in **Russian**; code, identifiers and standard notation in English/math symbols.
- **Warm, patient, not condescending.** The learner is smart and merely rusty. No "это
  элементарно". Light humor is welcome; sarcasm about forgetting is not.
- **Simple formulas as Unicode text, complex ones as LaTeX.** Inline: `x²`, `√x`, `≤`,
  `≠`, `×`, `·`, `Σ`, `∈`, fractions as `a/b`, subscripts as `x₁` — readable in any editor.
  When a formula has nested fractions, big operators with limits, matrices or multi-line
  alignment, use KaTeX (the UI renders it): inline `$\frac{n!}{k!(n-k)!}$`, display
  `$$\sum_{i=1}^{n} i = \frac{n(n+1)}{2}$$`, or a ```math fence. Step-by-step derivations
  may stay in ```text fences (one step per line, reason after `—`) or use `$$\begin{aligned}`.
  Never leave a bare `$` in prose (write «долларов» or escape as `\$`).
- Diagrams: ```mermaid for processes and decision trees (probability trees, algorithm
  flow, set relations as flowcharts); ```text ASCII for number lines, grids, Venn sketches,
  matrices, graphs of functions (small, ≤ 20 lines).
- Tables for formula cheat-sheets, distributions, growth comparisons.
- Each theory file: «Вспоминаем школу» → «Зачем программисту» → «Простыми словами» → «Точнее»
  (definitions/formulas) → «Разобранные примеры» → «В коде» → «Типичные ошибки» → «Шпаргалка
  формул» → «Словарь терминов» → «См. также».

## Out of scope

- **Competitive-programming algorithms** as such (that is a separate `algorithms` domain);
  here only the math behind them.
- **Rigorous analysis / abstract algebra / topology.** Calculus is intuition-level only.
- **Machine learning proper.** Only the vectors, probability and statistics it rests on.
- **Proof-heavy formalism.** No epsilon-delta, no axiomatic set theory.

## Optional folders

- `misc/` — reference files; link from theory/lessons via relative paths. Do not parse.
- `notes/` — user-owned `.md` notes managed by the UI. Do not write there unless asked.

## Links

- Memory: [`memory.md`](./memory.md)
- Roadmap: [`roadmap.md`](./roadmap.md)
- Index:   [`README.md`](./README.md)
