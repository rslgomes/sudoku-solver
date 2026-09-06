import type { Square } from '@shared/sudoku'
import type { Scene, SceneStep, Solution } from '@features/explain/types'
import {
  checkEmptySquares,
  clearNotes,
  hiddenSingle,
  bruteForce,
  nakedSingle,
  lockedCandidates,
  subsets,
  fishes,
} from './techniques'
import wings from './techniques/wings'

const TECHNIQUES = [
  checkEmptySquares,
  clearNotes,
  nakedSingle,
  hiddenSingle,
  lockedCandidates,
  subsets,
  fishes,
  wings,
  bruteForce,
]

const isSolved = (board: Square[]) => board.every((sq) => sq.value !== null)

const sameBoard = (a: Square[], b: Square[]) =>
  a.every(
    (sq, i) =>
      sq.value === b[i].value &&
      sq.notes.size === b[i].notes.size &&
      [...sq.notes].every((n) => b[i].notes.has(n))
  )

export function applySteps(board: Square[], steps: SceneStep[]): Square[] {
  const next = board.map((sq) => ({ ...sq, notes: new Set(sq.notes) }))
  for (const step of steps) {
    for (const [key, delta] of Object.entries(step.delta ?? {})) {
      const sq = next[Number(key)]
      if (delta.setValue) sq.value = delta.setValue
      if (delta.addNotes) for (const n of delta.addNotes) sq.notes.add(n)
      if (delta.removeNotes)
        for (const n of delta.removeNotes) sq.notes.delete(n)
    }
  }
  return next
}

export function solve(initial: Square[]): Solution {
  let board = initial
  const scenes: Scene[] = []
  outer: while (!isSolved(board)) {
    for (const t of TECHNIQUES) {
      const scene = t.run(board)
      if (scene) {
        scenes.push(scene)
        const next = applySteps(board, scene.steps)
        if (sameBoard(board, next)) break outer
        board = next
        continue outer
      }
    }
    break
  }

  return { initial, scenes }
}
