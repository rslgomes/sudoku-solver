import type { HTMLAttributes } from 'react'
import { cn } from '../../libs/cn'

interface BaseSquareProps {
  mode: 'pen' | 'pencil'
  penMark?: number
  pencilMarks?: number[]
  customBgColor?: string
  locked: boolean
  isSelected: boolean
  onClick: () => void
  borders?: Partial<{
    top: string
    right: string
    bottom: string
    left: string
  }>
}

export type SquareProps = BaseSquareProps & HTMLAttributes<HTMLDivElement>

export default function Square({
  mode,
  penMark,
  pencilMarks = [],
  borders = {},
  className,
  locked,
  customBgColor,
  isSelected,
  ...rest
}: SquareProps) {
  const borderClasses = [
    borders.top ?? null,
    borders.right ?? null,
    borders.bottom ?? null,
    borders.left ?? null,
  ].join(' ')

  return (
    <div
      role="gridcell"
      tabIndex={0}
      aria-label={
        mode === 'pen'
          ? penMark !== undefined
            ? `Pen mark ${penMark}`
            : 'Empty square'
          : pencilMarks.length > 0
            ? `Pencil marks ${pencilMarks.join(', ')}`
            : 'Empty square'
      }
      className={cn(
        'aspect-square w-full border border-primary-border text-fg1 flex items-center justify-center text-lg font-semibold',
        borderClasses,
        {
          'text-primary-border': locked,
          'border-2 border-secondary': isSelected,
          [customBgColor ?? '']: customBgColor !== undefined,
        },
        className
      )}
      {...rest}
    >
      {mode === 'pen' && <span className="text-2xl">{penMark}</span>}
      {mode === 'pencil' && (
        <div className="grid grid-cols-3 gap-0.5 w-full h-full text-xs p-1 leading-none">
          {pencilMarks.map((mark) => (
            <div className="flex items-center justify-center" key={mark}>
              {mark}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
