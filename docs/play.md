# Play & Share

## Grid & tools

9×9 grid with 3×3 box borders. Select cells with click, Shift/Ctrl/Meta+click, or Space.

| Tool   | Action                                                       |
| ------ | ------------------------------------------------------------ |
| Pen    | Write a digit; press the same digit again to clear           |
| Pencil | Toggle candidate notes (3×3 mini-grid per cell)              |
| Eraser | Click a cell to clear its value and notes                    |
| Paint  | Apply a background color (5 named colors + clear, `1`–`6`)   |
| Lock   | Toggle a cell between editable and given (hidden by default) |

- **Undo** up to 100 steps (`usePlay` reducer history)
- **Reset** to the initial puzzle (confirmation dialog)

Every tool has a single-letter shortcut, shown in the button's corner and in its
tooltip, and `Enter` applies the active tool to the selection from the grid. Full
keyboard interaction is documented in [accessibility.md](accessibility.md), and
`?` opens the same list in the app.

The Pad reserves a fixed body height across all five modes (`min-h-29`, the
natural height of the 3×3 number grid), so switching tools never shifts the board
above it.

## Feedback (settings-gated)

- **Peer highlight** — row/column/box of the active cell on hover/focus
- **Same-number highlight** — matching digits ringed green
- **Error cells** — conflicts ringed red, live while typing or once the board is full
- **Wrong-move pulse** — transient animation on rejected input
- **LED timer** — starts on load, auto-pauses on solve; `Solved!` dialog shows final time

## Puzzle input

`New` opens a modal with a separate 9×9 form: digit-only inputs, arrow-key nav, Backspace clears + moves back, Space/0 skips, paste fills from the focused cell stripping non-digits. Submitting loads the puzzle into the grid.

Opening it focuses the first square rather than the dialog's close button, and
the rules above are stated in the dialog itself, wired to the grid with
`aria-describedby`.

## Settings

Split by how often they change, because a toggle that alters what the board
*shows* is unusable three feet from the board it affects.

**Assists** ([`AssistBar`](../src/features/play/widgets/AssistBar.tsx)) sit in the
Pad header, directly under the grid: peers · matches · remaining. Flip one and
the effect is an inch above.

**Options** (`ConfigMenu`, Alt+O) holds the set-once items: show lock tool · show
timer · auto error highlight · block wrong input · auto clear pencil marks.

All of them live in `ConfigContext` via `useConfig()`, and each persists to
`localStorage` under a `play:` key
([`usePersistentState`](../src/shared/hooks/usePersistentState.ts)). Theme
(light/dark) persists the same way.

## Share

`Share` copies a `/share?grid=…` link to the clipboard — either the **initial** givens or the **current** state. Opening that link redirects to Play and hydrates the grid (puzzle passed via router history state, so the digits stay out of the visible URL). Boards encode as an 81-char digit string ([src/shared/sudoku/codec.ts](../src/shared/sudoku/codec.ts)).
