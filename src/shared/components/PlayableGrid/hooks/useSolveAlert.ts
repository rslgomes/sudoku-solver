import { useRef, useState } from 'react'

export interface SolveAlertController {
  open: boolean
  close: () => void
}

/**
 * Opens once on each unsolved→solved transition. State is adjusted during
 * render (no effect): the move that solves the grid flips `isSolved`, this runs
 * synchronously on that render and opens. Closing won't reopen until the grid is
 * unsolved and solved again. `isSolved` already requires zero errors, so a
 * filled-but-wrong grid never triggers it.
 */
export default function useSolveAlert(isSolved: boolean): SolveAlertController {
  const [open, setOpen] = useState(false)
  const prevSolved = useRef(false)

  if (isSolved !== prevSolved.current) {
    prevSolved.current = isSolved
    if (isSolved) setOpen(true)
  }

  return { open, close: () => setOpen(false) }
}
