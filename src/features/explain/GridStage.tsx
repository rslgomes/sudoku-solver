import SudokuGrid, { Notes } from '@shared/components/SudokuGrid'
import { cn } from '@shared/libs/cn'
import { useStageContext } from './contexts/stageContext'

export default function GridStage() {
  const { board, registerCell, evidence } = useStageContext()

  return (
    <SudokuGrid
      ariaLabel="Solution"
      cellProps={(i) => ({
        ref: (el) => registerCell(i, el),
        className: cn(
          evidence.placed.has(i) && 'ring-2 ring-inset ring-accent z-10'
        ),
      })}
      renderCell={(i) => {
        const sq = board[i]
        if (sq.value)
          return (
            <span
              className={cn(
                'flex h-full w-full items-center justify-center text-xl',
                evidence.placed.has(i) ? 'text-accent font-bold' : 'text-fg'
              )}
            >
              {sq.value}
            </span>
          )
        return (
          <Notes
            notes={sq.notes}
            struck={evidence.struck.get(i)}
            added={evidence.added.get(i)}
          />
        )
      }}
    />
  )
}
