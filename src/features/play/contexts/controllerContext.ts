import { createContext, useContext } from 'react'
import type { PlayController } from '../types'

export const ControllerContext = createContext<PlayController>(null!)

export function useController() {
  return useContext(ControllerContext)
}
