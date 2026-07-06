import type { SudokuNumber } from '@shared/sudoku'
import type { Beat } from '../types'

const ACCENT = 'var(--color-accent)'
export const BEAT_MS = 600
const THIRD = 100 / 3
const SVG_NS = 'http://www.w3.org/2000/svg'

const timing = (delay: number): KeyframeAnimationOptions => ({
  duration: BEAT_MS,
  easing: 'ease-in-out',
  fill: 'backwards',
  delay,
})

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

function play(
  cell: HTMLElement,
  el: HTMLElement,
  frames: Keyframe[],
  delay = 0
): Animation {
  cell.appendChild(el)
  const anim = el.animate(frames, timing(delay))
  const clean = () => el.remove()
  anim.finished.then(clean, clean)
  return anim
}

export function highlightValues(
  indices: number[],
  color: string = ACCENT,
  delay = 0
): Beat {
  return (cells) =>
    indices.flatMap((i) => {
      const cell = cells.get(i)
      if (!cell) return []
      const el = overlay({ inset: '15%', backgroundColor: color })
      return [
        play(
          cell,
          el,
          [
            { transform: 'scale(0.6)', opacity: 0 },
            { transform: 'scale(1)', opacity: 0.45 },
            { transform: 'scale(1)', opacity: 0 },
          ],
          delay
        ),
      ]
    })
}

export function drawPolyline(
  squares: number[],
  color: string = ACCENT,
  delay = 0
): Beat {
  return (cells) => {
    const targets = squares
      .map((i) => cells.get(i))
      .filter((cell): cell is HTMLElement => Boolean(cell))
    if (targets.length < 2) return []

    const host =
      (targets[0].offsetParent as HTMLElement | null) ?? targets[0].parentElement
    if (!host) return []
    const hostRect = host.getBoundingClientRect()

    const svg = document.createElementNS(SVG_NS, 'svg')
    svg.setAttribute('aria-hidden', 'true')
    Object.assign(svg.style, {
      position: 'absolute',
      inset: '0',
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      overflow: 'visible',
    })

    const line = document.createElementNS(SVG_NS, 'polyline')
    line.setAttribute(
      'points',
      targets
        .map((cell) => {
          const rect = cell.getBoundingClientRect()
          const x = rect.left + rect.width / 2 - hostRect.left
          const y = rect.top + rect.height / 2 - hostRect.top
          return `${x},${y}`
        })
        .join(' ')
    )
    line.setAttribute('fill', 'none')
    line.setAttribute('stroke', color)
    line.setAttribute('stroke-width', '3')
    line.setAttribute('stroke-linecap', 'round')
    line.setAttribute('stroke-linejoin', 'round')
    svg.appendChild(line)
    host.appendChild(svg)

    const length = line.getTotalLength()
    line.style.strokeDasharray = `${length}`
    line.style.strokeDashoffset = `${length}`
    line.style.opacity = '0'
    const anim = line.animate(
      [
        { strokeDashoffset: length, opacity: 0.9 },
        { strokeDashoffset: 0, opacity: 0.9 },
        { strokeDashoffset: 0, opacity: 0 },
      ],
      timing(delay)
    )
    const clean = () => svg.remove()
    anim.finished.then(clean, clean)
    return [anim]
  }
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
