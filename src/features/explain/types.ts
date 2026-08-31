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
  note?: string
  delta?: Record<number, CellDelta>
}

export type Beat = (cells: Map<number, HTMLElement>) => Animation[]

export type StepEvidence = {
  placed: Set<number>
  struck: Map<number, SudokuNumber[]>
  added: Map<number, SudokuNumber[]>
}
