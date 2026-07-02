import { useSolveGrid } from '@features/solve/contexts/solveGridContext'
import { serializeGrid } from '@shared/sudoku'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Scene, SceneStep, Solution } from '../types'
import { applySteps, solve } from '@features/solve/solve'

const EMPTY_SCENE: Scene = { title: '', explanation: '', steps: [] }
const EMPTY_STEP: SceneStep = { beats: [] }

export default function useStage() {
  const { grid } = useSolveGrid()
  const key = useMemo(() => serializeGrid(grid, 'initial'), [grid])

  const solution = useMemo<Solution>(() => {
    if (!/[1-9]/.test(key)) return { initial: grid, scenes: [] }
    return solve(grid)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const [scene, setScene] = useState(0)
  const [step, setStep] = useState(0)
  const [mode, setMode] = useState<'play' | 'snap'>('snap')
  const [token, setToken] = useState(0)

  const roll = useCallback((m: 'play' | 'snap' = 'play') => {
    setMode(m)
    setToken((prev) => prev + 1)
  }, [])

  useEffect(() => {
    setScene(0)
    setStep(0)
    setMode('snap')
  }, [key])

  const currentScene = useMemo(
    () => solution.scenes[scene] ?? EMPTY_SCENE,
    [solution, scene]
  )
  const currentStep = useMemo(
    () => currentScene.steps[step] ?? EMPTY_STEP,
    [currentScene, step]
  )

  const board = useMemo(() => {
    const priorSteps = solution.scenes.slice(0, scene).flatMap((s) => s.steps)
    const currentSteps = currentScene.steps.slice(0, step + 1)
    return applySteps(solution.initial, [...priorSteps, ...currentSteps])
  }, [solution, currentScene, scene, step])

  const cells = useRef(new Map<number, HTMLElement>())
  const registerCell = useCallback((i: number, el: HTMLElement | null) => {
    if (!el) return
    cells.current.set(i, el)
    return () => {
      cells.current.delete(i)
    }
  }, [])

  useEffect(() => {
    if (mode === 'snap' || currentStep.beats.length === 0) return
    const anims = currentStep.beats.flatMap((beat) => beat(cells.current))
    return () => anims.forEach((a) => a.cancel())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const previousScene = useCallback(() => {
    if (scene > 0) setScene((prev) => prev - 1)
    setStep(0)
    roll()
  }, [scene, roll])
  const nextScene = useCallback(() => {
    if (scene >= solution.scenes.length - 1) return
    setScene((prev) => prev + 1)
    setStep(0)
    roll()
  }, [solution, scene, roll])

  const previousStep = useCallback(() => {
    if (step > 0) {
      setStep((prev) => prev - 1)
      roll()
    } else previousScene()
  }, [step, previousScene, roll])
  const nextStep = useCallback(() => {
    if (step < currentScene.steps.length - 1) {
      setStep((prev) => prev + 1)
      roll()
    } else nextScene()
  }, [currentScene, nextScene, step, roll])

  const goToCue = useCallback(
    (cueId: string) => {
      const idx = currentScene.steps.findIndex((s) => s.cue === cueId)
      if (idx < 0) return
      setStep(idx)
      roll()
    },
    [currentScene, roll]
  )

  return {
    board,
    registerCell,
    currentScene,
    currentStep,
    goToCue,
    position: {
      scene,
      step,
      sceneCount: solution.scenes.length,
      stepCount: currentScene.steps.length,
    },
    navigation: {
      previousScene,
      nextScene,
      previousStep,
      nextStep,
    },
  }
}
