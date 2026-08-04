const getUnits = (sqIdx: number): number[][] => {
  const row = Math.floor(sqIdx / 9)
  const col = sqIdx % 9
  const boxStart = Math.floor(row / 3) * 27 + Math.floor(col / 3) * 3

  return [
    Array.from({ length: 9 }, (_, k) => row * 9 + k),
    Array.from({ length: 9 }, (_, k) => k * 9 + col),
    Array.from({ length: 9 }, (_, k) => boxStart + (k % 3) + 9 * Math.floor(k / 3)),
  ]
}

export const UNITS = Array.from({ length: 81 }, (_, i) => getUnits(i))

export type UnitKind = 'row' | 'column' | 'box'

export type Unit = {
  kind: UnitKind
  position: number
  squares: number[]
}

export const ALL_UNITS: Unit[] = [
  ...Array.from({ length: 9 }, (_, row): Unit => ({
    kind: 'row',
    position: row + 1,
    squares: UNITS[row * 9][0],
  })),
  ...Array.from({ length: 9 }, (_, col): Unit => ({
    kind: 'column',
    position: col + 1,
    squares: UNITS[col][1],
  })),
  ...Array.from({ length: 9 }, (_, box): Unit => ({
    kind: 'box',
    position: box + 1,
    squares: UNITS[Math.floor(box / 3) * 27 + (box % 3) * 3][2],
  })),
]

export const unitLabel = (unit: Unit) => `${unit.kind} ${unit.position}`
