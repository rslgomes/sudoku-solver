import type { Square, SudokuNumber } from '@shared/sudoku'

export type CellDelta = {
  setValue?: SudokuNumber
  addNotes?: SudokuNumber[]
  removeNotes?: SudokuNumber[]
}

export type Solution = {
  initial: Square[]
  scenes: Scene[]
}

export type Scene = {
  title: string
  explanation: string
  steps: SceneStep[]
}

export type SceneStep = {
  beats: Beat[]
  cue?: string
  delta?: Record<number, CellDelta>
}

export type Beat = (cells: Map<number, HTMLElement>) => Animation[]
