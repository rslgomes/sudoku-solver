# Explain — scene model & playback

The solver emits data; `features/explain/` plays it back. Nothing in the solver knows about the DOM, and no beat touches data.

## Scene model

[src/features/explain/types.ts](../src/features/explain/types.ts) — `Solution → Scene[] → SceneStep[] → Beat[]`.

- **Scene** — one technique application: `title`, `explanation` (with cue markers), `steps`.
- **Step** — a navigable checkpoint: animation `beats`, an optional `cue`, an optional `note` (plain prose for this step alone), and optional `CellDelta[]` (`setValue` / `addNotes` / `removeNotes`). Note deltas are invertible — `addNotes` undoes `removeNotes` — but `setValue` is not, which is why speculative work stays in notes. A filled cell ignores stale notes (**value-wins**, enforced by `getCandidates`).
- **Beat** — a `(cells) => Animation[]` factory; pure animation.

## Playback

`useStage` derives the displayed board as a **pure fold** of the initial grid plus every delta up to `(scene, step)`, so any position is seekable and rewindable. Per-scene fold results (`sceneEntryBoards`) are cached so seeking doesn't re-run every prior scene's deltas. One instance is shared through `StageContext`:

- **GridStage** — renders the folded board and registers cell elements as animation targets. It also rings the current step's placed cells and colors their digit with the accent, reading from `evidence`.
- **WalkthroughControls** — scene/step navigation, play/pause, speed, the seek slider, and the Scenes dialog trigger.
- **SceneList** — a dialog listing every scene's title and step count (`outline`); picking one jumps straight to its first step (`navigation.goToScene`) without playing through what comes before.
- **ExplanationScript** — renders the scene prose line by line in a fixed-height scroll box, with the current step's `note` above it; `{{id|text}}` markers become clickable **cues** that jump to the matching step.
- **StageAnnouncer** — a `role="status"` live region that speaks scene entry (title + position), step entry (position + `note`), and playback state (`Walkthrough complete`, `Paused at the end of the scene`), so non-visual users get the same beats sighted users get from the grid and prose.
- **atoms** (`highlightValues`, `highlightNotes`, `drawPolyline`, `drawFan`) — inject self-cleaning overlay pulses and SVG strokes via the Web Animations API, played on step entry (`snap` mode skips them; the fold already shows the result). All take a color and a `delay`, which is the only sequencer: a step's beats all fire at once, so ordering within a step is staggered in milliseconds (`BEAT_MS`). `drawFan` emits one SVG with a spoke per target — a polyline is a single connected path and can't express a trigger fanning out to its peers.

During playback the current step's delta is **withheld until its animations settle**, so a strike animates while its candidates are still on screen rather than after they've vanished. In `snap` mode it applies immediately.

## Evidence highlighting

`StepEvidence` (`placed` / `struck` / `added`, keyed off the settled step's delta) tells the grid what just happened without re-deriving it from the fold: `GridStage` rings and bolds newly placed values in accent, and `Notes` renders struck candidates as a red strikethrough and added ones in bold accent, both alongside the plain candidates. Evidence is empty until the step settles, so it never appears mid-animation.

## Playback controls

- **Play/pause** (`playback.playing/play/pause`) auto-advances `stepForward` on a timer. Dwell time scales with the current step's `note` length (`READ_MS_PER_CHAR`, capped at `MAX_READ_MS`) plus a fixed `DWELL_MS`, then divides by `speed` — longer explanations get more time on screen, sped up or slowed down uniformly by the speed control. Running animations get `updatePlaybackRate` calls so an in-flight beat also respects a speed change.
- **Speed** — one of `SPEEDS` (`0.5×`–`4×`).
- **Pause at scene end** — when on (default), autoplay stops at the last step of each scene instead of rolling into the next technique; announced via `StageAnnouncer`.
- **Seek** — a range input over the whole walkthrough (`position.index`/`total`, flattened across all scenes); `navigation.seek`/`goToScene`/`goToCue` all land in `snap` mode so a long jump doesn't play through every intermediate animation.
- Any explicit navigation (`previousStep`, `seek`, a cue click, …) pauses playback first (`useStage`'s `paused` wrapper) — the walkthrough never fights the user for control of the current step.
- **Reduced motion** — `useReducedMotion` (a `prefers-reduced-motion: reduce` media query via `useSyncExternalStore`) forces every `roll('play')` down to `snap`, regardless of what the caller asked for.

Keyboard: `←`/`→` step, `Shift+←`/`Shift+→` scene, `Space` play/pause, `Home`/`End` jump to the first/last step of the whole walkthrough (`useShortcuts`, active while `WalkthroughControls` is mounted).

## Layout

The solver page locks to the viewport (`MainLayout lockViewport`): the grid sizes from viewport dimensions only (`min(100%, 100dvh − reserve)`, always square), the explanation takes whatever height is left, and the page itself never scrolls.
