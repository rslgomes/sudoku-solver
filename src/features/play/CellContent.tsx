import { memo } from 'react'
import { cn } from '@shared/libs/cn'
import { Notes } from '@shared/components/SudokuGrid'
import type { PulseKind, SudokuNumber } from './types'

type CellContentProps = {
  value: SudokuNumber | null
  locked: boolean
  color: string | null
  notes: Set<SudokuNumber>
  isSelected: boolean
  isCursor: boolean
  isPeer: boolean
  isError: boolean
  isSameNumber: boolean
  pulse?: PulseKind
}

function CellContent({
  value,
  locked,
  color,
  notes,
  isSelected,
  isCursor,
  isPeer,
  isError,
  isSameNumber,
  pulse,
}: CellContentProps) {
  const hasRound = isSameNumber || isError || pulse !== undefined

  return (
    <>
      <div aria-hidden="true" className="absolute inset-0 bg-bg-raised" />

      {locked && (
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none bg-bg-sunken/50"
        />
      )}

      {color && (
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundColor: color, opacity: 0.35 }}
        />
      )}

      <div
        aria-hidden="true"
        className={cn(
          'absolute inset-0 pointer-events-none',
          isPeer && 'bg-accent-light/20',
          isSelected && 'bg-accent-light/30'
        )}
      />

      {value === null && notes.size > 0 && (
        <div className="absolute inset-0">
          <Notes notes={notes} />
        </div>
      )}

      <span
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center"
      >
        <span
          className={cn(
            'flex items-center justify-center text-xl leading-none select-none',
            value && (locked ? 'font-bold text-fg-muted' : 'text-fg'),
            hasRound && 'size-8 rounded-full',
            isSameNumber && 'bg-green/25',
            (isError || pulse === 'wrong') && 'bg-red text-white',
            pulse === 'wrong' && 'animate-pulse-wrong'
          )}
        >
          {value}
        </span>
      </span>

      {isCursor && (
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none ring-2 ring-inset ring-accent"
        />
      )}
    </>
  )
}

export default memo(CellContent)
