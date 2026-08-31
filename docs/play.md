# Play & Share

## Grid & tools

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

Keyboard interaction is documented in [accessibility.md](accessibility.md).

## Feedback (settings-gated)

- **Peer highlight** — row/column/box of the active cell on hover/focus
- **Same-number highlight** — matching digits ringed green
- **Error cells** — conflicts ringed red, live while typing or once the board is full
- **Wrong-move pulse** — transient animation on rejected input
- **LED timer** — starts on load, auto-pauses on solve; `Solved!` dialog shows final time

## Puzzle input

`New` opens a modal with a separate 9×9 form: digit-only inputs, arrow-key nav, Backspace clears + moves back, Space/0 skips, paste fills from the focused cell stripping non-digits. Submitting loads the puzzle into the grid.

## Settings (`ConfigMenu`)

Held in `ConfigContext`, consumed via `useConfig()`: highlight peers on hover · highlight same number · show remaining count · show lock tool · show timer · auto error highlight · block wrong input · auto clear pencil marks. Theme (light/dark) persists in `localStorage`.

## Share

`Share` copies a `/share?grid=…` link to the clipboard — either the **initial** givens or the **current** state. Opening that link redirects to Play and hydrates the grid (puzzle passed via router history state, so the digits stay out of the visible URL). Boards encode as an 81-char digit string ([src/shared/sudoku/codec.ts](../src/shared/sudoku/codec.ts)).
