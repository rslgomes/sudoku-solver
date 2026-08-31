import { useSolveGrid } from '@features/solve/contexts/solveGridContext'
import { serializeGrid } from '@shared/sudoku'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Scene, SceneStep, StepEvidence } from '../types'
import { applySteps } from '@features/solve/solve'
import useReducedMotion from '@shared/hooks/useReducedMotion'

const EMPTY_SCENE: Scene = { title: '', explanation: '', steps: [] }
const EMPTY_STEP: SceneStep = { beats: [] }

export const SPEEDS = [0.5, 1, 2, 4]

const DWELL_MS = 450
const READ_MS_PER_CHAR = 22
const MAX_READ_MS = 2500

export default function useStage() {
  const { grid, solution } = useSolveGrid()
  const key = useMemo(() => serializeGrid(grid, 'initial'), [grid])
  const reducedMotion = useReducedMotion()

  const [scene, setScene] = useState(0)
  const [step, setStep] = useState(0)
  const [mode, setMode] = useState<'play' | 'snap'>('snap')
  const [settled, setSettled] = useState(true)
  const [token, setToken] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [pauseAtSceneEnd, setPauseAtSceneEnd] = useState(true)

  const roll = useCallback(
    (m: 'play' | 'snap' = 'play') => {
      const next = reducedMotion ? 'snap' : m
      setMode(next)
      setSettled(next === 'snap')
      setToken((prev) => prev + 1)
    },
    [reducedMotion]
  )

  useEffect(() => {
    setScene(0)
    setStep(0)
    setMode('snap')
    setSettled(true)
    setPlaying(false)
  }, [key])

  const currentScene = useMemo(
    () => solution.scenes[scene] ?? EMPTY_SCENE,
    [solution, scene]
  )
  const currentStep = useMemo(
    () => currentScene.steps[step] ?? EMPTY_STEP,
    [currentScene, step]
  )

  const sceneEntryBoards = useMemo(() => {
    const boards = [solution.initial]
    for (const s of solution.scenes)
      boards.push(applySteps(boards[boards.length - 1], s.steps))
    return boards
  }, [solution])

  const stepBoards = useMemo(() => {
    const boards = [sceneEntryBoards[scene] ?? solution.initial]
    for (const s of currentScene.steps)
      boards.push(applySteps(boards[boards.length - 1], [s]))
    return boards
  }, [sceneEntryBoards, solution.initial, currentScene, scene])

  const board =
    stepBoards[settled ? step + 1 : step] ?? stepBoards[stepBoards.length - 1]

  const evidence = useMemo<StepEvidence>(() => {
    const marks: StepEvidence = {
      placed: new Set(),
      struck: new Map(),
      added: new Map(),
    }
    if (!settled) return marks

    for (const [key, delta] of Object.entries(currentStep.delta ?? {})) {
      const i = Number(key)
      if (delta.setValue) marks.placed.add(i)
      if (delta.removeNotes?.length) marks.struck.set(i, delta.removeNotes)
      if (delta.addNotes?.length) marks.added.set(i, delta.addNotes)
    }
    return marks
  }, [currentStep, settled])

  const cells = useRef(new Map<number, HTMLElement>())
  const registerCell = useCallback((i: number, el: HTMLElement | null) => {
    if (!el) return
    cells.current.set(i, el)
    return () => {
      cells.current.delete(i)
    }
  }, [])

  const running = useRef<Animation[]>([])
  const speedRef = useRef(speed)
  speedRef.current = speed

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
    anims.forEach((a) => a.updatePlaybackRate(speedRef.current))
    running.current = anims
    let current = true
    Promise.allSettled(anims.map((a) => a.finished)).then(() => {
      if (current) setSettled(true)
    })
    return () => {
      current = false
      running.current = []
      anims.forEach((a) => a.cancel())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  useEffect(() => {
    running.current.forEach((a) => a.updatePlaybackRate(speed))
  }, [speed])

  const sceneBackward = useCallback(() => {
    if (scene > 0) setScene((prev) => prev - 1)
    setStep(0)
    roll()
  }, [scene, roll])
  const sceneForward = useCallback(() => {
    if (scene >= solution.scenes.length - 1) return
    setScene((prev) => prev + 1)
    setStep(0)
    roll()
  }, [solution, scene, roll])

  const stepBackward = useCallback(() => {
    if (step > 0) {
      setStep((prev) => prev - 1)
      roll()
    } else sceneBackward()
  }, [step, sceneBackward, roll])
  const stepForward = useCallback(() => {
    if (step < currentScene.steps.length - 1) {
      setStep((prev) => prev + 1)
      roll()
    } else sceneForward()
  }, [currentScene, sceneForward, step, roll])

  const timeline = useMemo(() => {
    const sceneStarts: number[] = []
    let total = 0
    for (const s of solution.scenes) {
      sceneStarts.push(total)
      total += s.steps.length
    }
    return { sceneStarts, total }
  }, [solution])

  const index = (timeline.sceneStarts[scene] ?? 0) + step

  const outline = useMemo(
    () =>
      solution.scenes.map((s) => ({
        title: s.title,
        stepCount: s.steps.length,
      })),
    [solution]
  )

  const jumpTo = useCallback(
    (target: number) => {
      const { sceneStarts, total } = timeline
      if (total === 0) return
      const clamped = Math.min(Math.max(target, 0), total - 1)
      let found = 0
      for (let i = 0; i < sceneStarts.length; i++) {
        if (sceneStarts[i] > clamped) break
        found = i
      }
      setScene(found)
      setStep(clamped - sceneStarts[found])
      roll('snap')
    },
    [timeline, roll]
  )

  const jumpToScene = useCallback(
    (target: number) => jumpTo(timeline.sceneStarts[target] ?? 0),
    [jumpTo, timeline]
  )

  const jumpToCue = useCallback(
    (cueId: string) => {
      const idx = currentScene.steps.findIndex((s) => s.cue === cueId)
      if (idx < 0) return
      setStep(idx)
      roll()
    },
    [currentScene, roll]
  )

  const atLastStep = index >= timeline.total - 1
  const atSceneEnd = step >= currentScene.steps.length - 1
  const crossSceneEnd = useRef(false)

  const play = useCallback(() => {
    if (timeline.total === 0) return
    if (atLastStep) jumpTo(0)
    crossSceneEnd.current = true
    setPlaying(true)
  }, [timeline, atLastStep, jumpTo])

  const pause = useCallback(() => setPlaying(false), [])

  const dwell = useMemo(() => {
    const read = Math.min(
      (currentStep.note?.length ?? 0) * READ_MS_PER_CHAR,
      MAX_READ_MS
    )
    return (DWELL_MS + read) / speed
  }, [currentStep, speed])

  useEffect(() => {
    if (!playing || !settled) return
    if (atLastStep) {
      setPlaying(false)
      return
    }
    if (atSceneEnd && pauseAtSceneEnd && !crossSceneEnd.current) {
      setPlaying(false)
      return
    }
    const timer = setTimeout(() => {
      crossSceneEnd.current = false
      stepForward()
    }, dwell)
    return () => clearTimeout(timer)
  }, [
    playing,
    settled,
    atLastStep,
    atSceneEnd,
    pauseAtSceneEnd,
    dwell,
    stepForward,
  ])

  const paused = useCallback(
    <T extends unknown[]>(fn: (...args: T) => void) =>
      (...args: T) => {
        setPlaying(false)
        fn(...args)
      },
    []
  )

  return {
    board,
    registerCell,
    currentScene,
    currentStep,
    evidence,
    goToCue: paused(jumpToCue),
    outline,
    position: {
      scene,
      step,
      index,
      total: timeline.total,
      sceneCount: solution.scenes.length,
      stepCount: currentScene.steps.length,
    },
    navigation: {
      seek: paused(jumpTo),
      goToScene: paused(jumpToScene),
      previousScene: paused(sceneBackward),
      nextScene: paused(sceneForward),
      previousStep: paused(stepBackward),
      nextStep: paused(stepForward),
    },
    playback: {
      playing,
      play,
      pause,
      speed,
      setSpeed,
      pauseAtSceneEnd,
      setPauseAtSceneEnd,
      reducedMotion,
    },
  }
}
