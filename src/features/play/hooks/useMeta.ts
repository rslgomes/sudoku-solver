import { useMemo } from 'react'
import { SUDOKU_NUMBERS, type Meta, type Square } from '../types'
import { PEERS } from '@shared/sudoku/peers'
import { getErrors } from '@shared/sudoku/rules'

export default function useMeta(grid: Square[]): Meta {
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
