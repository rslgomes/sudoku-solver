# Sudoku Solver

Interactive, accessible Sudoku tool that doesn't just solve a puzzle — it **explains the solve**, step by step, animated on the grid.

Built with **React 19**, **TypeScript**, **Tailwind CSS v4**, and **Vite**.

| Mode      | Route     | Status                                              |
| --------- | --------- | --------------------------------------------------- |
| **Play**  | `/`       | ✅ Done — playable, annotatable grid (QoL only now) |
| **Share** | `/share`  | ✅ Works — link round-trips a puzzle back into Play |
| **Solve** | `/solver` | ✅ Working — animated, explained solve walkthrough  |

## Highlights

- **Solver as a narrator.** Each technique returns a *Scene* — explanation, animation, and board deltas together — instead of just a placement. Techniques are pure `run(grid) => Scene | null`; the pipeline folds their deltas and restarts from the top.
- **Seekable playback.** The displayed board is a pure fold of the givens plus every delta up to the current step, so the walkthrough rewinds and jumps as easily as it plays.
- **Brute force you can watch.** Norvig's propagation rewritten as a FIFO worklist so waves animate coherently; speculative branches live in notes only, because note deltas are invertible and value writes aren't.
- **Locked candidates as bitmasks.** Pointing and claiming collapse into one 3×3 bitmask scan per digit — same code on both axes.
- **WAI-ARIA Grid pattern**, keyboard-complete — roving `tabIndex` across grid, toolbar and pad, a live region for every move, tool shortcuts, Alt-held access keys, and a `?` shortcut dialog. Audited against the APG grid, toolbar, radio and menu patterns; see [accessibility.md](docs/accessibility.md).

## Docs

| | |
| --- | --- |
| [Solver](docs/solver.md) | Pipeline, technique table, locked-candidate bitmasks, brute-force walkthrough |
| [Explain](docs/explain.md) | Scene model, playback fold, animation atoms |
| [Play & Share](docs/play.md) | Tools, feedback, settings, puzzle codec |
| [Accessibility](docs/accessibility.md) | ARIA roles, keyboard map |
| [Testing](docs/testing.md) | Plan, jsdom constraints, technique-evaluation design note |
| [Roadmap](docs/roadmap.md) | Shipped, next, technique backlog |

## Architecture

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

Both grids live at the router root (`RootShell`), so their state survives route changes. Play state is composed by `useControllerOrchestrator`, merging focused hooks (`usePlay` reducer, `useMoves`, `useSelection`, `useTimer`, `useMeta`, `usePulse`, `useSolveAlert`) into one `ControllerContext`. Solve uses a lean `useSolveGridState` (`grid` + `load` + a memoized `solution`, so a puzzle is solved once and playback only replays it). `NewPuzzleButton` / `PuzzleInput` are shared via an `onSubmit` callback.

The Sudoku core (`shared/sudoku/`) is independent of React: codec, peers, units, error rules, types. `PEERS` derives from `UNITS`; `getCandidates` enforces the value-wins invariant.

**Stack** — TanStack Router (file-based, type-safe search params) · Bun · `@heroicons/react` · `vite-plugin-svgr` · path aliases `@assets` `@features` `@pages` `@shared` `@styles`.

## Scripts

```bash
bun dev       # vite dev server
bun run build # tsc -b && vite build
bun lint      # eslint
bun preview   # preview production build
```

> Docs written with AI assistance.
