import { createContext, useContext } from 'react'
import type useStage from '../hooks/useStage'

export type Stage = ReturnType<typeof useStage>

export const StageContext = createContext<Stage>(null!)

export const useStageContext = () => useContext(StageContext)
