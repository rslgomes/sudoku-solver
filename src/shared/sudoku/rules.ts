import type { Square } from './types'
import { PEERS } from './peers'

/** Indices of every cell whose value collides with a peer. */
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
