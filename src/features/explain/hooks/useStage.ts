import { useSolveGrid } from '@features/solve/contexts/solveGridContext'
import { serializeGrid } from '@shared/sudoku'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Scene, SceneStep } from '../types'
import { applySteps } from '@features/solve/solve'

const EMPTY_SCENE: Scene = { title: '', explanation: '', steps: [] }
const EMPTY_STEP: SceneStep = { beats: [] }

export default function useStage() {
  const { grid, solution } = useSolveGrid()
  const key = useMemo(() => serializeGrid(grid, 'initial'), [grid])

  const [scene, setScene] = useState(0)
  const [step, setStep] = useState(0)
  const [mode, setMode] = useState<'play' | 'snap'>('snap')
  const [settled, setSettled] = useState(true)
  const [token, setToken] = useState(0)

  const roll = useCallback((m: 'play' | 'snap' = 'play') => {
    setMode(m)
    setSettled(m === 'snap')
    setToken((prev) => prev + 1)
  }, [])

  useEffect(() => {
    setScene(0)
    setStep(0)
    setMode('snap')
    setSettled(true)
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
    const currentSteps = currentScene.steps.slice(0, settled ? step + 1 : step)
    return applySteps(solution.initial, [...priorSteps, ...currentSteps])
  }, [solution, currentScene, scene, step, settled])

  const cells = useRef(new Map<number, HTMLElement>())
  const registerCell = useCallback((i: number, el: HTMLElement | null) => {
    if (!el) return
    cells.current.set(i, el)
    return () => {
      cells.current.delete(i)
    }
  }, [])

  useEffect(() => {
    if (mode === 'snap' || currentStep.beats.length === 0) {
      setSettled(true)
      return
    }
    const anims = currentStep.beats.flatMap((beat) => beat(cells.current))
    if (anims.length === 0) {
      setSettled(true)
      return
    }
    let current = true
    Promise.allSettled(anims.map((a) => a.finished)).then(() => {
      if (current) setSettled(true)
    })
    return () => {
      current = false
      anims.forEach((a) => a.cancel())
    }
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
