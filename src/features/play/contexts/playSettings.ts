import { createContext, useContext } from 'react'
import usePersistentState from '@shared/hooks/usePersistentState'

export type PlaySettings = {
  highlightPeersOnHover: boolean
  showLockButton: boolean
  autoError: boolean
  showRemaining: boolean
  highlightSameNumber: boolean

  autoClearPencil: boolean
  blockWrong: boolean

  showTimer: boolean

  setHighlightPeersOnHover: (value: boolean) => void
  setShowLockButton: (value: boolean) => void
  setAutoError: (value: boolean) => void
  setShowRemaining: (value: boolean) => void
  setHighlightSameNumber: (value: boolean) => void
  setAutoClearPencil: (value: boolean) => void
  setBlockWrong: (value: boolean) => void
  setShowTimer: (value: boolean) => void
}

export const ConfigContext = createContext<PlaySettings>(null!)

export function useConfigContext(): PlaySettings {
  const [highlightPeersOnHover, setHighlightPeersOnHover] = usePersistentState(
    'play:highlightPeersOnHover',
    false
  )
  const [showLockButton, setShowLockButton] = usePersistentState(
    'play:showLockButton',
    false
  )
  const [autoError, setAutoError] = usePersistentState('play:autoError', false)
  const [showRemaining, setShowRemaining] = usePersistentState(
    'play:showRemaining',
    false
  )
  const [highlightSameNumber, setHighlightSameNumber] = usePersistentState(
    'play:highlightSameNumber',
    false
  )

  const [autoClearPencil, setAutoClearPencil] = usePersistentState(
    'play:autoClearPencil',
    false
  )
  const [blockWrong, setBlockWrong] = usePersistentState(
    'play:blockWrong',
    false
  )

  const [showTimer, setShowTimer] = usePersistentState('play:showTimer', false)

  return {
    highlightPeersOnHover,
    showLockButton,
    autoError,
    showRemaining,
    highlightSameNumber,

    autoClearPencil,
    blockWrong,

    showTimer,

    setHighlightPeersOnHover,
    setShowLockButton,
    setAutoError,
    setShowRemaining,
    setHighlightSameNumber,
    setAutoClearPencil,
    setBlockWrong,
    setShowTimer,
  }
}

export function useConfig() {
  return useContext(ConfigContext)
}
