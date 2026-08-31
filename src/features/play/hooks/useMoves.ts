import { useCallback, useState } from 'react'
import { MODE_LABEL } from '../types'
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
  announce: (message: string) => void
}

function squareCount(n: number) {
  return n === 1 ? '1 square' : `${n} squares`
}

export function useMoves({
  play,
  selected,
  pulse,
  clearSelection,
  announce,
}: MovesDeps) {
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
      announce(
        `${MODE_LABEL[mode].title} mode active — ${MODE_LABEL[mode].hint}`
      )
      return setActiveMode(mode)
    },
    [clearSelection, announce]
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
      if (targets.size === 0) {
        announce(`${n} conflicts with a peer — not placed`)
        return
      }
    }

    play.handleMove(
      activeMode === 'pen'
        ? { mode: 'pen', targets, data: n }
        : { mode: 'pencil', targets, data: new Set([n]) }
    )

    if (config.autoClearPencil && activeMode === 'pen') {
      clearPeerPencil(targets, n)
    }

    announce(
      activeMode === 'pen'
        ? `${n} placed in ${squareCount(targets.size)}`
        : `${n} noted in ${squareCount(targets.size)}`
    )
  }

  function onColor(color: string | null, customSelection?: Set<number>) {
    if (activeMode !== 'paint') return
    const targets = new Set(customSelection ?? selected)
    if (targets.size === 0) {
      setSelectedColor(color === selectedColor ? undefined : color)
      return
    }
    play.handleMove({ mode: 'paint', targets, data: color })
    announce(
      color
        ? `Painted ${squareCount(targets.size)}`
        : `Cleared color from ${squareCount(targets.size)}`
    )
  }

  function onAction(customSelection?: Set<number>) {
    if (activeMode !== 'lock' && activeMode !== 'eraser') return
    const targets = new Set(customSelection ?? selected)
    play.handleMove(
      activeMode === 'eraser'
        ? { mode: 'eraser', targets, data: null }
        : { mode: 'lock', targets, data: null }
    )
    announce(
      activeMode === 'eraser'
        ? `Erased ${squareCount(targets.size)}`
        : `Toggled the lock on ${squareCount(targets.size)}`
    )
  }

  function onDelete(customSelection?: Set<number>) {
    const targets = customSelection ?? selected
    play.handleMove({ mode: 'eraser', targets, data: null })
    announce(`Erased ${squareCount(targets.size)}`)
  }

  function onUndo() {
    play.undo()
    announce('Move undone')
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
