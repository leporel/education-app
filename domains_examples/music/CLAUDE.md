# CLAUDE.md — music

Domain-specific instructions. Loaded after the root `CLAUDE.md` at the start of every
session in this domain. Keep it short and factual.

## Goal

Take the learner from **zero musical knowledge** to: understanding how music is built
(rhythm, notes, scales, intervals, chords, keys, common progressions), hearing those
things in real songs, and **playing simple songs on two instruments** — acoustic/electric
**guitar** (open chords, strumming, basic scales) and a **keyboard** (a MIDI controller or
digital piano: chords in both hands, simple melodies, recording into a DAW). The end goal
is to be able to pick a song, figure out its chords, play it, and write a simple
progression of one's own.

## Starting level

**Complete beginner.** No instrument yet, never read notation, cannot name a note or
count a rhythm. Adult programmer: analytical, comfortable with systems and patterns
(the 12-note cycle, semitone arithmetic and MIDI numbers are a feature, not a bug), but
easily discouraged by "just feel it" advice and by finger pain in week one. May buy a
cheap guitar and a 49–61-key MIDI keyboard; assume a computer is available for a DAW,
tuner and metronome apps.

Freeze this — progress goes into `memory.md`, not here.

## Methodology

- **Theory and hands in parallel.** Modules 01–05 are the shared theory + ear core;
  modules 06–07 (guitar) and 08–09 (keyboard) apply it. Every theory concept is
  immediately shown on both instruments (fretboard and keyboard diagrams) so it becomes
  physical, not abstract. The learner may do only one instrument track first.
- **Twelve notes as a system.** Explain everything from the 12-semitone cycle: scale =
  pattern of steps, interval = number of semitones, chord = stack of intervals, key =
  transposed pattern. Give MIDI numbers (C4 = 60) as a programmer's anchor.
- **Rhythm before pitch.** Counting, subdivision and metronome habits come first; most
  beginner "sounds wrong" problems are rhythm.
- **Ear alongside theory.** Each theory module has listening/singing tasks; interval
  and chord-quality recognition is drilled continuously (real apps: musictheory.net,
  teoria.com, Functional Ear Trainer).
- **Songs early.** By the end of the first instrument module the learner plays a real
  3–4-chord song. Name real, well-known songs and their progressions; do not invent
  songs or attribute chords you are not sure about — say "проверь по табам/аккордам".
- **Short daily sessions.** 20–30 minutes: warm-up → technique → theory bit → song.
  Practice methodology (slow, loop the hard bar, metronome, record yourself) is taught
  explicitly.
- **Mistakes named.** Every module lists classic beginner problems: buzzing strings,
  muted adjacent strings, rushing, tense shoulders, looking at hands, learning shapes
  without knowing the notes, skipping rhythm.

## Preferred sources / authors

Real, verifiable references only:
- **musictheory.net** (lessons + exercises) and **teoria.com** (ear training).
- **Open Music Theory** — openmusictheory.github.io (free open textbook).
- **Michael Pilhofer & Holly Day — "Music Theory For Dummies"**.
- **Kostka & Payne — "Tonal Harmony"** (only for pointed harmony references).
- **Hooktheory** — hooktheory.com (progressions in real songs, "Hooktheory I/II").
- **JustinGuitar** — justinguitar.com (free beginner guitar course, grades 1–3).
- **Hal Leonard Guitar Method** (Will Schmid & Greg Koch).
- **Alfred's Basic Adult All-in-One Piano Course** (Palmer, Manus, Lethco).
- **Pianote / Lisa Witt**, **Bill Hilton — "How to Really Play the Piano"** (chord-based piano).
- YouTube educators: **Adam Neely**, **Rick Beato** ("The Beato Book"), **12tone**,
  **Andrew Huang**, **David Bennett Piano**, **Paul Davids** (guitar).
- Software: **MuseScore** (free notation), **Reaper** (DAW, free evaluation),
  **GarageBand** (macOS/iOS), **LMMS**, **Ableton Live Lite** (bundled with many
  controllers); free piano sounds: **Spitfire LABS**, **Salamander Grand Piano** samples;
  tuner/metronome apps: **GuitarTuna**, **Soundbrenner**.

## Explanation style

- Content in **Russian**; note names in **English letters** (C, D, E… with ♯/♭ or `#`/`b`),
  with the Russian «до-ре-ми» given once as a bridge. Chord symbols as in real chord
  charts (`Am`, `G7`, `Cmaj7`, `F#m`). Durations as «целая / половинная / четверть /
  восьмая» with the English in parentheses once.
- **Encouraging, concrete, systematic.** Explain the pattern, then show it on the
  fretboard and the keyboard. Light humor welcome; no mysticism about talent.
- Diagrams as ```text ASCII: keyboard layouts (one octave with black keys), fretboard
  maps and chord boxes (6 strings × frets), TAB, rhythm grids (`1 e & a`), circle of
  fifths as a list/table. ```mermaid for processes and decision flows (practice
  routine, "which chord fits", DAW signal chain). MuseScore can render real notation —
  suggest exporting PNGs into `misc/` when needed.
- Each theory file: «Простыми словами» → зачем → как устроено → на гитаре → на
  клавишах → «Послушай» (real song examples) → «Типичные ошибки» → «Словарь терминов»
  → «См. также».
- Cards: terms, formulas (major scale = T T S T T T S), chord spellings, interval
  semitone counts, MIDI numbers. Drills: `exact`/`fuzzy` for spelling scales/chords and
  counting semitones, `multiple-choice` for concepts, `free-form` `check: manual` for
  playing/listening/singing tasks with a time box and self-check rubric.

## Out of scope

- **Advanced harmony** (jazz reharmonization, modal interchange in depth, counterpoint).
- **Music production/mixing** (EQ, compression, mastering) — only enough DAW to record MIDI.
- **Singing technique** beyond "sing the interval back".
- **Classical piano technique / exam repertoire**; keyboard here is chord-and-song oriented.
- **Other instruments** (bass, drums, ukulele) — mention as related, don't teach.

## Optional folders

- `misc/` — chord charts, notation PNGs from MuseScore, recordings of the learner. Do not parse.
- `notes/` — user-owned `.md` notes managed by the UI. Do not write there unless asked.

## Links

- Memory: [`memory.md`](./memory.md)
- Roadmap: [`roadmap.md`](./roadmap.md)
- Index:   [`README.md`](./README.md)
