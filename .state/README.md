# .state/

Runtime state owned by the learning UI:

- `progress.sqlite` or `progress.json` — per-item status (todo/learning/known), last
  review timestamps.
- `srs.json` — SRS scheduler state (SM-2 box, ease factor, next due date) keyed by
  card `id`.
- `sessions/` — optional session logs.

**Do not edit files here from chat.** Claude treats this folder as opaque; the UI is
the single writer. If progress looks wrong, fix it from the UI or delete the specific
entry — do not hand-edit.

Everything here is derivable from content + user actions and can be rebuilt if lost
(progress history would be, obviously, lost).
