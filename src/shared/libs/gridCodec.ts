import type { Square, SudokuNumber } from '../components/PlayableGrid/types'

/** Decode an up-to-81-char digit string into a board. '0'/blank = empty. */
export function parseGrid(raw: string): Square[] {
  return Array.from({ length: 81 }, (_, i) => {
    const n = parseInt(raw[i] ?? '0', 10)
    const value = n >= 1 && n <= 9 ? (n as SudokuNumber) : null
    return {
      value,
      notes: new Set<SudokuNumber>(),
      color: null,
      locked: value !== null,
    }
  })
}

/**
 * Encode a board into an 81-digit string (empty cells = '0'). Pencil marks and
 * colors are never serialized.
 * - `initial`: only the locked given squares.
 * - `current`: every filled square.
 */
export function serializeGrid(
  grid: Square[],
  mode: 'initial' | 'current' = 'current'
): string {
  return grid
    .map((sq) => (mode === 'initial' && !sq.locked ? '0' : String(sq.value ?? 0)))
    .join('')
}
