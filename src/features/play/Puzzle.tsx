import { useId, useMemo, useRef, useState } from 'react'
import type { MouseEvent, KeyboardEvent } from 'react'
import SudokuGrid from '@shared/components/SudokuGrid'
import CellContent from './CellContent'
import type { Square, SudokuNumber } from './types'
import { useController } from './contexts/playControllerContext'
import { useConfig } from './contexts/playSettings'
import { PAINT_COLORS } from './colors'

const ALL_SQUARES = Array.from({ length: 81 }, (_, i) => i)

const UNIT_ROW = (i: number) => {
  const start = Math.floor(i / 9) * 9
  return Array.from({ length: 9 }, (_, c) => start + c)
}

const UNIT_COLUMN = (i: number) => {
  const col = i % 9
  return Array.from({ length: 9 }, (_, r) => r * 9 + col)
}

function cellLabel(cell: Square, row: number, col: number): string {
  const pos = `Row ${row + 1}, column ${col + 1}`
  if (cell.value !== null) {
    return `${pos}, ${cell.locked ? 'given' : 'entered'} ${cell.value}`
  }
  if (cell.notes.size > 0) {
    const ns = [...cell.notes].sort((a, b) => a - b).join(', ')
    return `${pos}, empty, candidates ${ns}`
  }
  return `${pos}, empty`
}

export default function Puzzle({ className }: { className?: string }) {
  const {
    grid,
    selected,
    selectedNumber,
    selectedColor,
    activeMode,
    onSelect,
    clearSelection,
    selectMany,
    onNumber,
    onColor,
    onAction,
    onDelete,
    registerInteractive,
    pulsingSquares,
    meta,
  } = useController()
  const { errors, peers, isFilled } = meta
  const { highlightPeersOnHover, autoError, highlightSameNumber } = useConfig()

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)
  const rovingIndex = focusedIndex ?? 0
  const cellRefs = useRef<(HTMLDivElement | null)[]>([])
  const instructionsId = useId()

  const activeIndex = hoveredIndex ?? focusedIndex
  const activePeers = useMemo(() => {
    return activeIndex === null ? new Set<number>() : peers[activeIndex]
  }, [activeIndex, peers])

  const highlightedNumber =
    selectedNumber ??
    (selected.size === 1 ? grid[[...selected][0]].value : null)

  const cellView = (i: number) => {
    const cell = grid[i]
    return {
      cell,
      isSelected: selected.has(i),
      isCursor: focusedIndex === i,
      isPeer: activePeers.has(i) && highlightPeersOnHover,
      isError: errors.has(i) && (autoError || isFilled),
      isSameNumber:
        !!cell.value && cell.value === highlightedNumber && highlightSameNumber,
      pulse: pulsingSquares.get(i),
    }
  }

  const handleClick = (i: number, e: MouseEvent) => {
    const toggle = e.shiftKey || e.ctrlKey || e.metaKey
    onSelect(i, toggle)
  }

  const moveCursor = (target: number, from: number, extend: boolean) => {
    if (extend) selectMany([from, target], true)
    cellRefs.current[target]?.focus()
    setFocusedIndex(target)
  }

  const targetsFrom = (i: number) =>
    selected.size === 0 ? new Set([i]) : selected

  const applyActiveTool = (targets: Set<number>) => {
    if (activeMode === 'eraser' || activeMode === 'lock') {
      onAction?.(targets)
      return
    }
    if (activeMode === 'paint') {
      if (selectedColor !== undefined) onColor?.(selectedColor, targets)
      return
    }
    if (selectedNumber !== null) onNumber?.(selectedNumber, targets)
  }

  const handleKeyDown = (e: KeyboardEvent, i: number) => {
    const row = Math.floor(i / 9)
    const col = i % 9
    let target: number | null = null

    if (e.key === ' ' && (e.shiftKey || e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      const unit = e.shiftKey ? UNIT_ROW : UNIT_COLUMN
      selectMany(unit(i), true)
      return
    }

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
      e.preventDefault()
      selectMany(ALL_SQUARES)
      return
    }

    if (e.key === 'PageUp' || e.key === 'PageDown') {
      e.preventDefault()
      const step = e.key === 'PageUp' ? -3 : 3
      const nextRow = Math.min(Math.max(row + step, 0), 8)
      moveCursor(nextRow * 9 + col, i, e.shiftKey)
      return
    }

    switch (e.key) {
      case 'ArrowRight':
        if (col < 8) target = i + 1
        break
      case 'ArrowLeft':
        if (col > 0) target = i - 1
        break
      case 'ArrowDown':
        if (row < 8) target = i + 9
        break
      case 'ArrowUp':
        if (row > 0) target = i - 9
        break
      case 'Home':
        target = e.ctrlKey ? 0 : row * 9
        break
      case 'End':
        target = e.ctrlKey ? 80 : row * 9 + 8
        break
      case ' ':
        e.preventDefault()
        onSelect(i, true)
        return
      case 'Enter':
        e.preventDefault()
        applyActiveTool(targetsFrom(i))
        return
      case 'Escape':
        e.preventDefault()
        clearSelection()
        return
      case 'Delete':
      case 'Backspace':
        e.preventDefault()
        onDelete?.(selected.size === 0 ? new Set([i]) : selected)
        return
    }

    if (target !== null) {
      e.preventDefault()
      moveCursor(target, i, e.shiftKey)
      return
    }

    if (!/^[1-9]$/.test(e.key)) return

    if (activeMode === 'paint') {
      const swatch = PAINT_COLORS[Number(e.key) - 1]
      if (swatch) onColor?.(swatch.value, targetsFrom(i))
      return
    }

    onNumber?.(Number(e.key) as SudokuNumber, targetsFrom(i))
  }

  const cellProps = (i: number) => {
    const { cell, isSelected } = cellView(i)
    const row = Math.floor(i / 9)
    const col = i % 9
    return {
      ref: (el: HTMLDivElement | null) => {
        cellRefs.current[i] = el
      },
      'aria-selected': isSelected,
      'aria-readonly': cell.locked || undefined,
      'aria-label': cellLabel(cell, row, col),
      tabIndex: rovingIndex === i ? 0 : -1,
      onClick: (e: MouseEvent) => handleClick(i, e),
      onKeyDown: (e: KeyboardEvent) => handleKeyDown(e, i),
      onMouseEnter: () => setHoveredIndex(i),
      onMouseLeave: () => setHoveredIndex(null),
      onFocus: () => setFocusedIndex(i),
      onBlur: () => setFocusedIndex(null),
      className: 'cursor-pointer outline-none',
    }
  }

  const renderCell = (i: number) => {
    const { cell, isSelected, isCursor, isPeer, isError, isSameNumber, pulse } =
      cellView(i)

    return (
      <CellContent
        value={cell.value}
        locked={cell.locked}
        color={cell.color}
        notes={cell.notes}
        isSelected={isSelected}
        isCursor={isCursor}
        isPeer={isPeer}
        isError={isError}
        isSameNumber={isSameNumber}
        pulse={pulse}
      />
    )
  }

  return (
    <>
      <p id={instructionsId} className="sr-only">
        Arrow keys move between squares, 1 to 9 write a digit, Enter applies the
        active tool. Press question mark for the full list of shortcuts.
      </p>
      <SudokuGrid
        className={className}
        ariaLabel="Sudoku puzzle, 9 by 9 grid"
        ariaDescribedBy={instructionsId}
        multiselectable
        containerRef={registerInteractive}
        cellProps={cellProps}
        renderCell={renderCell}
      />
    </>
  )
}
