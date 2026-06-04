import { useMemo, useRef, useState } from 'react'
import type { MouseEvent, KeyboardEvent } from 'react'
import { cn } from '../../libs/cn'
import { SUDOKU_NUMBERS } from './types'
import type { Square, SudokuNumber } from './types'
import { useGrid } from './contexts/gridContext'
import { useConfig } from './contexts/configContext'

function Notes({ notes }: { notes: Set<SudokuNumber> }) {
  return (
    <div className="grid grid-cols-3 w-full h-full p-px" aria-hidden="true">
      {SUDOKU_NUMBERS.map((n) => (
        <span
          key={n}
          className={cn(
            'flex items-center justify-center text-xs leading-none text-fg select-none',
            !notes.has(n) && 'invisible'
          )}
        >
          {n}
        </span>
      ))}
    </div>
  )
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

export default function PuzzleGrid({ className }: { className?: string }) {
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
  } = useGrid()
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

  return (
    <div
      ref={registerInteractive}
      role="grid"
      aria-label="Sudoku puzzle, 9 by 9 grid"
      aria-multiselectable="true"
      className={cn(
        'grid grid-cols-9 w-full aspect-square border-2 border-fg/50 overflow-hidden',
        className
      )}
    >
      {Array.from({ length: 9 }, (_, row) => (
        <div role="row" key={row} className="contents">
          {Array.from({ length: 9 }, (_, col) => {
            const i = row * 9 + col
            const { cell, isSelected, isPeer, isError, isSameNumber, pulse } =
              cellView(i)
            const hasRound = isSameNumber || isError || pulse !== undefined

            return (
              <div
                key={i}
                ref={(el) => {
                  cellRefs.current[i] = el
                }}
                role="gridcell"
                aria-selected={isSelected}
                aria-readonly={cell.locked || undefined}
                aria-label={cellLabel(cell, row, col)}
                tabIndex={rovingIndex === i ? 0 : -1}
                onClick={(e) => handleClick(i, e)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                onFocus={() => setFocusedIndex(i)}
                onBlur={() => setFocusedIndex(null)}
                className={cn(
                  'relative aspect-square cursor-pointer border border-fg/15 outline-none',
                  'focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset focus-visible:z-10',
                  (col === 2 || col === 5) && 'border-r-2 border-r-fg/40',
                  (row === 2 || row === 5) && 'border-b-2 border-b-fg/40',
                  isSelected && 'ring-1 ring-inset ring-accent/60'
                )}
              >
                <div
                  aria-hidden="true"
                  className={cn(
                    'absolute inset-0',
                    cell.locked ? 'bg-bg-sunken' : 'bg-bg-raised'
                  )}
                  style={
                    cell.color ? { backgroundColor: cell.color } : undefined
                  }
                />

                <div
                  aria-hidden="true"
                  className={cn(
                    'absolute inset-0 pointer-events-none',
                    isPeer && 'bg-accent-light/20',
                    isSelected && 'bg-accent-light/30'
                  )}
                />

                {cell.value === null && cell.notes.size > 0 && (
                  <div className="absolute inset-0">
                    <Notes notes={cell.notes} />
                  </div>
                )}

                <span
                  aria-hidden="true"
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <span
                    className={cn(
                      'flex items-center justify-center text-xl leading-none select-none',
                      cell.value &&
                        (cell.locked ? 'font-bold text-fg-muted' : 'text-fg'),
                      hasRound && 'size-8 rounded-full text-white',
                      isSameNumber && 'bg-green',
                      isError && 'bg-red',
                      pulse === 'wrong' && 'animate-pulse-wrong'
                    )}
                  >
                    {cell.value}
                  </span>
                </span>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
