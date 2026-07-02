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

| Technique      | What it does                                                                                   |
| -------------- | ---------------------------------------------------------------------------------------------- |
| **clearNotes** | Removes peers' values from a cell's candidate notes                                            |
| **bruteForce** | Constraint propagation (naked + hidden singles) + MRV backtracking; terminal fallback (Norvig) |

### Scene model (`features/explain/types.ts`)

`Solution → Scene[] → SceneStep[] → Beat[]`.

- **Scene** — one technique: `title`, `explanation` (with cue markers), `steps`.
- **Step** — a navigable checkpoint: animation `beats`, an optional `cue`, and optional `CellDelta[]` (`setValue` / `addNotes` / `removeNotes`). Deltas are invertible; a filled cell ignores stale notes (**value-wins**, enforced by `getCandidates`).
- **Beat** — a `(cells) => Animation[]` factory; pure animation, never touches data.

### Playback

`useStage` derives the displayed board as a **pure fold** of the initial grid plus every delta up to `(scene, step)`, so any position is seekable/rewindable. One instance is shared through `StageContext`:

- **GridStage** — renders the folded board and registers cell elements as animation targets.
- **WalkthroughControls** — scene/step navigation + progress readout.
- **ExplanationScript** — renders the scene prose; `{{id|text}}` markers become clickable **cues** that jump to the matching step.
- **atoms** (`highlightValues`, `highlightNotes`) — inject self-cleaning overlay pulses via the Web Animations API, played on step entry (`snap` mode skips them; the fold already shows the result).

On load the solve grid seeds every empty cell with all 9 candidate notes; `clearNotes` then prunes them.

---

## Tech & architecture

- **React 19 + TypeScript**, **Tailwind CSS v4** (`@theme` tokens), **Vite**
- **TanStack Router** — file-based, type-safe search params
- **Bun** as package manager / runtime
- `@heroicons/react`, `vite-plugin-svgr` (logo as a React component)
- Path aliases: `@assets` `@features` `@pages` `@shared` `@styles`

Both the Play and Solve grids live at the router root (`RootShell`), so their state survives route changes. Play state is composed by `useControllerOrchestrator`, which merges focused hooks (`usePlay` reducer, `useMoves`, `useSelection`, `useTimer`, `useMeta`, `usePulse`, `useSolveAlert`) into a single `ControllerContext`. Solve uses a lean `useSolveGridState` (`grid` + `load`). `NewPuzzleButton` / `PuzzleInput` are shared and take an `onSubmit` callback, so both routes reuse them.

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

## Roadmap

**Play** — logo redesign (retro / monospace pixel feel); ongoing QoL.

**Solve** (current focus)

- [x] Grid state lifted to the router — survives route changes
- [x] Brute-force solver (constraint propagation + MRV, terminal fallback)
- [x] Technique-first orchestrator — try techniques in order, fall back to brute force
- [x] Scene model — technique emits explanation + animation + deltas together
- [x] Playback — seekable board fold, scene/step navigation, cued explanation
- [x] Technique animation — pulse affected cells (`highlightValues` / `highlightNotes`)
- [ ] More techniques — hidden single next, then naked/pointing pairs, etc.
- [ ] Brute-force propagation playback — animate the naked/hidden-single cascade, not just bulk placements
- [ ] Walkthrough controls — autoplay with play / pause / speed
- [ ] Cross-route puzzle transport — carry a puzzle between Play and Solve
