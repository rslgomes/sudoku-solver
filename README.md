# Sudoku Solver (Readme done with AI assistance)

Interactive, accessible Sudoku tool built with **React 19**, **TypeScript**, **Tailwind CSS v4**, and **Vite**. Two modes: play/annotate a puzzle on the **Home** page; step-by-step solving on the **Solver** page (in progress).

---

## Current Features

### Home — Playable Grid

**Grid**

- 9×9 cell grid with visual subgrid (3×3 box) borders
- Multi-cell selection via Shift/Ctrl/Meta + click or Space bar

**Tools**
| Tool | What it does |
|------|-------------|
| Pen | Write a digit into selected cells; press same digit again to clear |
| Pencil | Toggle candidate notes (small 3×3 mini-grid per cell) |
| Eraser | Click a square to clear its value and notes (no action button — click acts directly) |
| Paint | Apply a background color to selected cells (6 colors + clear) |
| Lock | Click a square to toggle it between editable and given (locked) |

**Undo & Reset**

- Up to 100-step undo history via `useReducer`
- Undo + Reset buttons in the Toolbox (icon-based; reset uses a circular-arrow icon)

**Highlighting & feedback** (gated by settings)

- Peer highlight: on hover/focus, highlight the row, column, and box of the active cell (`highlightPeersOnHover`)
- Same-number highlight: matching digits ringed green (`highlightSameNumber`)
- Error cells ringed red — live while typing (`autoError`) or once the board is full
- Transient "wrong" pulse animation on rejected moves (`blockWrong`)

**Timer**

- LED-style mm:ss timer in the footer (`Timer` + `LedNumber`), gated by `showTimer`
- Starts when a puzzle is loaded; auto-pauses when the board is solved (`isSolved`)

**Puzzle Input (aside panel)**

- Separate 9×9 form for entering a new puzzle
- Digit-only inputs, `inputMode="numeric"`, max length 1
- Arrow-key navigation between cells; Backspace moves back and clears
- Space/0 skips a cell;
- Paste strips non-digit chars and fills from focused cell
- Submit loads puzzle into the grid via URL navigation

**Layout**

- Window-style chrome wraps the grid: accent **title bar** (logo, h1, "New" puzzle dialog trigger, dark-mode toggle) + **menu bar** (ConfigMenu) + **footer** (Timer)
- Puzzle input opens in a modal dialog via the "New" button (`DialogTrigger`) — replaces the old mobile FAB / desktop aside (`FABDialogOrAside`, `MainHeader` removed)
- Skip-to-main-content link (visible on focus)

**Settings menu**

- `ConfigMenu` dropdown (native `<details>`/`<summary>`) with `role="menuitemcheckbox"` items — stays open on toggle
- Settings: highlight peers on hover, highlight same number, show remaining count, show lock tool, show timer, auto error, block wrong input, auto clear pencil marks
- All settings held in `ConfigContext` (`GridSettings`) and consumed via `useConfig()`

**Theming**

- Light / Dark toggle persisted in `localStorage`.

---

### Accessibility & WAI-ARIA

