# Sudoku Solver

Interactive, accessible Sudoku tool built with **React 19**, **TypeScript**, **Tailwind CSS v4**, and **Vite**.

Three modes share one window-style UI (header logo + `Play`/`Solve` tabs + theme toggle):

| Mode      | Route     | Status                                              |
| --------- | --------- | --------------------------------------------------- |
| **Play**  | `/`       | ✅ Done — playable, annotatable grid (QoL only now) |
| **Share** | `/share`  | ✅ Works — link round-trips a puzzle back into Play |
| **Solve** | `/solver` | ✅ Working — animated, explained solve walkthrough  |

> README written with AI assistance.

---

## Play

### Grid & tools

9×9 grid with 3×3 box borders. Select cells with click, Shift/Ctrl/Meta+click, or Space.

| Tool   | Action                                                       |
| ------ | ------------------------------------------------------------ |
| Pen    | Write a digit; press the same digit again to clear           |
| Pencil | Toggle candidate notes (3×3 mini-grid per cell)              |
| Eraser | Click a cell to clear its value and notes                    |
| Paint  | Apply a background color (5 colors + clear)                  |
| Lock   | Toggle a cell between editable and given (hidden by default) |

- **Undo** up to 100 steps (`usePlay` reducer history)
- **Reset** to the initial puzzle (confirmation dialog)

### Feedback (settings-gated)

- **Peer highlight** — row/column/box of the active cell on hover/focus
- **Same-number highlight** — matching digits ringed green
- **Error cells** — conflicts ringed red, live while typing or once the board is full
- **Wrong-move pulse** — transient animation on rejected input
- **LED timer** — starts on load, auto-pauses on solve; `Solved!` dialog shows final time

### Puzzle input

`New` opens a modal with a separate 9×9 form: digit-only inputs, arrow-key nav, Backspace clears + moves back, Space/0 skips, paste fills from the focused cell stripping non-digits. Submitting loads the puzzle into the grid.

### Settings (`ConfigMenu`)

Held in `ConfigContext`, consumed via `useConfig()`: highlight peers on hover · highlight same number · show remaining count · show lock tool · show timer · auto error highlight · block wrong input · auto clear pencil marks. Theme (light/dark) persists in `localStorage`.

---

## Accessibility

Implements the [WAI-ARIA Grid pattern](https://www.w3.org/WAI/ARIA/apg/patterns/grid/).

- `role="grid/row/gridcell"`, `aria-multiselectable`, `aria-selected`, `aria-readonly` on givens
- Per-cell `aria-label` describes position + content (`"Row 3, column 7, given 5"`)
- Roving `tabIndex` (one focusable cell at a time)
- `role="status"` live region announces mode changes
- Puzzle-input form mirrors the grid roles with native `<input>` semantics and `aria-row/colindex`
- `<main>` landmark + skip-to-content link (`.sr-only`, visible on focus)

| Key                  | Action                     |
| -------------------- | -------------------------- |
| Arrow keys           | Move focus one cell        |
| Home / End           | First / last cell in row   |
| Ctrl+Home / Ctrl+End | First / last cell in grid  |
| 1–9                  | Write digit (Pen/Pencil)   |
| Space                | Toggle-select focused cell |
| Escape               | Clear selection            |
| Delete / Backspace   | Erase selected cells       |

---

## Share

`Share` copies a `/share?grid=…` link to the clipboard — either the **initial** givens or the **current** state. Opening that link redirects to Play and hydrates the grid (puzzle passed via router history state, so the digits stay out of the visible URL). Boards encode as an 81-char digit string (`shared/sudoku/codec.ts`).

---

## Solve

Load a puzzle (`New`, same input widget as Play) and watch it get solved as a sequence of **scenes** — each scene is one technique application, carrying its own explanation, animation, and board changes. Solve reads only the **initial givens** (`serializeGrid(grid, 'initial')`), never mid-progress user input.

### Solver pipeline

`solve()` (`features/solve/solve.ts`) runs registered techniques in complexity order, folding each returned Scene's deltas into the board (`applySteps`), repeating until solved or stuck. A technique is a pure `run(grid) => Scene | null` (`null` = didn't apply) — it never mutates the grid.

Techniques run in this order; the first one that returns a Scene wins, then the loop restarts from the top:

