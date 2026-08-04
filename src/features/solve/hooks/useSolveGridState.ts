import {
  parseGrid,
  serializeGrid,
  SUDOKU_NUMBERS,
  type SudokuNumber,
} from '@shared/sudoku'
import { useCallback, useMemo, useState } from 'react'
import type { Solution } from '@features/explain/types'
import { solve } from '../solve'

export default function useSolveGridState() {
  const [grid, setGrid] = useState(() => parseGrid(''))
  const load = useCallback((raw: string) => {
    const withNotes = parseGrid(raw).map((sq) => {
      if (sq.value) return sq
      return { ...sq, notes: new Set<SudokuNumber>(SUDOKU_NUMBERS) }
    })

    setGrid(withNotes)
  }, [])

  const solution = useMemo<Solution>(() => {
    if (!/[1-9]/.test(serializeGrid(grid, 'initial')))
      return { initial: grid, scenes: [] }
    return solve(grid)
  }, [grid])

  return {
    grid,
    load,
    solution,
  }
}
