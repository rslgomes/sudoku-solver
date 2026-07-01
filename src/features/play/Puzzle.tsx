import { useMemo, useRef, useState } from 'react'
import type { MouseEvent, KeyboardEvent } from 'react'
import { cn } from '@shared/libs/cn'
import SudokuGrid from '@shared/components/SudokuGrid'
import CellContent from './CellContent'
import type { Square, SudokuNumber } from './types'
import { useController } from './contexts/controllerContext'
import { useConfig } from './contexts/playSettings'

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
    onSelect,
    clearSelection,
    onNumber,
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

  const handleKeyDown = (e: KeyboardEvent, i: number) => {
    const row = Math.floor(i / 9)
    const col = i % 9
    let target: number | null = null

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
      cellRefs.current[target]?.focus()
      setFocusedIndex(target)
      return
    }

    if (/^[1-9]$/.test(e.key))
      onNumber?.(
        Number(e.key) as SudokuNumber,
        selected.size === 0 && focusedIndex != null
          ? new Set([focusedIndex])
          : undefined
      )
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
      className: cn(
        'cursor-pointer outline-none',
        'focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset focus-visible:z-10',
        isSelected && 'ring-1 ring-inset ring-accent/60'
      ),
    }
  }

  const renderCell = (i: number) => {
    const { cell, isSelected, isPeer, isError, isSameNumber, pulse } =
      cellView(i)

    return (
      <CellContent
        value={cell.value}
        locked={cell.locked}
        color={cell.color}
        notes={cell.notes}
        isSelected={isSelected}
        isPeer={isPeer}
        isError={isError}
        isSameNumber={isSameNumber}
        pulse={pulse}
      />
    )
  }

  return (
    <SudokuGrid
      className={className}
      ariaLabel="Sudoku puzzle, 9 by 9 grid"
      multiselectable
      containerRef={registerInteractive}
      cellProps={cellProps}
      renderCell={renderCell}
    />
  )
}