| Technique             | What it does                                                                                   |
| --------------------- | ---------------------------------------------------------------------------------------------- |
| **checkEmptySquares** | Reports a cell with no value and no notes left — the puzzle has no solution                    |
| **clearNotes**        | Removes peers' values from a cell's candidate notes                                            |
| **nakedSingle**       | A cell down to one note gets written                                                           |
| **hiddenSingle**      | A value with one remaining home in a unit gets written                                         |
| **lockedCandidates**  | Pointing + claiming, as one band/stack × box bitmask scan                                      |
| **bruteForce**        | Constraint propagation (naked + hidden singles) + MRV backtracking; terminal fallback (Norvig) |

A scene that changes nothing halts the loop (`sameBoard` guard), so a technique that reports without progressing — `checkEmptySquares`, or `bruteForce` refusing an unsolvable grid — terminates instead of spinning.

### Locked candidates as bitmasks

`lockedCandidates` condenses pointing and claiming into one operation. A row only ever meets 3 boxes — the ones in its band — so per digit the grid reduces to 6 3×3 matrices (3 bands of rows × boxes, 3 stacks of columns × boxes), each packed into the low 9 bits of one `Uint16Array` slot. Slot `line * 3 + box` is set when the digit appears anywhere in that 3-cell intersection.

Both rules are then the same scan on opposite axes: **a slice of the matrix with exactly one occupied slot clears the perpendicular slice through it**. A line confined to one box is claiming; a box confined to one line is pointing. Row and column geometry differ only in which matrix feeds the scan, so the detection code never branches on it.

### Brute-force walkthrough

The brute-force solver doesn't just return placements — it exposes the search at **pulse granularity**. One pulse is one inference wave: a trigger cell collapses, fans its value to every peer, strikes the candidates that die, and settles. The eliminations are the interesting part, so each becomes a step with its own `removeNotes` delta.

Norvig's `eliminate`/`assign` recurse depth-first, so the first peer's entire downstream cascade runs before the second peer is touched — faithful animation of that looks like a random walk. `propagate` replaces the recursion with a **FIFO worklist**, so one trigger clears all its peers before the next trigger is processed. Both inference rules are monotone candidate deletions, so the fixpoint is identical and the search tree is unchanged; only which contradiction is hit first differs, and any contradiction is a valid refutation.

Speculative branches are visible on the grid, in notes only. A rejected guess applies its eliminations as it propagates, then a **retract step** puts back exactly what it removed. This is why guesses never write values: `removeNotes` has an inverse (`addNotes`), `setValue` does not. Only the committed spine writes values. Rejected lines that survive propagation and need deeper search to refute collapse into one summary step, keeping the walkthrough watchable.

Colors carry the state: yellow speculative, green committed, red contradiction, blue evidence and retraction. Every step also carries a plain-language `note` — which cell was placed, the rule that forced it, how many candidates fell, and the contradiction when a wave dies.

When no solution exists, the technique says so instead of returning `null`, with the reason it found: conflicting givens, propagation dying before any guess, or every value at the most-constrained cell exhausted.

### Scene model (`features/explain/types.ts`)

`Solution → Scene[] → SceneStep[] → Beat[]`.

- **Scene** — one technique: `title`, `explanation` (with cue markers), `steps`.
- **Step** — a navigable checkpoint: animation `beats`, an optional `cue`, an optional `note` (plain prose for this step alone), and optional `CellDelta[]` (`setValue` / `addNotes` / `removeNotes`). Note deltas are invertible — `addNotes` undoes `removeNotes` — but `setValue` is not, which is why speculative work stays in notes. A filled cell ignores stale notes (**value-wins**, enforced by `getCandidates`).
- **Beat** — a `(cells) => Animation[]` factory; pure animation, never touches data.

### Playback

`useStage` derives the displayed board as a **pure fold** of the initial grid plus every delta up to `(scene, step)`, so any position is seekable/rewindable. One instance is shared through `StageContext`:

- **GridStage** — renders the folded board and registers cell elements as animation targets.
- **WalkthroughControls** — scene/step navigation + progress readout.
- **ExplanationScript** — renders the scene prose line by line in a fixed-height scroll box, with the current step's `note` above it; `{{id|text}}` markers become clickable **cues** that jump to the matching step.
- **atoms** (`highlightValues`, `highlightNotes`, `drawPolyline`, `drawFan`) — inject self-cleaning overlay pulses and SVG strokes via the Web Animations API, played on step entry (`snap` mode skips them; the fold already shows the result). All take a color and a `delay`, which is the only sequencer: a step's beats all fire at once, so ordering within a step is staggered in milliseconds (`BEAT_MS`). `drawFan` emits one SVG with a spoke per target — a polyline is a single connected path and can't express a trigger fanning out to its peers.

