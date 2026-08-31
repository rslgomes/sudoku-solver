import { cn } from '../../libs/cn'
import { SUDOKU_NUMBERS, type SudokuNumber } from '../../sudoku/types'

export default function Notes({
  notes,
  struck,
  added,
  ref,
}: {
  notes: Set<SudokuNumber>
  struck?: SudokuNumber[]
  added?: SudokuNumber[]
  ref?: React.Ref<HTMLDivElement>
}) {
  return (
    <div
      className="grid grid-cols-3 w-full h-full p-px"
      aria-hidden="true"
      ref={ref}
    >
      {SUDOKU_NUMBERS.map((n) => {
        const isStruck = struck?.includes(n)
        const isAdded = added?.includes(n)
        return (
          <span
            key={n}
            className={cn(
              'flex items-center justify-center text-xs leading-none select-none',
              isStruck
                ? 'text-red/60 line-through'
                : isAdded
                  ? 'text-accent font-bold'
                  : 'text-fg',
              !notes.has(n) && !isStruck && 'invisible'
            )}
          >
            {n}
          </span>
        )
      })}
    </div>
  )
}
