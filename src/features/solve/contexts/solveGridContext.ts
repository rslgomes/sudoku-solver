import { createContext, useContext } from 'react'
import type useSolveGridState from '../hooks/useSolveGridState'

export type SolveGrid = ReturnType<typeof useSolveGridState>

export const SolveGridContext = createContext<SolveGrid>(null!)

export function useSolveGrid() {
  return useContext(SolveGridContext)
}
