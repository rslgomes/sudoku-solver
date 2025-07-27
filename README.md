# Sudoku Solver

An interactive and accessible Sudoku puzzle tool built with **React**, **TypeScript**, **Tailwind CSS v4**, and **Vite**. Designed for solving, training, and experimenting with Sudoku logic.

## Features

- **9×9 Sudoku Grid**  
  Rendered with proper subgrid borders, supports pen and pencil marks.

- **Keyboard Navigation**  
  Full arrow key, Tab, Home/End, and PageUp/PageDown support following [WAI-ARIA Grid guidelines](https://www.w3.org/WAI/ARIA/apg/patterns/grid/).

- **Accessible Design**  
  Uses semantic roles and ARIA attributes for screen reader support.

- **Input Mode**  
  Inline 9×9 form for entering puzzles, with form controls for submit and clear.

- **Theming**  
  Light/Dark/System theme toggle with accessible controls and no FOIT.

- **Centralized State**  
  Grid state managed via React Context to simplify component structure.

## Tech Stack

- React 18 + TypeScript
- Tailwind CSS v4 with `@theme` tokens
- Vite + `@tailwindcss/vite`
- Heroicons for UI
- Context API for shared state

## Project Structure

```txt
.
├── assets/         # Static files (SVG, JSON)
├── components/     # UI components (Grid, Input, Buttons)
├── contexts/       # Grid and Theme context providers
├── layouts/        # Layout wrappers
├── libs/           # Helpers and types
├── pages/          # Main app pages
├── styles/         # Tailwind + custom theme styles
└── main.tsx        # Entry point
```
