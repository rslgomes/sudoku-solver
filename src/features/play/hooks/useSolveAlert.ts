import { useRef, useState } from 'react'

export interface SolveAlertController {
  open: boolean
  close: () => void
}

export default function useSolveAlert(isSolved: boolean): SolveAlertController {
  const [open, setOpen] = useState(false)
  const prevSolved = useRef(false)

  if (isSolved !== prevSolved.current) {
    prevSolved.current = isSolved
    if (isSolved) setOpen(true)
  }

  return { open, close: () => setOpen(false) }
}
