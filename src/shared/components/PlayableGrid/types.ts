export type SudokuNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

export const SUDOKU_NUMBERS: SudokuNumber[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]

export interface Square {
  value: SudokuNumber | null
  notes: Set<SudokuNumber>
  color: string | null
  locked: boolean
}

export type Move =
  | { mode: 'pen'; targets: Set<number>; data: SudokuNumber }
  | { mode: 'pencil'; targets: Set<number>; data: Set<SudokuNumber> }
  | { mode: 'eraser'; targets: Set<number>; data?: null }
  | { mode: 'lock'; targets: Set<number>; data: boolean | null }
  | { mode: 'paint'; targets: Set<number>; data: string | null }

export type MoveMode = Move['mode']

export const MODE_LABEL: Record<MoveMode, { title: string; hint: string }> = {
  pen: { title: 'Pen', hint: 'Fill a square with a number' },
  pencil: { title: 'Pencil', hint: 'Mark candidate numbers in a square' },
  eraser: { title: 'Eraser', hint: 'Clear content from selected squares' },
  paint: { title: 'Paint', hint: 'Color the background of selected squares' },
  lock: { title: 'Lock', hint: 'Fix or unfix squares as givens' },
}

export interface PlayableGridProps {
  grid: Square[]
  activeMode: MoveMode
  selectedNumber: SudokuNumber | null
  selected: Set<number>
  canUndo: boolean
  onModeChange: (mode: MoveMode) => void
  onSelect: (square: number, toggle: boolean) => void
  clearSelection: () => void
  onNumber: (n: SudokuNumber, customSelection?: Set<number>) => void
  onColor: (color: string | null) => void
  onAction: () => void
  onDelete: (customSelection?: Set<number>) => void
  onUndo: () => void
  fillGrid: (squares: Square[]) => void
}
