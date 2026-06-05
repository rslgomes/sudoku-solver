import { useCallback, useState } from 'react'
import type { MoveMode, PulseKind, SudokuNumber } from '../types'
import { useConfig } from '../contexts/playSettings'
import usePlay from './usePlay'
import { PEERS } from '@shared/sudoku/peers'

type Play = ReturnType<typeof usePlay>

interface MovesDeps {
  play: Play
  selected: Set<number>
  pulse: (indices: Iterable<number>, kind: PulseKind) => void
  clearSelection: () => void
}

export function useMoves({ play, selected, pulse, clearSelection }: MovesDeps) {
  const config = useConfig()
  const [activeMode, setActiveMode] = useState<MoveMode>('pen')
  const [selectedNumber, setSelectedNumber] = useState<SudokuNumber | null>(
    null
  )
  const [selectedColor, setSelectedColor] = useState<string | null | undefined>(
    undefined
  )

  const onModeChange = useCallback(
    (mode: MoveMode) => {
      if (mode === 'lock' || mode === 'eraser') clearSelection()
      return setActiveMode(mode)
    },
    [clearSelection]
  )

  function rejectConflicting(targets: Set<number>, n: SudokuNumber) {
    const wrong = new Set<number>()
    for (const i of targets) {
      for (const peer of PEERS[i]) {
        if (play.grid[peer].value !== n) continue
        targets.delete(i)
        wrong.add(i)
        break
      }
    }
    return wrong
  }

  function clearPeerPencil(targets: Set<number>, n: SudokuNumber) {
    const peersToClear = new Set<number>()
    for (const t of targets) {
      for (const peer of PEERS[t]) peersToClear.add(peer)
    }
    play.handleMove(
      { mode: 'pencil', targets: peersToClear, data: new Set([n]) },
      { destructive: true }
    )
  }

  function onNumber(n: SudokuNumber, customSelection?: Set<number>) {
    if (activeMode !== 'pen' && activeMode !== 'pencil') return
    const targets = new Set(customSelection ?? selected)

    if (targets.size === 0) {
      setSelectedNumber(n === selectedNumber ? null : n)
      return
    }

    if (config.blockWrong) {
      const wrong = rejectConflicting(targets, n)
      if (wrong.size) pulse(wrong, 'wrong')
      if (targets.size === 0) return
    }

    play.handleMove(
      activeMode === 'pen'
        ? { mode: 'pen', targets, data: n }
        : { mode: 'pencil', targets, data: new Set([n]) }
    )

    if (config.autoClearPencil && activeMode === 'pen') {
      clearPeerPencil(targets, n)
    }
  }

  function onColor(color: string | null, customSelection?: Set<number>) {
    if (activeMode !== 'paint') return
    const targets = new Set(customSelection ?? selected)
    if (targets.size === 0) {
      setSelectedColor(color === selectedColor ? undefined : color)
      return
    }
    play.handleMove({ mode: 'paint', targets, data: color })
  }

  function onAction(customSelection?: Set<number>) {
    if (activeMode !== 'lock' && activeMode !== 'eraser') return
    const targets = new Set(customSelection ?? selected)
    play.handleMove(
      activeMode === 'eraser'
        ? { mode: 'eraser', targets, data: null }
        : { mode: 'lock', targets, data: null }
    )
  }

  function onDelete(customSelection?: Set<number>) {
    play.handleMove({
      mode: 'eraser',
      targets: customSelection ?? selected,
      data: null,
    })
  }

  function onUndo() {
    play.undo()
  }

  return {
    activeMode,
    onModeChange,
    selectedNumber,
    selectedColor,
    onNumber,
    onColor,
    onAction,
    onDelete,
    onUndo,
  }
}