The grid implements the [WAI-ARIA Grid pattern](https://www.w3.org/WAI/ARIA/apg/patterns/grid/).

**Roles & attributes**

- `role="grid"` with `aria-label="Sudoku puzzle, 9 by 9 grid"` and `aria-multiselectable="true"`
- `role="row"` / `role="gridcell"` for every cell
- `aria-selected` reflects selection state
- `aria-readonly` on locked (given) cells
- Per-cell `aria-label` describes position and content: `"Row 3, column 7, given 5"` / `"Row 1, column 1, empty, candidates 1, 3, 7"`
- _Bugfix_: sub-grid was changed to `aria-hidden="true"` (content already exposed via cell label)

**Focus management**

- Roving `tabIndex` — only one cell in `tabIndex=0` at a time;
- Grid keyboard contract:

| Key                  | Action                        |
| -------------------- | ----------------------------- |
| Arrow keys           | Move focus one cell           |
| Home / End           | First / last cell in row      |
| Ctrl+Home / Ctrl+End | First / last cell in grid     |
| 1–9                  | Write digit (Pen/Pencil mode) |
| Space                | Toggle-select focused cell    |
| Escape               | Clear all selection           |
| Delete / Backspace   | Erase selected cells          |

**Live regions**

- `role="status"` + `aria-live="polite"` announces mode changes (e.g. "Pencil mode active — mark candidate numbers in a square")

**Puzzle input form**

- Same `role="grid/row/gridcell"` structure with `aria-rowindex` / `aria-colindex`
- Actual `<input>` elements inside each gridcell — native label/value semantics preserved

**Landmarks & navigation**

- `<main id="main-content">` as primary landmark
- Skip-to-main-content link (`.sr-only`, visible on focus) at top of layout
- `<VisuallyHidden>` component for screen-reader-only text

---

### Tech Stack

- React 19 + TypeScript
- Tailwind CSS v4 with `@theme` design tokens
- Vite + `@tailwindcss/vite`
- TanStack Router (file-based, type-safe search params)
- Bun as package manager / runtime
- Context API + `useReducer` for grid state

### Project Structure

```
src/
├── pages/
│   ├── home/             # Home page; ConfigContext + GridContext providers
│   └── solver/           # Solver page (stub)
├── shared/
│   ├── components/
│   │   ├── PlayableGrid/
│   │   │   ├── contexts/ # gridContext, configContext
│   │   │   ├── hooks/    # usePadActions, usePlay, useSelection, ...
│   │   │   ├── Toolbox, Pad, PuzzleGrid
│   │   │   └── index     # grid + toolbox + pad layout
│   │   ├── Timer/        # LED-style timer (index, LedNumber)
│   │   ├── ConfigMenu    # settings dropdown
│   │   └── PuzzleInput   # Puzzle entry form
│   ├── contexts/         # PreferencesContext (theme)
│   ├── layouts/          # MainLayout (Header, Footer, DialogTrigger); MainHeader + FABDialogOrAside removed
│   ├── libs/             # cn helper, validation
│   └── ui/               # Button, Dialog, DisclosureMenu, Dropdown, ToggleButton, VisuallyHidden
├── router.tsx
└── main.tsx
```

---

## Roadmap

### Routing

- [ ] **Share route** — `/share?grid=<81-digit string>` redirects to `/` and calls `fillGrid` with the decoded puzzle; lets users share a specific puzzle via URL without exposing grid state in the home route's search params

### Home page (✓ for use)

- [~] **Solve check** — detection done (`isFilled` / `isSolved`; timer pauses on solve). Pending: explicit "solved!" trigger/feedback on the last entry
- [x] **Sight highlight** — peer (row/col/box) highlight on hover/focus, gated by `highlightPeersOnHover`
- [~] **Success / failure feedback** — per-cell error ring + "wrong" pulse animation done. Pending: full-board success/fail UI (banner, animation, or color wash)
- [ ] **Logo redesign** — retro/old-computer-program aesthetic, pixel or monospace feel
- [x] **Undo button styling** — Toolbox undo/reset now icon-based, matching the toolbox
- [x] **Settings menu** — `ConfigMenu` dropdown with all toggles wired to `ConfigContext`; features conditionally driven by `useConfig()`

### Solver page

- [ ] **Wire `usePlay` to solver** — connect the existing grid hook to a `solver.ts` module
- [ ] **Brute-force solver** — backtracking algorithm as the fallback when no technique applies
- [ ] **Technique-first solving architecture** — orchestrator that tries registered techniques in order; falls back to brute force when all techniques are exhausted
- [ ] **Brute-force animation** — step-by-step playback of backtracking (fast-forward / pause / step controls)
- [ ] **Technique display animation** — highlight affected cells, show which constraint fired, explain the technique in plain text before applying it
- [ ] **Techniques (implement one at a time)**
  - [ ] Further techniques TBD
