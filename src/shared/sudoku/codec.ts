import { GRID_SIZE, type Square, type SudokuNumber } from './types'

export function parseGrid(raw: string): Square[] {
  return Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => {
    const n = parseInt(raw[i] ?? '0', 10)
    const value = n >= 1 && n <= GRID_SIZE ? (n as SudokuNumber) : null
    return {
      value,
      notes: new Set<SudokuNumber>(),
      color: null,
      locked: value !== null,
    }
  })
}

export function serializeGrid(
  grid: Square[],
  mode: 'initial' | 'current' = 'current'
): string {
  return grid
    .map((sq) =>
      mode === 'initial' && !sq.locked ? '0' : String(sq.value ?? 0)
    )
    .join('')
}

export function squareName(idx: number) {
  return `R${Math.floor(idx / GRID_SIZE) + 1}C${(idx % GRID_SIZE) + 1}`
}
