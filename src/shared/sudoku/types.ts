export type SudokuNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

export const SUDOKU_NUMBERS: SudokuNumber[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]

export interface Square {
  value: SudokuNumber | null
  notes: Set<SudokuNumber>
  color: string | null
  locked: boolean
}
