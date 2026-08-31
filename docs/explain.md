# Explain — scene model & playback

The solver emits data; `features/explain/` plays it back. Nothing in the solver knows about the DOM, and no beat touches data.

## Scene model

[src/features/explain/types.ts](../src/features/explain/types.ts) — `Solution → Scene[] → SceneStep[] → Beat[]`.

- **Scene** — one technique application: `title`, `explanation` (with cue markers), `steps`.
- **Step** — a navigable checkpoint: animation `beats`, an optional `cue`, an optional `note` (plain prose for this step alone), and optional `CellDelta[]` (`setValue` / `addNotes` / `removeNotes`). Note deltas are invertible — `addNotes` undoes `removeNotes` — but `setValue` is not, which is why speculative work stays in notes. A filled cell ignores stale notes (**value-wins**, enforced by `getCandidates`).
- **Beat** — a `(cells) => Animation[]` factory; pure animation.

## Playback

`useStage` derives the displayed board as a **pure fold** of the initial grid plus every delta up to `(scene, step)`, so any position is seekable and rewindable. One instance is shared through `StageContext`:

- **GridStage** — renders the folded board and registers cell elements as animation targets.
- **WalkthroughControls** — scene/step navigation + progress readout.
- **ExplanationScript** — renders the scene prose line by line in a fixed-height scroll box, with the current step's `note` above it; `{{id|text}}` markers become clickable **cues** that jump to the matching step.
- **atoms** (`highlightValues`, `highlightNotes`, `drawPolyline`, `drawFan`) — inject self-cleaning overlay pulses and SVG strokes via the Web Animations API, played on step entry (`snap` mode skips them; the fold already shows the result). All take a color and a `delay`, which is the only sequencer: a step's beats all fire at once, so ordering within a step is staggered in milliseconds (`BEAT_MS`). `drawFan` emits one SVG with a spoke per target — a polyline is a single connected path and can't express a trigger fanning out to its peers.

During playback the current step's delta is **withheld until its animations settle**, so a strike animates while its candidates are still on screen rather than after they've vanished. In `snap` mode it applies immediately.

## Layout

The solver page locks to the viewport (`MainLayout lockViewport`): the grid sizes from viewport dimensions only (`min(100%, 100dvh − reserve)`, always square), the explanation takes whatever height is left, and the page itself never scrolls.
