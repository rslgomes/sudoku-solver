import { GRID_SIZE } from './types'

const getUnits = (sqIdx: number): number[][] => {
  const row = Math.floor(sqIdx / GRID_SIZE)
  const col = sqIdx % GRID_SIZE
  const boxStart = Math.floor(row / 3) * 27 + Math.floor(col / 3) * 3

  return [
    Array.from({ length: GRID_SIZE }, (_, k) => row * GRID_SIZE + k),
    Array.from({ length: GRID_SIZE }, (_, k) => k * GRID_SIZE + col),
    Array.from(
      { length: GRID_SIZE },
      (_, k) => boxStart + (k % 3) + GRID_SIZE * Math.floor(k / 3)
    ),
  ]
}

export const UNITS = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) =>
  getUnits(i)
)

export type UnitKind = 'row' | 'column' | 'box'

export type Unit = {
  kind: UnitKind
  position: number
  squares: number[]
}

export const ALL_UNITS: Unit[] = [
  ...Array.from({ length: GRID_SIZE }, (_, row): Unit => ({
    kind: 'row',
    position: row + 1,
    squares: UNITS[row * GRID_SIZE][0],
  })),
  ...Array.from({ length: GRID_SIZE }, (_, col): Unit => ({
    kind: 'column',
    position: col + 1,
    squares: UNITS[col][1],
  })),
  ...Array.from({ length: GRID_SIZE }, (_, box): Unit => ({
    kind: 'box',
    position: box + 1,
    squares: UNITS[Math.floor(box / 3) * 27 + (box % 3) * 3][2],
  })),
]

export const unitLabel = (unit: Unit) => `${unit.kind} ${unit.position}`
