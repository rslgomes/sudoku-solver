import {
  parseGrid,
  serializeGrid,
  SUDOKU_NUMBERS,
  type SudokuNumber,
} from '@shared/sudoku'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from '@tanstack/react-router'
import * as Comlink from 'comlink'
import type { Solution } from '@features/explain/types'
import type { SolveWorkerApi } from '../solve.worker'

const SOLVE_PATH = '/solver'

function createSolveApi() {
  const worker = new Worker(new URL('../solve.worker', import.meta.url), {
    type: 'module',
  })
  return Comlink.wrap<SolveWorkerApi>(worker)
}

export default function useSolveGridState() {
  const [grid, setGrid] = useState(() => parseGrid(''))
  const [solution, setSolution] = useState<Solution>(() => ({
    initial: grid,
    scenes: [],
  }))
  const [solving, setSolving] = useState(false)
  const [resultReady, setResultReady] = useState(false)
  const api = useRef<ReturnType<typeof createSolveApi>>(null)
  if (!api.current) api.current = createSolveApi()

  const pathname = useLocation({ select: (l) => l.pathname })
  const wasSolving = useRef(false)

  useEffect(() => {
    if (pathname === SOLVE_PATH) setResultReady(false)
  }, [pathname])

  useEffect(() => {
    if (wasSolving.current && !solving && pathname !== SOLVE_PATH)
      setResultReady(true)
    wasSolving.current = solving
  }, [solving, pathname])

  const load = useCallback((raw: string) => {
    const withNotes = parseGrid(raw).map((sq) => {
      if (sq.value) return sq
      return { ...sq, notes: new Set<SudokuNumber>(SUDOKU_NUMBERS) }
    })

    setGrid(withNotes)
  }, [])

  useEffect(() => {
    if (!/[1-9]/.test(serializeGrid(grid, 'initial'))) {
      setSolution({ initial: grid, scenes: [] })
      setSolving(false)
      return
    }

    let current = true
    setSolving(true)
    api.current!.solve(grid).then((result) => {
      if (current) {
        setSolution(result)
        setSolving(false)
      }
    })
    return () => {
      current = false
    }
  }, [grid])

  return {
    grid,
    load,
    solution,
    solving,
    resultReady,
  }
}