During playback the current step's delta is **withheld until its animations settle**, so a strike animates while its candidates are still on screen rather than after they've vanished. In `snap` mode it applies immediately.

On load the solve grid seeds every empty cell with all 9 candidate notes; `clearNotes` then prunes them.

The solver page locks to the viewport (`MainLayout lockViewport`): the grid sizes from viewport dimensions only (`min(100%, 100dvh − reserve)`, always square), the explanation takes whatever height is left, and the page itself never scrolls.

---

## Tech & architecture

- **React 19 + TypeScript**, **Tailwind CSS v4** (`@theme` tokens), **Vite**
- **TanStack Router** — file-based, type-safe search params
- **Bun** as package manager / runtime
- `@heroicons/react`, `vite-plugin-svgr` (logo as a React component)
- Path aliases: `@assets` `@features` `@pages` `@shared` `@styles`

Both the Play and Solve grids live at the router root (`RootShell`), so their state survives route changes. Play state is composed by `useControllerOrchestrator`, which merges focused hooks (`usePlay` reducer, `useMoves`, `useSelection`, `useTimer`, `useMeta`, `usePulse`, `useSolveAlert`) into a single `ControllerContext`. Solve uses a lean `useSolveGridState` (`grid` + `load` + the memoized `solution`, so a puzzle is solved once and `useStage` only plays it back). `NewPuzzleButton` / `PuzzleInput` are shared and take an `onSubmit` callback, so both routes reuse them.

The pure Sudoku core (`shared/sudoku/`) holds codec, peers, units, error rules, and types — independent of React. `PEERS` derives from `UNITS`; `getCandidates` enforces the value-wins invariant.

```
src/
├── pages/          # route shells: home (Play), solver (Solve)
├── features/
│   ├── play/       # interactive grid — controller hooks + widgets
│   ├── solve/      # pure solver: techniques + solve() pipeline
│   └── explain/    # playback of a Solution — stage, animation, script
├── shared/
│   ├── sudoku/     # React-free core: codec, peers, units, rules, types
│   ├── components/ # SudokuGrid, puzzle input, mode tabs
│   ├── ui/         # buttons, dialogs, menus
│   └── layouts/    # MainLayout (header/footer)
├── router.tsx      # RootShell holds grid state · /, /solver, /share
└── main.tsx

```

### Scripts

```bash
bun dev       # vite dev server
bun run build # tsc -b && vite build
bun lint      # eslint
bun preview   # preview production build
```

---

## Testing

> Planned, not built. No test dependencies are installed yet. Vitest is the natural runner — [vite.config.ts](vite.config.ts) already defines the path aliases, so tests inherit module resolution with no extra config.

### Accessibility

Two layers, because they catch disjoint classes of bug.

**Static (axe-core)** — render each route, assert zero violations. Catches missing labels, role misuse, contrast regressions. Cheap and fast, but structurally blind to anything stateful.

