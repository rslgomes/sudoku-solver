import type { Scene } from '@features/explain/types'
import type { Square, SudokuNumber } from '@shared/sudoku'

export type Placement = {
  index: number
  value: SudokuNumber
}

export type Technique = {
  name: string
  run: (grid: Square[]) => Scene | null
}
