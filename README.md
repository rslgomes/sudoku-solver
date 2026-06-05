# Sudoku Solver

Interactive, accessible Sudoku tool built with **React 19**, **TypeScript**, **Tailwind CSS v4**, and **Vite**.

Three modes share one window-style UI (header logo + `Play`/`Solve` tabs + theme toggle):

| Mode      | Route     | Status                                              |
| --------- | --------- | --------------------------------------------------- |
| **Play**  | `/`       | ✅ Done — playable, annotatable grid (QoL only now) |
| **Share** | `/share`  | ✅ Works — link round-trips a puzzle back into Play |
| **Solve** | `/solver` | 🚧 Scaffolding — UI stubs, no solver yet            |

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

## Tech & architecture

- **React 19 + TypeScript**, **Tailwind CSS v4** (`@theme` tokens), **Vite**
- **TanStack Router** — file-based, type-safe search params
- **Bun** as package manager / runtime
- `@heroicons/react`, `vite-plugin-svgr` (logo as a React component)
- Path aliases: `@assets` `@features` `@pages` `@shared` `@styles`

Play state is composed by `useControllerOrchestrator`, which merges focused hooks (`usePlay` reducer, `useMoves`, `useSelection`, `useTimer`, `useMeta`, `usePulse`, `useSolveAlert`) into a single `ControllerContext`. The pure Sudoku core (`shared/sudoku/`) holds codec, peers, error rules, and types — independent of React.

```
src/
├── pages/
│   ├── home/                 # Play — wires ControllerContext + ConfigContext
│   └── solver/               # Solve (stub)
├── features/
│   ├── play/
│   │   ├── PlayLayout · Puzzle · Toolbox · Pad · types
│   │   ├── hooks/            # usePlay, useMoves, useSelection, useTimer,
│   │   │                     #   useMeta, usePulse, useSolveAlert, orchestrator
│   │   ├── contexts/         # playControllerContext, playSettings
│   │   └── widgets/          # PuzzleInput, NewPuzzleButton, ShareButton,
│   │                         #   ConfigMenu, SolveAlert, Timer/
│   └── solve/                # SolutionDisplay, WalthroughtControls,
│                             #   ExplanationProse (stubs)
├── shared/
│   ├── sudoku/               # codec, peers, rules (getErrors), types
│   ├── components/           # SudokuGrid (ARIA grid, reused by play + solve), ModeTabs
│   ├── ui/                   # Button, Dialog, PromptDialog, ToggleButton,
│   │                         #   DisclosureMenu, VisuallyHidden
│   ├── layouts/MainLayout/   # Header (logo, tabs, actions, theme) + Footer
│   ├── contexts/             # PreferencesContext (theme)
│   └── libs/                 # cn, validation
├── router.tsx                # / play · /solver solve · /share → redirect to play
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

- [ ] Wire a `usePlay`-like to a `solver.ts` module
- [ ] Brute-force solver (fallback when no technique applies)
- [ ] Technique-first orchestrator — try registered techniques in order, fall back to brute force
- [ ] Brute-force animation — step / pause / fast-forward playback
- [ ] Technique animation — highlight affected cells, name the constraint, explain before applying
- [ ] Techniques (one at a time, TBD)
