import { useEffect, useMemo, useRef, useState } from 'react'
import usePlay, { type Move } from '../../hooks/usePlay'
import ToolBar from './ToolBar'
import Grid from '../Grid'
import ValuePanel from './ValuePanel'
import type { UIInputMode } from '../../libs/types'

const INPUT_MODE_VALUE_TYPE: Record<
  Exclude<UIInputMode, 'clear' | 'lock'>,
  'number' | 'boolean' | 'string'
> = {
  pen: 'number',
  pencil: 'number',
  color: 'string',
}

function buildMove(
  mode: UIInputMode,
  index: number,
  selectedValue: number | string | boolean | null
): Move | null {
  switch (mode) {
    case 'clear':
      return { mode: 'clear', index, value: undefined }
    case 'lock':
      return { mode: 'lock', index, value: undefined }
    case 'pen':
    case 'pencil':
      return typeof selectedValue === 'number'
        ? { mode, index, value: selectedValue }
        : null
    case 'color':
      return typeof selectedValue === 'string'
        ? { mode, index, value: selectedValue }
        : null

    default:
      return null
  }
}

function buildMoves(
  mode: UIInputMode,
  indices: number[],
  selectedValue: number | string | boolean | null
): Move[] {
  return indices
    .map((i) => buildMove(mode, i, selectedValue))
    .filter((m): m is Move => m !== null)
}

const GridPlayArea = () => {
  const { makeMove, makeMoves } = usePlay()

  const [mode, setMode] = useState<UIInputMode>('pen')
  const [selectedValue, setSelectedValue] = useState<
    number | string | boolean | null
  >(null)
  const [selection, setSelection] = useState<number[]>([])

  const gridRef = useRef<HTMLDivElement>(null)
  const toolBarRef = useRef<HTMLDivElement>(null)
  const valuePanelRef = useRef<HTMLDivElement>(null)

  const keepRefs = useMemo(
    () => [gridRef, toolBarRef, valuePanelRef] as const,
    []
  )

  const handleMode = (modeValue: UIInputMode) => {
    const willRemove = mode === modeValue
    setMode(willRemove ? 'pen' : modeValue)
  }

  const handleValue = (value: number | string | boolean | null) => {
    const modeConflicts =
      mode === 'clear' ||
      mode === 'lock' ||
      typeof value !== INPUT_MODE_VALUE_TYPE[mode]
    if (modeConflicts) return

    const willMove = (selection ?? []).length > 0 && value !== null

    if (willMove) {
      if (selection.length === 1) {
        const move = buildMove(mode, selection[0], value)
        if (move) makeMove(move)
      } else {
        const moves = buildMoves(mode, selection, value)
        if (moves.length) makeMoves(moves)
      }
      return
    }

    const willRemove = value === selectedValue
    setSelectedValue(willRemove ? null : value)
  }

  const handleSelection = (indices: number[]) => {
    const getNewSelection = () => {
      const currentSelection = [...selection]
      const isSinglePick = currentSelection.length <= 1 && indices.length === 1
      if (isSinglePick) return indices[0] === currentSelection[0] ? [] : indices

      indices.forEach((index) => {
        const exists = currentSelection.includes(index)
        if (exists) currentSelection.splice(currentSelection.indexOf(index), 1)
        else currentSelection.push(index)
      })
      return currentSelection
    }
    const newSelection = getNewSelection()

    console.log('move', buildMove(mode, newSelection[0], selectedValue))

    const hasPendingMove =
      newSelection.length > 0 &&
      (mode === 'clear' ||
        mode === 'lock' ||
        buildMove(mode, newSelection[0], selectedValue) !== null)

    if (hasPendingMove) {
      if (newSelection.length === 1) {
        const move = buildMove(mode, newSelection[0], selectedValue)
        if (move) makeMove(move)
      } else {
        const moves = buildMoves(mode, newSelection, selectedValue)
        if (moves.length) makeMoves(moves)
      }
      setSelection([])
    } else {
      setSelection(newSelection)
    }
  }
  const clearSelection = () => {
    handleSelection(selection)
  }

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null
      if (!target) return

      if ((target as HTMLElement).closest('[data-keep-selection]')) return

      for (const ref of keepRefs) {
        const el = ref.current
        if (el && el.contains(target)) return
      }
      clearSelection()
    }
    document.addEventListener('pointerdown', onPointerDown, true)
    return () =>
      document.removeEventListener('pointerdown', onPointerDown, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keepRefs])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelection((prev) => (prev.length ? [] : prev))
        setSelectedValue(null)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div className="flex gap-2">
      <div className="flex flex-col gap-6">
        <Grid onSelect={handleSelection} selection={selection} ref={gridRef} />
        <ValuePanel
          mode={mode}
          value={selectedValue}
          handleValue={handleValue}
          ref={valuePanelRef}
        />
      </div>
      <ToolBar mode={mode} handleMode={handleMode} ref={toolBarRef} />
    </div>
  )
}

export default GridPlayArea