**Behavioral (testing-library + user-event)** — the WAI-ARIA Grid pattern is *behavior*, and axe cannot see it. The keyboard table in [Accessibility](#accessibility) is the spec: arrow-key movement, Home/End and Ctrl+Home/Ctrl+End, digit entry per tool, Space to toggle selection, Escape to clear, Delete to erase. Alongside those: roving `tabIndex` (exactly one focusable cell at any time), `aria-selected` tracking the selection, `aria-readonly` on givens, and the `role="status"` region announcing mode changes.

### Known environment constraints

The animation layer does not survive jsdom untouched:

| Missing in jsdom | Breaks |
| ---------------- | ------ |
| `Element.prototype.animate` | every beat in `atoms.ts` |
| `SVGGeometryElement.getTotalLength` | `drawPolyline`, `drawFan` |
| real `getBoundingClientRect` | fan/polyline geometry (returns zeros) |

Most component tests can avoid all three by keeping `useStage` in `snap` mode, which skips beats entirely. Testing the **deferred delta** — the behavior that lets a strike animate while its candidates are still on screen — needs `play` mode, so it needs a WAAPI stub with a controllable `finished` promise.

### Technique evaluation — design note, not planned

Sketched here so the reasoning isn't lost; no work scheduled.

Each technique is a binary classifier, and the oracle is a **second implementation of the same rule** — written naively, sets instead of bitmasks, clarity over speed. Comparing the two across a corpus of grid states is what caught three real bugs during development (a matrix index built from the wrong coordinate, a transposed `slotSquares`, and a `nakedSingle` guard that ignored note-level eliminations).

| | reference finds ≥1 | reference finds none |
| --- | --- | --- |
| **technique fires** | TP | FP |
| **technique silent** | FN | TN |

Sensitivity = TP/(TP+FN) · Specificity = TN/(TN+FP).

Three things that would shape the implementation:

- **Soundness is a hard failure, not a rate.** Every elimination claimed must appear in the reference set. An unsound elimination corrupts the board; a missed one merely falls through to the next technique. Different severity, different assertion.
- **Sensitivity means "fires when something exists", not "finds every instance".** Most techniques deliberately return the first application and let the pipeline restart. Scoring recall per instance would mark correct code as broken.
- **Specificity is nearly free.** Non-applicable states dominate any realistic corpus; it's sensitivity that needs targeted sampling.

Corpus options, cheapest first: snapshot every intermediate state the pipeline passes through on dug-out grids (no uniqueness guarantee, tests the real state distribution); or add a **solution counter** to `bruteForce` — `search` currently stops at the first solution — and dig holes only while the puzzle stays uniquely solvable, which is also the prerequisite for a puzzle generator or difficulty grading.

Worth adding once a corpus exists: **mutation testing**. Flip `BANDS` to 2, swap `lineOf`/`boxOf`, weaken `isSingle`, and assert the harness catches it — that measures the tests rather than the code.

---

## Roadmap

**Play** — logo redesign (retro / monospace pixel feel); ongoing QoL.

**Solve** (current focus)

- [x] Grid state lifted to the router — survives route changes
- [x] Brute-force solver (constraint propagation + MRV, terminal fallback)
- [x] Technique-first orchestrator — try techniques in order, fall back to brute force
- [x] Scene model — technique emits explanation + animation + deltas together
- [x] Playback — seekable board fold, scene/step navigation, cued explanation
- [x] Technique animation — pulse affected cells (`highlightValues` / `highlightNotes`)
- [x] Brute-force guess playback — pulse-level waves, speculative branches applied and retracted on the grid
- [x] Per-step narration (`SceneStep.note`) + deferred deltas so eliminations animate before they land
- [x] Unsolvable puzzles reported with a reason instead of a missing scene
- [x] Naked single · hidden single · locked candidates (pointing + claiming)
- [ ] Walkthrough controls — autoplay with play / pause / speed
- [ ] Cross-route puzzle transport — carry a puzzle between Play and Solve
- [ ] Solve off the main thread — the pathological anti-brute-force puzzle freezes the UI for minutes

**Testing** (next focus)

- [ ] Vitest + jsdom setup, WAAPI/SVG stubs for the animation layer
- [ ] axe-core smoke tests per route
- [ ] Behavioral a11y suite — the keyboard table as spec, roving tabIndex, `aria-selected`, live region
- [ ] Technique evaluation harness — deferred, see [Testing](#technique-evaluation--design-note-not-planned)

### Technique backlog

Roughly by implementation cost. Everything through the cross-unit tier covers most published "hard" puzzles; the chain tiers are for the walkthrough's sake, not for coverage.

**Subsets** — naked pair / triple / quad · hidden pair / triple / quad. One generalized routine each over combinations.

**Cross-unit** — X-Wing · skyscraper · 2-string kite · swordfish · jellyfish (one generalized fish routine at sizes 2–4) · XY-wing · XYZ-wing · W-wing.

**Chains & colouring** — simple colouring · remote pairs · finned / sashimi X-Wing · X-chain · XY-chain. These need a strong/weak link graph, and the narration has to say which link is which.

**Advanced** — BUG+1 · unique rectangle types 1–4 · ALS-XZ · AIC / forcing chains · death blossom.

Worth building first: a shared `eliminationScene()` helper. Every technique below the chain tier is the same two-step shape — highlight the base cells, then strike the notes — so writing it once makes each new technique roughly thirty lines.
