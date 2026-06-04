import { cn } from '../../libs/cn'
import { SUDOKU_NUMBERS, MODE_LABEL } from './types'
import type { MoveMode } from './types'
import { useGrid } from './contexts/gridContext'
import { useConfig } from './contexts/configContext'
import useGridMeta from './hooks/useGridMeta'
import { NoSymbolIcon } from '@heroicons/react/24/outline'

const COLORS: (string | null)[] = [
  'oklch(68% 0.12 60)', // orange
  'oklch(72% 0.12 110)', // yellow-green
  'oklch(64% 0.12 150)', // green
  'oklch(65% 0.1 200)', // teal
  'oklch(60% 0.11 250)', // blue
  null,
]

function PadShell({
  mode,
  className,
  children,
}: {
  mode: MoveMode
  className?: string
  children?: React.ReactNode
}) {
  const { title, hint } = MODE_LABEL[mode]
  return (
    <div className={cn('bg-bg-base p-3 px-4', className)}>
      <div className="w-full max-w-lg mx-auto flex flex-col gap-2.5">
        <div className="flex flex-col gap-0.5">
          <span className="font-style text-sm text-accent uppercase tracking-widest">
            {title}
          </span>
          <span className="font-main text-xs text-fg">{hint}</span>
        </div>
        {children}
      </div>
    </div>
  )
}

export default function Pad({ className }: { className?: string }) {
  const {
    activeMode: mode,
    selectedNumber,
    selectedColor,
    onNumber,
    onColor,
    registerInteractive,
    grid,
  } = useGrid()
  const { showRemaining } = useConfig()
  const { missingCount } = useGridMeta(grid)
  if (mode === 'pen' || mode === 'pencil') {
    return (
      <PadShell mode={mode} className={className}>
        <div className="grid grid-cols-3 gap-1 w-full">
          {SUDOKU_NUMBERS.map((n) => (
            <button
              key={n}
              ref={registerInteractive}
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
              {showRemaining ? (
                <span className="text-xs text-blue">
                  {`(${missingCount.get(n)})`}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </PadShell>
    )
  }

  if (mode === 'paint') {
    return (
      <PadShell mode={mode} className={className}>
        <div className="flex flex-wrap gap-1.5">
          {COLORS.map((color, i) => (
            <button
              key={i}
              ref={registerInteractive}
              onClick={() => onColor(color)}
              title={color ?? 'Clear color'}
              className={cn(
                'h-8 shadow-raise cursor-pointer select-none relative',
                'transition-shadow duration-75 hover:opacity-80',
                color ? 'w-8' : 'px-2',
                !color &&
                  'bg-bg-raised text-fg-muted text-xs flex items-center justify-center',
                selectedColor === color && 'shadow-press'
              )}
              style={color ? { backgroundColor: color } : undefined}
            >
              {!color && <NoSymbolIcon className="size-6 text-accent-dim" />}
              {/* {selectedColor === color && (
                <CheckCircleIcon className="absolute z-10 -top-1 -right-1 size-3 flex items-center justify-center rounded-full text-accent bg-fg-on-accent text-[9px] leading-none" />
              )} */}
            </button>
          ))}
        </div>
      </PadShell>
    )
  }

  return <PadShell mode={mode} className={className} />
}
