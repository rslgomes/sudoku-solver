import type { GridController, Square } from '../types'
import usePlay from './usePlay'
import { usePulse } from './usePulse'
import { useSelection } from './useSelection'
import { useMoves } from './useMoves'
import useTimer from './useTimer'

/** Composes board state, selection, pulse and move dispatch into one controller. */
export function usePadActions({
  initialGrid,
}: {
  initialGrid: Square[]
}): GridController {
  const play = usePlay(initialGrid)
  const timer = useTimer()
  const pulse = usePulse()
  const selection = useSelection()
  const moves = useMoves({
    play,
    selected: selection.selected,
    pulse: pulse.pulse,
    clearSelection: selection.clearSelection,
  })

  const onSelect = (i: number, toggle: boolean) => {
    const isNumberMove =
      (moves.activeMode === 'pen' || moves.activeMode === 'pencil') &&
      moves.selectedNumber !== null
    const isColorMove =
      moves.activeMode === 'paint' && moves.selectedColor !== undefined
    const isActionMove =
      moves.activeMode === 'eraser' || moves.activeMode === 'lock'
    if (isNumberMove) {
      moves.onNumber(moves.selectedNumber!, new Set([i]))
      return
    }
    if (isColorMove) {
      moves.onColor(moves.selectedColor as string | null, new Set([i]))
      return
    }
    if (isActionMove) {
      moves.onAction(new Set([i]))
      return
    }
    selection.select(i, toggle)
  }

  return {
    activeMode: moves.activeMode,
    onModeChange: moves.onModeChange,

    selected: selection.selected,
    onSelect,
    clearSelection: selection.clearSelection,
    registerInteractive: selection.registerInteractive,

    selectedNumber: moves.selectedNumber,
    selectedColor: moves.selectedColor,
    onNumber: moves.onNumber,

    grid: play.grid,
    canUndo: play.canUndo,
    onUndo: moves.onUndo,
    onReset: play.reset,
    onDelete: moves.onDelete,
    onColor: moves.onColor,
    onAction: moves.onAction,
    fillGrid: (squares: Square[]) => {
      play.fillGrid(squares, true)
      timer.startTimer()
    },

    pulsingSquares: pulse.pulsingSquares,
    clearPulsing: pulse.clearPulsing,

    timer,
  }
}
