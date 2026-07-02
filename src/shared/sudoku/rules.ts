import type { Square, SudokuNumber } from './types'
import { PEERS } from './peers'

export const getErrors = (grid: Square[]): Set<number> => {
  const e: Set<number> = new Set()

  grid.forEach((square, idx) => {
    if (square.value === null || e.has(idx)) return
    const peers = PEERS[idx]
    for (const current of peers) {
      if (grid[current].value === square.value) {
        e.add(idx)
        e.add(current)
      }
    }
  })

  return e
}

const NONE: ReadonlySet<SudokuNumber> = new Set()
export function getCandidates(sq: Square): ReadonlySet<SudokuNumber> {
  return sq.value ? NONE : sq.notes
}
