# Sudoku Solver

An interactive and accessible Sudoku puzzle tool built with **React**, **TypeScript**, **Tailwind CSS v4**, and **Vite** — designed for solving, training, and experimenting with Sudoku logic.

## Features

### Core Components

- **9×9 Sudoku Grid**
  - Renders a responsive square grid with correct 3x3 subgrid borders.
  - Supports both **pen marks** (final numbers) and **pencil marks** (candidate notes).
  - Grid is styled using Tailwind CSS with custom themes (including OKLCH color tokens).

- **`Square` Component**
  - Displays a large number (pen mark) or a small grid of pencil marks.
  - ARIA attributes for accessibility: `role="gridcell"` and `aria-label` per cell.
  - Customizable borders depending on position (for visual clarity of subgrids).

- **`Grid` Component**
  - Renders the main puzzle using context-fed state.
  - No prop-drilling: uses `GridContext` to access cell data directly.
  - Responsive and semantic grid layout using `role="grid"` and `role="row"`.

### Grid Input Mode

- **9×9 Inline Input Grid**
  - Accepts only numbers `1–9`, or whitespace (`0`, `space`, `-`) for empty cells.
  - Tab, arrow key, and Enter support for keyboard navigation.
  - Backspace deletes current input and moves backward.
  - `Ctrl + V` / paste support to allow quick puzzle input (coming soon).
  - ARIA-enhanced with `aria-rowindex`, `aria-colindex`, and `aria-label` (`A1`, `B5`, etc).

- **Form Controls**
  - **Submit** button to parse and store grid input as context.
  - **Clear** button to reset all inputs to empty.

### Theming

- **Dark / Light / System Theme Toggle**
  - Toggle cycles through light, dark, and system modes.
  - Uses `ThemeContext` with `ThemeProvider` to avoid FOIT (flash of incorrect theme).
  - Toggle is accessible with `aria-label` and visual icons via `@heroicons/react`.

### Accessibility

- Uses [WAI-ARIA Grid Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/grid/)
  - `role="grid"`, `role="row"`, `role="gridcell"`
  - Proper `aria-rowindex`, `aria-colindex`, and descriptive labels for screen readers.
- Input automatically selects content on focus for easier overwrite.
- Navigation keys follow common screen reader and user expectations.

### Architecture & State

- **`GridContext`** for centralized board state
  - Accessible via `useGrid` hook.
  - Stores `gridData: CellData[]`, where each `CellData` holds optional `penMark` and `pencilMarks`.

- **Flexible Layout**
  - `MainLayout` handles grid layout with support for future side panels (e.g., trainer vs solver).
  - Grid is rendered inside `MainPage`, wrapped by `GridProvider` to scope context per route.

---

## Tech Stack

- React 18 + TypeScript
- Vite (with `@tailwindcss/vite` plugin)
- Tailwind CSS v4 (with theme tokens defined using `@theme`)
- Heroicons for icons
- Context API for shared state

---

## Structure Overview

```txt
.
├── assets/                      # Static assets like SVGs and JSON examples
│
├── components/                  # Reusable UI and functional components
│   ├── General/
│   ├── Grid/                    # Main Grid renderer
│   ├── GridInput/               # 9×9 interactive input grid
│   └── ui/
│
├── contexts/                   # React Context API providers
│   ├── GridContext.tsx          # Sudoku board state management
│   └── ThemeContext.tsx         # Light/dark/system theme provider
│
├── layouts/
│   └── MainLayout.tsx           # Top-level layout wrapper with slots
│
├── libs/                       # Utilities, helpers, and types
├── main.tsx                    # App entrypoint
├── pages/
│   └── index.tsx                # MainPage with Grid + Input
│
└── styles/
```
