import { useEffect, useMemo, useRef, useState } from 'react'

export type Timer = {
  minutes: string
  seconds: string
}

export interface TimerController {
  value: Timer
  startTimer: () => void
  pauseTimer: () => void
  resumeTimer: () => void
  clearTimer: () => void
}

export default function useTimer() {
  const startRef = useRef<number | null>(null)
  const pauseRef = useRef<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const getPaused = () => pauseRef.current !== null
  const getRunning = () => startRef.current !== null

  const [timer, setTimer] = useState(0)
  const parsedTimer = useMemo(() => {
    const seconds = Math.floor(timer / 1000)
    const minutes = Math.floor(seconds / 60)
    const secondsStr = String(seconds % 60).padStart(2, '0')
    const minutesStr = String(minutes).padStart(2, '0')
    return {
      minutes: minutesStr,
      seconds: secondsStr,
    }
  }, [timer])

  const tick = () => {
    setTimer(Date.now() - (startRef.current ?? 0))
  }

  const startInterval = () => {
    if (intervalRef.current !== null) return
    intervalRef.current = window.setInterval(tick, 250)
  }

  const stopInterval = () => {
    if (intervalRef.current === null) return
    window.clearInterval(intervalRef.current)
    intervalRef.current = null
  }

  const startTimer = () => {
    startRef.current = Date.now()
    pauseRef.current = null
    tick()
    startInterval()
  }

  const pauseTimer = () => {
    if (!getRunning() || getPaused()) return
    pauseRef.current = Date.now()
    tick()
    stopInterval()
  }

  const resumeTimer = () => {
    if (!getPaused()) return
    startRef.current =
      (startRef.current ?? 0) + (Date.now() - (pauseRef.current ?? 0))
    pauseRef.current = null
    tick()
    startInterval()
  }

  const clearTimer = () => {
    startRef.current = null
    pauseRef.current = null
    setTimer(0)
    stopInterval()
  }

  useEffect(() => stopInterval, [])

  return {
    value: parsedTimer,
    startTimer,
    pauseTimer,
    resumeTimer,
    clearTimer,
  }
}
