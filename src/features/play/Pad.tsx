import { cn } from '@shared/libs/cn'
import { SUDOKU_NUMBERS, MODE_LABEL } from './types'
import type { MoveMode } from './types'
import { useController } from './contexts/playControllerContext'
import { useConfig } from './contexts/playSettings'
import { NoSymbolIcon } from '@heroicons/react/24/outline'
import AssistBar from './widgets/AssistBar'
import { PAINT_COLORS } from './colors'
import useRovingTabIndex from '@shared/hooks/useRovingTabIndex'

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
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div className="flex flex-col gap-0.5">
            <span className="font-style text-sm text-accent uppercase tracking-widest">
              {title}
            </span>
            <span className="font-main text-xs text-fg">{hint}</span>
          </div>
          <AssistBar />
        </div>
        <div className="min-h-29">{children}</div>
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
    meta,
  } = useController()
  const { showRemaining } = useConfig()
  const { missingCount } = meta

  const isNumberPad = mode === 'pen' || mode === 'pencil'
  const { containerProps, itemProps } = useRovingTabIndex({
    count: isNumberPad
      ? SUDOKU_NUMBERS.length
      : mode === 'paint'
        ? PAINT_COLORS.length
        : 0,
    columns: isNumberPad ? 3 : PAINT_COLORS.length,
  })

  const rovingButton = (index: number) => {
    const { ref: rovingRef, ...rest } = itemProps(index)
    return {
      ...rest,
      ref: (el: HTMLButtonElement | null) => {
        rovingRef(el)
        return registerInteractive(el)
      },
    }
  }

  if (isNumberPad) {
    return (
      <PadShell mode={mode} className={className}>
        <div
          role="toolbar"
          aria-label="Numbers"
          {...containerProps}
          className="grid grid-cols-3 gap-1 w-full"
        >
          {SUDOKU_NUMBERS.map((n, index) => (
            <button
              key={n}
              {...rovingButton(index)}
              aria-pressed={selectedNumber === n}
              aria-keyshortcuts={String(n)}
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
        <div
          role="toolbar"
          aria-label="Colors"
          {...containerProps}
          className="flex flex-wrap gap-1.5"
        >
          {PAINT_COLORS.map(({ name, value: color }, i) => (
            <button
              key={name}
              {...rovingButton(i)}
              onClick={() => onColor(color)}
              aria-label={name}
              aria-pressed={selectedColor === color}
              aria-keyshortcuts={String(i + 1)}
              title={`${name} (${i + 1})`}
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
            </button>
          ))}
        </div>
      </PadShell>
    )
  }

  return <PadShell mode={mode} className={className} />
}
