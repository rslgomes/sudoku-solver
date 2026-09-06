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

type Anchor = { x: number; y: number }

function anchors(
  cells: Map<number, HTMLElement>,
  squares: number[]
): { host: HTMLElement; points: Anchor[] } | null {
  const targets = squares
    .map((i) => cells.get(i))
    .filter((cell): cell is HTMLElement => Boolean(cell))
  if (targets.length < 2) return null

  const host =
    (targets[0].offsetParent as HTMLElement | null) ?? targets[0].parentElement
  if (!host) return null

  const hostRect = host.getBoundingClientRect()
  const points = targets.map((cell) => {
    const rect = cell.getBoundingClientRect()
    return {
      x: rect.left + rect.width / 2 - hostRect.left,
      y: rect.top + rect.height / 2 - hostRect.top,
    }
  })
  return { host, points }
}

function strokeLayer(host: HTMLElement): SVGSVGElement {
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
  host.appendChild(svg)
  return svg
}

function stroke(shape: SVGGeometryElement, color: string) {
  shape.setAttribute('fill', 'none')
  shape.setAttribute('stroke', color)
  shape.setAttribute('stroke-width', '3')
  shape.setAttribute('stroke-linecap', 'round')
  shape.setAttribute('stroke-linejoin', 'round')
}

function sweep(shape: SVGGeometryElement, delay: number): Animation {
  const length = shape.getTotalLength()
  shape.style.strokeDasharray = `${length}`
  shape.style.strokeDashoffset = `${length}`
  shape.style.opacity = '0'
  return shape.animate(
    [
      { strokeDashoffset: length, opacity: 0.9 },
      { strokeDashoffset: 0, opacity: 0.9 },
      { strokeDashoffset: 0, opacity: 0 },
    ],
    timing(delay)
  )
}

function discardWhenDone(svg: SVGSVGElement, anims: Animation[]) {
  Promise.allSettled(anims.map((anim) => anim.finished)).then(() => svg.remove())
}

export function highlightValues(
  indices: number[],
  color: string = ACCENT,
  delay = 0
): Beat {
  return { kind: 'highlightValues', indices, color, delay }
}

export function drawPolyline(
  squares: number[],
  color: string = ACCENT,
  delay = 0
): Beat {
  return { kind: 'drawPolyline', squares, color, delay }
}

export function drawFan(
  origin: number,
  targets: number[],
  color: string = ACCENT,
  delay = 0
): Beat {
  return { kind: 'drawFan', origin, targets, color, delay }
}

export function highlightNotes(
  targets: Record<number, SudokuNumber[]>,
  color: string = ACCENT,
  delay = 0
): Beat {
  return { kind: 'highlightNotes', targets, color, delay }
}

function runHighlightValues(
  cells: Map<number, HTMLElement>,
  indices: number[],
  color: string,
  delay: number
): Animation[] {
  return indices.flatMap((i) => {
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

function runDrawPolyline(
  cells: Map<number, HTMLElement>,
  squares: number[],
  color: string,
  delay: number
): Animation[] {
  const layout = anchors(cells, squares)
  if (!layout) return []

  const svg = strokeLayer(layout.host)
  const line = document.createElementNS(SVG_NS, 'polyline')
  line.setAttribute(
    'points',
    layout.points.map((point) => `${point.x},${point.y}`).join(' ')
  )
  stroke(line, color)
  svg.appendChild(line)

  const anims = [sweep(line, delay)]
  discardWhenDone(svg, anims)
  return anims
}

function runDrawFan(
  cells: Map<number, HTMLElement>,
  origin: number,
  targets: number[],
  color: string,
  delay: number
): Animation[] {
  const layout = anchors(cells, [origin, ...targets])
  if (!layout) return []

  const [center, ...spokes] = layout.points
  const svg = strokeLayer(layout.host)
  const anims = spokes.map((spoke) => {
    const line = document.createElementNS(SVG_NS, 'line')
    line.setAttribute('x1', `${center.x}`)
    line.setAttribute('y1', `${center.y}`)
    line.setAttribute('x2', `${spoke.x}`)
    line.setAttribute('y2', `${spoke.y}`)
    stroke(line, color)
    svg.appendChild(line)
    return sweep(line, delay)
  })

  discardWhenDone(svg, anims)
  return anims
}

function runHighlightNotes(
  cells: Map<number, HTMLElement>,
  targets: Record<number, SudokuNumber[]>,
  color: string,
  delay: number
): Animation[] {
  return Object.entries(targets).flatMap(([key, notes]) => {
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
        backgroundColor: color,
      })
      return play(
        cell,
        el,
        [
          { transform: 'translate(-50%, -50%) scale(0.4)', opacity: 0 },
          { transform: 'translate(-50%, -50%) scale(1)', opacity: 0.6 },
          { transform: 'translate(-50%, -50%) scale(1)', opacity: 0 },
        ],
        delay
      )
    })
  })
}

export function runBeat(
  beat: Beat,
  cells: Map<number, HTMLElement>
): Animation[] {
  const color = beat.color ?? ACCENT
  const delay = beat.delay ?? 0
  switch (beat.kind) {
    case 'highlightValues':
      return runHighlightValues(cells, beat.indices, color, delay)
    case 'highlightNotes':
      return runHighlightNotes(cells, beat.targets, color, delay)
    case 'drawPolyline':
      return runDrawPolyline(cells, beat.squares, color, delay)
    case 'drawFan':
      return runDrawFan(cells, beat.origin, beat.targets, color, delay)
  }
}
