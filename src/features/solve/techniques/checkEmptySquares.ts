import { highlightValues } from '@features/explain/lib/atoms'
import type { Scene } from '@features/explain/types'
import { squareName, type Square } from '@shared/sudoku'
import type { Technique } from '../types'

const STRANDED_CUE = 'stranded'
const RED = 'var(--color-red)'

function findStranded(grid: Square[]): number[] {
  const stranded: number[] = []
  for (let i = 0; i < grid.length; i++) {
    const sq = grid[i]
    if (!sq.value && sq.notes.size === 0) stranded.push(i)
  }
  return stranded
}

function toScene(stranded: number[]): Scene {
  const names = stranded.map(squareName)
  const subject =
    stranded.length === 1
      ? `{{${STRANDED_CUE}|${names[0]}}} holds no number and has no notes left`
      : `{{${STRANDED_CUE}|${stranded.length} squares}} hold no number and have no notes left`

  return {
    title: 'Unsolvable',
    explanation: [
      `${subject} — nothing can be written there, so this puzzle has no solution.`,
      ...(stranded.length > 1 ? [names.join(', ')] : []),
    ].join('\n'),
    steps: [
      {
        beats: [highlightValues(stranded, RED)],
        cue: STRANDED_CUE,
        note: `Dead end at ${names.join(', ')}`,
      },
    ],
  }
}

function run(grid: Square[]): Scene | null {
  const stranded = findStranded(grid)
  return stranded.length > 0 ? toScene(stranded) : null
}

const checkEmptySquares: Technique = {
  name: 'Check Empty Squares',
  run,
}

export default checkEmptySquares
