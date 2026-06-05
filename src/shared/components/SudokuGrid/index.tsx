import type { ComponentPropsWithRef, ReactNode } from 'react'
import { cn } from '../../libs/cn'

export { default as Notes } from './Notes'

const AXIS = Array.from({ length: 9 }, (_, i) => i)

function boxBorders(row: number, col: number): string {
  return cn(
    (col === 2 || col === 5) && 'border-r-2 border-r-fg/40',
    (row === 2 || row === 5) && 'border-b-2 border-b-fg/40'
  )
}

type CellRef = (el: HTMLDivElement | null) => (() => void) | void

type SudokuGridProps = {
  className?: string
  ariaLabel?: string
  multiselectable?: boolean
  containerRef?: CellRef
  renderCell: (index: number) => ReactNode
  cellProps?: (index: number) => ComponentPropsWithRef<'div'>
}

export default function SudokuGrid({
  className,
  ariaLabel = 'Sudoku grid, 9 by 9',
  multiselectable,
  containerRef,
  renderCell,
  cellProps,
}: SudokuGridProps) {
  return (
    <div
      ref={containerRef}
      role="grid"
      aria-label={ariaLabel}
      aria-multiselectable={multiselectable || undefined}
      className={cn(
        'grid grid-cols-9 w-full aspect-square border-2 border-fg/50 overflow-hidden',
        className
      )}
    >
      {AXIS.map((row) => (
        <div role="row" key={row} className="contents">
          {AXIS.map((col) => {
            const i = row * 9 + col
            const { className: cellClassName, ...rest } = cellProps?.(i) ?? {}
            return (
              <div
                key={i}
                role="gridcell"
                className={cn(
                  'relative aspect-square border border-fg/15',
                  boxBorders(row, col),
                  cellClassName
                )}
                {...rest}
              >
                {renderCell(i)}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
