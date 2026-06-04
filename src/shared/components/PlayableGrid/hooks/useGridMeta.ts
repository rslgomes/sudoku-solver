import { useMemo } from 'react'
import { SUDOKU_NUMBERS, type Square } from '../types'

const getPeers = (sqIdx: number): Set<number> => {
  const row = Math.floor(sqIdx / 9)
  const col = sqIdx % 9
  const boxStart = Math.floor(row / 3) * 3 * 9 + Math.floor(col / 3) * 3

  const s = new Set<number>()
  for (let i = 0; i < 9; i++) {
    s.add(row * 9 + i)
    s.add(i * 9 + col)
    s.add(boxStart + (i % 3) + 9 * Math.floor(i / 3))
  }

  s.delete(sqIdx)
  return s
}

export const PEERS = Array.from({ length: 81 }, (_, i) => getPeers(i))

const getErrors = (grid: Square[]): Set<number> => {
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

export default function useGridMeta(grid: Square[]) {
  const isFilled = useMemo(() => {
    return grid.every((square) => square.value !== null)
  }, [grid])

  const errors = useMemo(() => getErrors(grid), [grid])

  const isSolved = useMemo(() => {
    return isFilled && errors.size === 0
  }, [isFilled, errors])

  const missingCount = useMemo(() => {
    return grid.reduce(
      (acc, square) => {
        if (square.value == null) return acc
        const old = acc.get(square.value) ?? 9
        acc.set(square.value, old - 1)
        return acc
      },
      new Map(SUDOKU_NUMBERS.map((n) => [n, 9]))
    )
  }, [grid])

  return { isFilled, isSolved, errors, peers: PEERS, missingCount }
}
