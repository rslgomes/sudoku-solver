import { createContext, useContext } from 'react'
import type { PlayableGridProps } from './types'

export const PlayableGridCtx = createContext<PlayableGridProps>(null!)

export function usePlayableGrid() {
  return useContext(PlayableGridCtx)
}
