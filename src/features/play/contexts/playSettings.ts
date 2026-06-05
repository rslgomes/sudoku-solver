import { createContext, useContext, useState } from 'react'

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
  const [highlightPeersOnHover, setHighlightPeersOnHover] = useState(false)
  const [showLockButton, setShowLockButton] = useState(false)
  const [autoError, setAutoError] = useState(false)
  const [showRemaining, setShowRemaining] = useState(false)
  const [highlightSameNumber, setHighlightSameNumber] = useState(false)

  const [autoClearPencil, setAutoClearPencil] = useState(false)
  const [blockWrong, setBlockWrong] = useState(false)

  const [showTimer, setShowTimer] = useState(false)

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
