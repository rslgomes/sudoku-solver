import { useRef } from 'react'
import { cn } from '@shared/libs/cn'
import Button from '@shared/ui/Button'

type PuzzleInputProps = {
  className?: string
  onSubmit: (raw: string) => void
}

export default function PuzzleInput({ className, onSubmit }: PuzzleInputProps) {
  const gridRef = useRef<Map<number, HTMLInputElement>>(new Map())

  const handleInputKeyDown = (e: React.KeyboardEvent, index: number) => {
    const moves: Partial<Record<string, number>> = {
      ArrowRight: 1,
      ArrowLeft: -1,
      ArrowUp: -9,
      ArrowDown: 9,
    }
    const isBlocked: Partial<Record<string, boolean>> = {
      ArrowRight: index % 9 === 8,
      ArrowLeft: index % 9 === 0,
      ArrowUp: index < 9,
      ArrowDown: index > 71,
    }

    const delta = moves[e.key]
    if (delta !== undefined) {
      e.preventDefault()
      if (isBlocked[e.key]) return

      const next = index + delta
      const nextEl = gridRef.current.get(next)
      if (!nextEl) return

      gridRef.current.get(index)!.tabIndex = -1
      nextEl.tabIndex = 0
      nextEl.focus()
      return
    }

    if (/^[1-9]$/.test(e.key)) {
      e.preventDefault()
      const el = gridRef.current.get(index)!
      el.value = e.key

      const next = gridRef.current.get(index + 1)
      if (!next) return

      el.tabIndex = -1
      next.tabIndex = 0
      next.focus()
      return
    }

    if (e.key === 'Backspace') {
      e.preventDefault()
      const el = gridRef.current.get(index)!
      el.value = ''

      const prev = gridRef.current.get(index - 1)
      if (!prev) return

      el.tabIndex = -1
      prev.tabIndex = 0
      prev.focus()
    }

    if (e.key === ' ' || e.key === '0') {
      e.preventDefault()
      const el = gridRef.current.get(index)!
      el.value = ''

      const next = gridRef.current.get(index + 1)
      if (!next) return

      el.tabIndex = -1
      next.tabIndex = 0
      next.focus()
    }
  }

  const handleClear = () => {
    for (const el of gridRef.current.values()) {
      el.value = ''
      el.tabIndex = -1
    }
    gridRef.current.get(0)!.tabIndex = 0
    gridRef.current.get(0)!.focus()
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault()
    const digits = e.clipboardData.getData('text').replace(/[^0-9]/g, '')
    if (!digits.length) return

    let startIdx = 0
    for (const [idx, el] of gridRef.current.entries()) {
      if (el === document.activeElement) {
        startIdx = idx
        break
      }
    }

    for (let i = 0; i < digits.length && startIdx + i < 81; i++) {
      const el = gridRef.current.get(startIdx + i)
      if (el) el.value = digits[i] === '0' ? '' : digits[i]
    }

    const lastIdx = Math.min(startIdx + digits.length - 1, 80)
    for (const el of gridRef.current.values()) el.tabIndex = -1
    const lastEl = gridRef.current.get(lastIdx)
    if (lastEl) {
      lastEl.tabIndex = 0
      lastEl.focus()
    }
  }

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    const raw = Array.from(
      { length: 81 },
      (_, i) => gridRef.current.get(i)?.value || '0'
    ).join('')
    onSubmit(raw)
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div
        role="grid"
        aria-label="Sudoku puzzle input"
        aria-rowcount={9}
        aria-colcount={9}
        className="w-full aspect-square flex flex-col gap-px p-0.5 bg-blue"
        onPaste={handlePaste}
      >
        {Array.from({ length: 9 }).map((_, row) => (
          <div
            key={row}
            role="row"
            className={cn(
              'grid grid-cols-9 gap-px flex-1 min-h-0',
              row !== 0 && row % 3 === 0 && 'mt-0.5'
            )}
          >
            {Array.from({ length: 9 }).map((_, col) => {
              const idx = row * 9 + col
              return (
                <div
                  key={idx}
                  role="gridcell"
                  aria-rowindex={row + 1}
                  aria-colindex={col + 1}
                  className={cn(
                    'relative bg-bg-widget min-w-5',
                    col !== 0 && col % 3 === 0 && 'ml-0.5'
                  )}
                >
                  <input
                    ref={(el) => {
                      if (el) gridRef.current.set(idx, el)
                      else gridRef.current.delete(idx)
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    tabIndex={idx === 0 ? 0 : -1}
                    onKeyDown={(e) => handleInputKeyDown(e, idx)}
                    className="absolute inset-0 w-full h-full text-center text-fg"
                  />
                </div>
              )
            })}
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-4">
        <Button type="button" onClick={handleClear} className="font-semibold">
          Clear
        </Button>
        <Button type="submit" className="font-semibold">
          Load
        </Button>
      </div>
    </form>
  )
}
