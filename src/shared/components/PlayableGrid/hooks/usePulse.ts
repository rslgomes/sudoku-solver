import { useCallback, useEffect, useRef, useState } from 'react'
import type { PulseKind } from '../types'

const PULSE_MS = 500

/** Transient per-square flash (e.g. rejected move), auto-clearing after PULSE_MS. */
export function usePulse() {
  const [pulsingSquares, setPulsingSquares] = useState(
    new Map<number, PulseKind>()
  )
  const pulseTimers = useRef(new Map<number, ReturnType<typeof setTimeout>>())

  const pulse = useCallback((indices: Iterable<number>, kind: PulseKind) => {
    setPulsingSquares((prev) => {
      const next = new Map(prev)
      for (const i of indices) next.set(i, kind)
      return next
    })
    for (const i of indices) {
      clearTimeout(pulseTimers.current.get(i)) // restart timer if re-pulsed
      pulseTimers.current.set(
        i,
        setTimeout(() => {
          setPulsingSquares((prev) => {
            const next = new Map(prev)
            next.delete(i)
            return next
          })
          pulseTimers.current.delete(i)
        }, PULSE_MS)
      )
    }
  }, [])

  const clearPulsing = useCallback(() => {
    for (const t of pulseTimers.current.values()) clearTimeout(t)
    pulseTimers.current.clear()
    setPulsingSquares(new Map())
  }, [])

  useEffect(() => {
    const timers = pulseTimers.current
    return () => {
      for (const t of timers.values()) clearTimeout(t)
    }
  }, [])

  return { pulsingSquares, pulse, clearPulsing }
}
