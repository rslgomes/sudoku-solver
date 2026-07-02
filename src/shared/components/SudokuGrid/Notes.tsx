import { cn } from '../../libs/cn'
import { SUDOKU_NUMBERS, type SudokuNumber } from '../../sudoku/types'

export default function Notes({
  notes,
  ref,
}: {
  notes: Set<SudokuNumber>
  ref?: React.Ref<HTMLDivElement>
}) {
  return (
    <div
      className="grid grid-cols-3 w-full h-full p-px"
      aria-hidden="true"
      ref={ref}
    >
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
