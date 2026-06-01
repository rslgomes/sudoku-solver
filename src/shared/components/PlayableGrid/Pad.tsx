import { cn } from '../../libs/cn'
import { SUDOKU_NUMBERS, MODE_LABEL } from './types'
import type { MoveMode } from './types'
import { usePlayableGrid } from './context'

const COLORS: (string | null)[] = [
  '#fca5a5',
  '#fde68a',
  '#86efac',
  '#93c5fd',
  '#c4b5fd',
  '#f9a8d4',
  null,
]

function PadShell({
  mode,
  children,
}: {
  mode: MoveMode
  children: React.ReactNode
}) {
  const { title, hint } = MODE_LABEL[mode]
  return (
    <div className="bg-bg-base shadow-raise p-3 flex flex-col gap-2.5">
      <div className="flex flex-col gap-0.5">
        <span className="font-style text-sm text-accent uppercase tracking-widest">
          {title}
        </span>
        <span className="font-main text-xs text-fg">{hint}</span>
      </div>
      {children}
    </div>
  )
}

export default function Pad() {
  const { activeMode: mode, selectedNumber, onNumber, onColor, onAction } =
    usePlayableGrid()
  if (mode === 'pen' || mode === 'pencil') {
    return (
      <PadShell mode={mode}>
        <div className="grid grid-cols-3 gap-1 w-full">
          {SUDOKU_NUMBERS.map((n) => (
            <button
              key={n}
              onClick={() => onNumber(n)}
              className={cn(
                'h-9 flex items-center justify-center',
                'font-style text-base text-fg',
                'bg-bg-raised shadow-raise cursor-pointer select-none',
                selectedNumber === n &&
                  'shadow-press bg-bg-sunken text-accent font-semibold',
                'transition-[box-shadow,background-color] duration-75',
                'hover:bg-bg-widget active:shadow-press active:bg-bg-sunken'
              )}
            >
              {n}
            </button>
          ))}
        </div>
      </PadShell>
    )
  }

  if (mode === 'paint') {
    return (
      <PadShell mode={mode}>
        <div className="flex flex-wrap gap-1.5">
          {COLORS.map((color, i) => (
            <button
              key={i}
              onClick={() => onColor(color)}
              title={color ?? 'Clear color'}
              className={cn(
                'w-8 h-8 shadow-raise cursor-pointer select-none',
                'transition-shadow duration-75 hover:shadow-press',
                !color &&
                  'bg-bg-raised text-fg-muted text-xs flex items-center justify-center'
              )}
              style={color ? { backgroundColor: color } : undefined}
            >
              {!color && '×'}
            </button>
          ))}
        </div>
      </PadShell>
    )
  }

  return (
    <PadShell mode={mode}>
      <button
        onClick={onAction}
        className={cn(
          'w-full py-2 font-main text-sm text-fg',
          'bg-bg-raised shadow-raise cursor-pointer select-none',
          'transition-[box-shadow,background-color] duration-75',
          'hover:bg-bg-widget active:shadow-press active:bg-bg-sunken'
        )}
      >
        {mode === 'eraser' ? 'Erase selected' : 'Toggle lock'}
      </button>
    </PadShell>
  )
}
