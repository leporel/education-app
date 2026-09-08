# CLAUDE.md — system-design

Domain-specific instructions. Loaded after the root `CLAUDE.md` at the start of every
session in this domain. Keep it short and factual.

## Goal

Prepare the learner to **pass system design interviews for a Go backend developer**
(middle → senior) and, as a side effect, to reason about real backend architecture at
work. After the course the learner can: take a vague prompt ("design a messenger"),
extract requirements, estimate load, draw a high-level design, pick storage/cache/queue
with justification, dig into one component, and defend trade-offs out loud — in
45–60 minutes. Secondary goal: answer the Go-specific "how would your service behave
under X" questions that come up in the same interview.

## Starting level

Practicing **Go** developer. Has written HTTP/gRPC services, used PostgreSQL and Redis
from application code, knows goroutines/channels/`context`. **New to** system design as a
discipline: has never done a whiteboard design interview, has only a vague feel for
replication, sharding, consistency models, message brokers, consensus, rate limiting
algorithms, back-of-envelope estimation, and the interview format itself. Assume the
learner may not know even the "obvious" terms (what a load balancer really does, what
"stateless" buys you, what a partition is). Explain everything once, simply.

Freeze this — progress goes into `memory.md`, not here.

## Methodology

- **Interview-shaped.** Every topic is taught the way it is *asked*: what the interviewer
  probes, what a strong answer sounds like, what a weak one sounds like. Module 01 sets
  the framework (requirements → estimates → high-level → deep dive → trade-offs); every
  later module plugs into it.
- **Simple first, then precise.** Introduce each concept with a one-paragraph
  «Простыми словами» explanation and a real-life analogy, then the exact definition and
  the trade-off. No term is used before it has been explained.
- **Trade-offs, not answers.** There is no single correct design. Always name at least
  two options and the reason to pick one. "It depends" must be followed by *on what*.
- **Anchor on Go and on things the learner has touched.** Map abstractions to concrete
  code the learner already knows: `database/sql` pool, `net/http` server, `context`
  cancellation, goroutine worker pools, `singleflight`, `x/time/rate`. Show short Go
  snippets where they clarify (not full services).
- **Numbers matter.** Practice back-of-envelope estimation in every module: QPS, storage,
  bandwidth, latency budgets. Use the well-known "latency numbers" table as a reference.
- **Failure-first.** For every component ask: what happens when it is slow, dead, or
  partitioned? Timeouts, retries, idempotency, backpressure are recurring characters.
- **Drill by speaking.** `drill` blocks include `free-form`/`manual` tasks that ask the
  learner to explain a design out loud or write a 5-line design sketch; cards cover
  definitions, numbers, and "which option when".
- **Real references only.** Cite DDIA, Alex Xu, SRE book, official docs, well-known
  papers (Raft, Dynamo). Never invent an engineering blog post.

## Preferred sources / authors

Real, verifiable references only:
- **Martin Kleppmann — "Designing Data-Intensive Applications"** (O'Reilly, 2017) — the
  canonical deep source for storage, replication, partitioning, consistency, streams.
- **Alex Xu — "System Design Interview: An Insider's Guide"** vol. 1 (2020) and vol. 2
  (2022, with Sahn Lam); bytebytego.com — interview-format walkthroughs.
- **Google SRE books** — sre.google/books (SLO/SLI, cascading failures, load shedding).
- **Michael Nygard — "Release It!"** (2nd ed., 2018) — stability patterns: circuit
  breaker, bulkhead, timeouts.
- **Raft** — raft.github.io; Ongaro & Ousterhout, "In Search of an Understandable
  Consensus Algorithm" (2014). **Dynamo** — DeCandia et al., SOSP 2007.
- **Jepsen** — jepsen.io/consistency (consistency models map).
- **microservices.io** (Chris Richardson) — saga, outbox, API gateway patterns;
  **martinfowler.com** — CQRS, Event Sourcing, microservices essays.
- **12factor.net**.
- Official docs: postgresql.org/docs, redis.io/docs, kafka.apache.org/documentation,
  nats.io/docs, etcd.io/docs, pkg.go.dev (`database/sql`, `net/http`, `context`,
  `golang.org/x/sync`, `golang.org/x/time/rate`), grpc.io.
- "Latency Numbers Every Programmer Should Know" (Jeff Dean's numbers; interactive
  version by Colin Scott: colin-scott.github.io/personal_website/research/interactive_latency.html).

## Explanation style

- Content in **Russian**; code, identifiers, protocol names and product names in English.
- **Engaging, not dry.** Conversational tone, vivid analogies (a cache is a sticky note
  on the fridge, a queue is a post office), light humor where it lands.
- Each theory file: «Простыми словами» → why it exists → how it works → trade-offs →
  «Как это спрашивают на собеседовании» → «Типичные ошибки» → «Глоссарий».
- **Diagrams are mandatory** where a picture helps: every architecture, data flow,
  request path, replication/partition scheme, state machine gets a ```mermaid fence
  (`flowchart LR`/`TD`, `sequenceDiagram`, `stateDiagram-v2`). Keep each diagram small
  (≤ 12 nodes), quote labels with special characters (`A["Load balancer (L7)"]`),
  Russian labels are fine. Tiny box-and-arrow sketches may stay as `text` fences.
- Numbers in tables. Estimates shown step by step with units.
- When a Go snippet helps, keep it under ~25 lines and comment *why*, not what.
- Prefer PostgreSQL, Redis, Kafka, NATS, etcd, gRPC, Kubernetes as the "default stack"
  in examples, because that is what Go backend interviews assume; mention alternatives.

## Out of scope

- **Coding/algorithm interviews** (LeetCode-style) — separate concern.
- **Deep Go language teaching** — the learner knows Go; only system-level Go behavior
  (pools, context, goroutine leaks, GC pauses) is covered, in module 09.
- **Frontend, mobile, ML system design.**
- **Cloud-provider specifics** (AWS/GCP service catalogs) — mention as examples only.
- **Deep Kubernetes / infra ops** — one honest overview, no manifests.

## Optional folders

- `misc/` — reference files; link from theory/lessons via relative paths. Do not parse.
- `notes/` — user-owned `.md` notes managed by the UI. Do not write there unless asked.

## Links

- Memory: [`memory.md`](./memory.md)
- Roadmap: [`roadmap.md`](./roadmap.md)
- Index:   [`README.md`](./README.md)
