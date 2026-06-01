import { useRef, useState } from 'react'
import { cn } from '../../libs/cn'
import { SUDOKU_NUMBERS } from './types'
import type { Square, SudokuNumber } from './types'
import { usePlayableGrid } from './context'

function Notes({ notes }: { notes: Set<SudokuNumber> }) {
  return (
    <div className="grid grid-cols-3 w-full h-full p-px" aria-hidden="true">
      {SUDOKU_NUMBERS.map((n) => (
        <span
          key={n}
          className={cn(
            'flex items-center justify-center text-xs leading-none text-fg-muted select-none',
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

export default function PuzzleGrid() {
  const { grid, selected, onSelect, clearSelection, onNumber, onDelete } =
    usePlayableGrid()
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)
  const rovingIndex = focusedIndex ?? 0
  const cellRefs = useRef<(HTMLDivElement | null)[]>([])

  const handleClick = (i: number, e: React.MouseEvent) => {
    const toggle = e.shiftKey || e.ctrlKey || e.metaKey
    onSelect(i, toggle)
  }

  const handleKeyDown = (e: React.KeyboardEvent, i: number) => {
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
      role="grid"
      aria-label="Sudoku puzzle, 9 by 9 grid"
      aria-multiselectable="true"
      className="grid grid-cols-9 w-full aspect-square border-2 border-fg/50 overflow-hidden"
    >
      {Array.from({ length: 9 }, (_, row) => (
        <div role="row" key={row} className="contents">
          {Array.from({ length: 9 }, (_, col) => {
            const i = row * 9 + col
            const cell = grid[i]
            const isSelected = selected.has(i)

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
                onFocus={() => setFocusedIndex(i)}
                className={cn(
                  'relative aspect-square flex items-center justify-center cursor-pointer border border-fg/15 outline-none',
                  'focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset focus-visible:z-10',
                  (col === 2 || col === 5) && 'border-r-2 border-r-fg/40',
                  (row === 2 || row === 5) && 'border-b-2 border-b-fg/40',
                  isSelected
                    ? 'bg-accent-light/20 ring-1 ring-inset ring-accent/60'
                    : cell.locked
                      ? 'bg-bg-sunken'
                      : 'bg-bg-raised'
                )}
                style={
                  !isSelected && cell.color
                    ? { backgroundColor: cell.color }
                    : undefined
                }
              >
                {cell.value !== null ? (
                  <span
                    aria-hidden="true"
                    className={cn(
                      'text-xl leading-none select-none',
                      cell.locked ? 'font-bold text-fg' : 'text-accent'
                    )}
                  >
                    {cell.value}
                  </span>
                ) : cell.notes.size > 0 ? (
                  <Notes notes={cell.notes} />
                ) : null}

                {cell.locked && (
                  <span
                    aria-hidden="true"
                    className="absolute top-px right-px text-[6px] text-fg-faint leading-none"
                  >
                    ■
                  </span>
                )}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
