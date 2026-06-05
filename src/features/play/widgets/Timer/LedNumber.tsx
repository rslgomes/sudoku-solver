import { memo, type CSSProperties } from 'react'

/* Segment indices
 *
 *    ___0___
 *   |       |
 *   1       2
 *   |___3___|
 *   |       |
 *   4       5
 *   |___6___|
 */
type DIGIT = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
type LED = 0 | 1 | 2 | 3 | 4 | 5 | 6

const DIGIT_TO_LEDS: Record<DIGIT, LED[]> = {
  0: [0, 1, 2, 4, 5, 6],
  1: [2, 5],
  2: [0, 2, 3, 4, 6],
  3: [0, 2, 3, 5, 6],
  4: [1, 2, 3, 5],
  5: [0, 1, 3, 5, 6],
  6: [0, 1, 3, 4, 5, 6],
  7: [0, 2, 5],
  8: [0, 1, 2, 3, 4, 5, 6],
  9: [0, 1, 2, 3, 5, 6],
}

// Single segment
const T = 10 // semi-thickness
const L = 100 // length

// SVG canvas
const S = 10 // spacing
const W = L + 2 * T + 2 * S // width
const H = 2 * L + 2 * T + 4 * S // height

const ALL_LEDS: LED[] = [0, 1, 2, 3, 4, 5, 6]
const STARTING_POINTS: Record<LED, InitialCoordinates> = {
  0: { x0: T + S, y0: T },
  1: { x0: T, y0: T + S },
  2: { x0: W - T, y0: T + S },
  3: { x0: T + S, y0: T + 2 * S + L },
  4: { x0: T, y0: H - T - L - S },
  5: { x0: W - T, y0: H - T - L - S },
  6: { x0: T + S, y0: H - T },
}

type InitialCoordinates = {
  x0: number
  y0: number
}
function horizontal({ x0, y0 }: InitialCoordinates): string {
  /* Polygon vertices (draw order)
   *
   *      1 __________ 2        (y = y0 + T)
   *     /              \
   *    0                3      (y = y0)
   *     \             /
   *      5 _________ 4         (y = y0 - T)
   *
   *   (x0)  (T)  (x0+L-T)  (x0+L)
   */

  const lB = x0 // left bound
  const rB = x0 + L // right bound

  const tB = y0 + T // top bound
  const m = y0 // middle
  const bB = y0 - T // bottom bound

  const coordinates = [
    `${lB},${m}`,
    `${lB + T},${tB}`,
    `${rB - T},${tB}`,
    `${rB},${m}`,
    `${rB - T},${bB}`,
    `${lB + T},${bB}`,
  ]

  return coordinates.join(' ')
}

function vertical({ x0, y0 }: InitialCoordinates): string {
  /* Polygon vertices (draw order)
   *
   *         3             (y0 + L)
   *       /   \
   *      2     4          (y0 + L - T)
   *      |     |
   *      1     5          (y0 + T)
   *       \   /
   *         0             (y0)
   *
   *   (x0-T)  (x0)  (x0+W-T)
   */

  const lB = x0 - T // left bound
  const m = x0 // middle
  const rB = x0 + T // right bound

  const tB = y0 + L // top bound
  const bB = y0 // bottom bound

  const coordinates = [
    `${m},${bB}`,
    `${lB},${bB + T}`,
    `${lB},${tB - T}`,
    `${m},${tB}`,
    `${rB},${tB - T}`,
    `${rB},${bB + T}`,
  ]

  return coordinates.join(' ')
}

const DIRECTIONS: Record<LED, ({ x0, y0 }: InitialCoordinates) => string> = {
  0: horizontal,
  1: vertical,
  2: vertical,
  3: horizontal,
  4: vertical,
  5: vertical,
  6: horizontal,
}

const SEGMENT_POINTS: string[] = ALL_LEDS.map((led) =>
  DIRECTIONS[led](STARTING_POINTS[led])
)

function LedNumber({
  number,
  colors,
  className,
}: {
  number: DIGIT
  colors: { on: string; off: string }
  className?: string
}) {
  const lits = new Set(DIGIT_TO_LEDS[number])
  const colorOn = colors?.on ?? '#ff3b30'
  const colorOff = colors?.off ?? '#3a0d0b'
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={className}
      style={
        {
          filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.4))',
          '--led-on': colorOn,
          '--led-off': colorOff,
        } as CSSProperties
      }
    >
      {ALL_LEDS.map((led) => {
        const on = lits.has(led)
        return (
          <polygon
            key={led}
            points={SEGMENT_POINTS[led]}
            className={`transition-[fill,filter] duration-120 ease-linear ${
              on
                ? 'fill-(--led-on) drop-shadow-[0_0_6px_var(--led-on)]'
                : 'fill-(--led-off) drop-shadow-none'
            }`}
          />
        )
      })}
    </svg>
  )
}

export default memo(LedNumber)
export { DIGIT_TO_LEDS, type DIGIT, type LED }
