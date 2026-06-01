import { useState } from 'react'
import type {
  MoveMode,
  Square,
  SudokuNumber,
} from '../../shared/components/PlayableGrid/types'
import usePlay from '../../shared/components/PlayableGrid/usePlay'

export function usePadActions({ initialGrid }: { initialGrid: Square[] }) {
  const [activeMode, setActiveMode] = useState<MoveMode>('pen')
  const [selected, setSelected] = useState(new Set<number>())
  const [selectedNumber, setSelectedNumber] = useState<SudokuNumber | null>(
    null
  )
  const play = usePlay(initialGrid)

  function onModeChange(mode: MoveMode) {
    setActiveMode(mode)
  }
  function onNumber(n: SudokuNumber, customSelection?: Set<number>) {
    if (activeMode !== 'pen' && activeMode !== 'pencil') return
    const targets = customSelection ?? selected ?? new Set<number>()
    const isMove = targets.size > 0
    if (!isMove) {
      setSelectedNumber(n === selectedNumber ? null : n)
      return
    }

    play.handleMove(
      activeMode === 'pen'
        ? { mode: 'pen', targets, data: n }
        : {
            mode: 'pencil',
            targets,
            data: new Set([n]),
          }
    )
  }
  function onColor(color: string | null) {
    if (activeMode !== 'paint') return
    const targets = selected ?? new Set<number>()
    play.handleMove({ mode: 'paint', targets, data: color })
  }
  function onAction() {
    if (activeMode !== 'lock' && activeMode !== 'eraser') return
    const targets = selected ?? new Set<number>()
    play.handleMove(
      activeMode === 'eraser'
        ? { mode: 'eraser', targets, data: null }
        : { mode: 'lock', targets, data: null }
    )
  }
  function onDelete(customSelection?: Set<number>) {
    const targets = customSelection ?? selected ?? new Set<number>()
    play.handleMove({ mode: 'eraser', targets, data: null })
  }
  function onSelect(i: number, toggle: boolean) {
    const isMove =
      (activeMode === 'pen' || activeMode === 'pencil') &&
      selectedNumber !== null
    if (isMove) {
      onNumber(selectedNumber, new Set([i]))
      return
    }
    if (!toggle) {
      setSelected(new Set([i]))
      return
    }

    const newSelected = new Set(selected)
    if (newSelected.has(i)) newSelected.delete(i)
    else newSelected.add(i)

    setSelected(newSelected)
  }
  function clearSelection() {
    setSelected(new Set())
  }
  function onUndo() {
    play.undo()
  }

  return {
    activeMode,
    onModeChange,

    selected,
    onSelect,
    clearSelection,

    selectedNumber,
    onNumber,

    grid: play.grid,
    canUndo: play.canUndo,
    onUndo,
    onDelete,
    onColor,
    onAction,
    fillGrid: play.fillGrid,
  }
}
