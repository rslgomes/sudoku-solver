import { PEERS, getCandidates, type Square, type SudokuNumber } from '@shared/sudoku'
import type { Technique } from '../types'
import type { CellDelta, Scene } from '@features/explain/types'
import { highlightNotes, highlightValues } from '@features/explain/lib/atoms'

const EXPLANATION =
  'Using numbers from {{values|here}} to remove {{notes|notes}} from their peers'

function run(grid: Square[]): Scene | null {
  const sourceCells = new Set<number>()
  const removed: Record<number, SudokuNumber[]> = {}

  for (let i = 0; i < grid.length; i++) {
    const sq = grid[i]
    const candidates = getCandidates(sq)
    if (candidates.size === 0) continue

    const toRemove = new Set<SudokuNumber>()
    for (const peer of PEERS[i]) {
      const value = grid[peer].value
      if (!value || toRemove.has(value)) continue
      if (candidates.has(value)) {
        sourceCells.add(peer)
        toRemove.add(value)
      }
    }
    if (toRemove.size > 0) removed[i] = [...toRemove]
  }

  if (Object.keys(removed).length === 0) return null

  const delta: Record<number, CellDelta> = {}
  for (const [i, notes] of Object.entries(removed)) {
    delta[Number(i)] = { removeNotes: notes }
  }

  return {
    title: 'Clearing Notes',
    explanation: EXPLANATION,
    steps: [
      { beats: [highlightValues([...sourceCells])], cue: 'values' },
      { beats: [highlightNotes(removed)], delta, cue: 'notes' },
    ],
  }
}

const clearNotes: Technique = {
  name: 'Clear Notes',
  run,
}

export default clearNotes
