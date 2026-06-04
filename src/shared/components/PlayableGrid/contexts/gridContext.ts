import { createContext, useContext } from 'react'
import type { GridController } from '../types'

export const GridContext = createContext<GridController>(null!)

export function useGrid() {
  return useContext(GridContext)
}
