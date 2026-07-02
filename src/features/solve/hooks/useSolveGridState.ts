import { parseGrid, SUDOKU_NUMBERS, type SudokuNumber } from '@shared/sudoku'
import { useCallback, useState } from 'react'

export default function useSolveGridState() {
  const [grid, setGrid] = useState(() => parseGrid(''))
  const load = useCallback((raw: string) => {
    const withNotes = parseGrid(raw).map((sq) => {
      if (sq.value) return sq
      return { ...sq, notes: new Set<SudokuNumber>(SUDOKU_NUMBERS) }
    })

    setGrid(withNotes)
  }, [])

  return {
    grid,
    load,
  }
}
