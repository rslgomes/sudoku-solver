# Accessibility

Implements the [WAI-ARIA Grid pattern](https://www.w3.org/WAI/ARIA/apg/patterns/grid/).

- `role="grid/row/gridcell"`, `aria-multiselectable`, `aria-selected`, `aria-readonly` on givens
- Per-cell `aria-label` describes position + content (`"Row 3, column 7, given 5"`)
- Roving `tabIndex` (one focusable cell at a time)
- One `role="status"` live region ([`Announcer`](../src/features/play/widgets/Announcer.tsx)) reports mode changes, placements, rejected moves, erasures, undo and reset. The Solve route has its own ([`StageAnnouncer`](../src/features/explain/StageAnnouncer.tsx)) reporting scene/step entry and playback state; both share [`useAnnouncer`](../src/shared/hooks/useAnnouncer.ts)
- Toolbox is a [`toolbar`](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/) wrapping a mode [`radiogroup`](https://www.w3.org/WAI/ARIA/apg/patterns/radio/); the Pad is a `toolbar`. Both use roving `tabIndex` ([`useRovingTabIndex`](../src/shared/hooks/useRovingTabIndex.ts)), so each composite is one tab stop
- Options menu follows the [Menu pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menu/) — `role="menu"` panel, `menuitemcheckbox` items, `aria-haspopup`/`aria-expanded` on the trigger
- Puzzle-input form mirrors the grid roles with native `<input>` semantics, per-cell `aria-label`, `aria-row/colindex`, and instructions bound via `aria-describedby`
- `<main>` landmark + skip-to-content link (`.sr-only`, visible on focus)

## Keyboard

### Grid

| Key                  | Action                     |
| -------------------- | -------------------------- |
| Arrow keys           | Move focus one cell        |
| Home / End           | First / last cell in row   |
| Ctrl+Home / Ctrl+End | First / last cell in grid  |
| 1–9                  | Write digit (Pen/Pencil)   |
| Space                | Toggle-select focused cell |
| Escape               | Clear selection            |
| Delete / Backspace   | Erase selected cells       |
| Enter                | Apply the active tool      |
| Shift + arrows       | Move and extend the selection |
| Shift + Space        | Select the row             |
| Ctrl + Space         | Select the column          |
| Ctrl+A               | Select every square        |
| PageUp / PageDown    | Jump one box up or down    |

In paint mode `1`–`6` pick a color instead of writing a digit. `Enter` is the
keyboard equivalent of clicking with the active tool — without it, eraser, lock
and paint would be mouse-only.

### Tools (Play route)

| Key      | Action                    |
| -------- | ------------------------- |
| P        | Pen                       |
| N        | Pencil                    |
| E        | Eraser                    |
| C        | Color                     |
| L        | Lock (when tool is shown) |
| Ctrl+Z   | Undo                      |
| Alt+R    | Reset (confirmation)      |

Bare letters are suppressed while a text field has focus or a dialog is open
([`useShortcuts`](../src/shared/hooks/useShortcuts.ts)). Each control carries
`aria-keyshortcuts` and a matching `title`.

### Walkthrough (Solve route)

| Key            | Action                     |
| -------------- | -------------------------- |
| ←  / →         | Previous / next step       |
| Shift+← / Shift+→ | Previous / next scene   |
| Space          | Play / pause                |
| Home / End     | First / last step overall  |

Active while [`WalkthroughControls`](../src/features/explain/WalkthroughControls.tsx)
is mounted. Any of these — or the seek slider, or a cue click — pauses
autoplay first, so the walkthrough never advances out from under a step the
user just navigated to.

### Menus

Holding **Alt** underlines the access key of every menu label — hidden at rest,
the way a Windows menu bar behaves ([`useAltHints`](../src/shared/hooks/useAltHints.ts)
sets `data-alt-hints`, [`AccessKey`](../src/shared/ui/AccessKey.tsx) marks the letter).

| Key                | Action                                    |
| ------------------ | ----------------------------------------- |
| Alt+O              | Open / close the Options menu             |
| ?                  | Open the keyboard shortcuts dialog        |
| Arrow Up / Down    | Move between items, wrapping              |
| Home / End         | First / last item                         |
| Escape             | Close, returning focus to the trigger     |
| Tab                | Close and continue through the page       |

This table is the spec the behavioral test suite is written against — see [testing.md](testing.md).

## Gaps against the APG

None outstanding. The audit that produced this section is recorded in
[roadmap.md](roadmap.md#accessibility-next-focus); every item shipped. Two
findings were deliberately closed as non-issues:

- **`aria-rowindex`/`aria-colindex` on grid cells.** Required only when a grid is
  virtualized or partially rendered. All 81 cells are in the DOM, and each cell's
  `aria-label` already states its position.
- **`aria-activedescendant`.** The APG accepts either focus-management strategy;
  roving `tabIndex` is implemented and works.

Two constraints worth remembering before changing this code:

- **A ring on a `gridcell` is invisible.** `CellContent` paints opaque
  `absolute inset-0` layers inside every cell, and they cover any inset
  box-shadow on the cell box. The cursor ring is a sibling overlay drawn last;
  anything similar must be too.
- **In eraser and lock mode a click applies the tool** rather than selecting
  (`useControllerOrchestrator.onSelect`), so click-then-`Enter` applies twice.
  Only eraser hides this, by being idempotent.
