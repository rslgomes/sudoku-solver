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
