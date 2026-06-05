import type { TimerController } from './hooks/useTimer'
import type { SolveAlertController } from './hooks/useSolveAlert'
import type { SudokuNumber, Square } from '@shared/sudoku/types'

export type { SudokuNumber, Square } from '@shared/sudoku/types'
export { SUDOKU_NUMBERS } from '@shared/sudoku/types'

export type Move =
  | { mode: 'pen'; targets: Set<number>; data: SudokuNumber }
  | { mode: 'pencil'; targets: Set<number>; data: Set<SudokuNumber> }
  | { mode: 'eraser'; targets: Set<number>; data?: null }
  | { mode: 'lock'; targets: Set<number>; data: boolean | null }
  | { mode: 'paint'; targets: Set<number>; data: string | null }

export type MoveMode = Move['mode']

export type PulseKind = 'wrong'

export interface Meta {
  isFilled: boolean
  isSolved: boolean
  errors: Set<number>
  peers: Set<number>[]
  missingCount: Map<SudokuNumber, number>
}

export const MODE_LABEL: Record<MoveMode, { title: string; hint: string }> = {
  pen: { title: 'Pen', hint: 'Fill a square with a number' },
  pencil: { title: 'Pencil', hint: 'Mark candidate numbers in a square' },
  eraser: { title: 'Eraser', hint: 'Click a square to erase it' },
  paint: { title: 'Paint', hint: 'Color the background of selected squares' },
  lock: { title: 'Lock', hint: 'Click a square to lock or unlock it' },
}

export interface PlayController {
  grid: Square[]
  meta: Meta
  solveAlert: SolveAlertController
  activeMode: MoveMode
  selectedNumber: SudokuNumber | null
  selectedColor: string | null | undefined
  selected: Set<number>
  canUndo: boolean
  onModeChange: (mode: MoveMode) => void
  onSelect: (square: number, toggle: boolean) => void
  clearSelection: () => void
  registerInteractive: (el: HTMLElement | null) => (() => void) | undefined
  onNumber: (n: SudokuNumber, customSelection?: Set<number>) => void
  onColor: (color: string | null) => void
  onAction: () => void
  onDelete: (customSelection?: Set<number>) => void
  onUndo: () => void
  onReset: () => void
  fillGrid: (squares: Square[]) => void
  pulsingSquares: Map<number, PulseKind>
  clearPulsing: () => void
  timer: TimerController
}
