import type { SudokuNumber } from '@shared/sudoku'
import type { Beat } from '../types'

const ACCENT = 'var(--color-accent)'
const TIMING = { duration: 600, easing: 'ease-in-out' } as const
const THIRD = 100 / 3

function overlay(style: Partial<CSSStyleDeclaration>): HTMLElement {
  const el = document.createElement('div')
  el.setAttribute('aria-hidden', 'true')
  Object.assign(el.style, {
    position: 'absolute',
    borderRadius: '9999px',
    backgroundColor: ACCENT,
    pointerEvents: 'none',
    opacity: '0',
    ...style,
  })
  return el
}

function play(cell: HTMLElement, el: HTMLElement, frames: Keyframe[]): Animation {
  cell.appendChild(el)
  const anim = el.animate(frames, TIMING)
  const clean = () => el.remove()
  anim.finished.then(clean, clean)
  return anim
}

export function highlightValues(indices: number[]): Beat {
  return (cells) =>
    indices.flatMap((i) => {
      const cell = cells.get(i)
      if (!cell) return []
      const el = overlay({ inset: '15%' })
      return [
        play(cell, el, [
          { transform: 'scale(0.6)', opacity: 0 },
          { transform: 'scale(1)', opacity: 0.45 },
          { transform: 'scale(1)', opacity: 0 },
        ]),
      ]
    })
}

export function highlightNotes(targets: Record<number, SudokuNumber[]>): Beat {
  return (cells) =>
    Object.entries(targets).flatMap(([key, notes]) => {
      const cell = cells.get(Number(key))
      if (!cell) return []
      return notes.map((n) => {
        const row = Math.floor((n - 1) / 3)
        const col = (n - 1) % 3
        const el = overlay({
          width: '26%',
          height: '26%',
          left: `${(col + 0.5) * THIRD}%`,
          top: `${(row + 0.5) * THIRD}%`,
        })
        return play(cell, el, [
          { transform: 'translate(-50%, -50%) scale(0.4)', opacity: 0 },
          { transform: 'translate(-50%, -50%) scale(1)', opacity: 0.6 },
          { transform: 'translate(-50%, -50%) scale(1)', opacity: 0 },
        ])
      })
    })
}
