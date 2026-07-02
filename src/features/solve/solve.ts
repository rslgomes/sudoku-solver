import type { Square } from '@shared/sudoku'
import clearNotes from './techniques/clearNotes'
import bruteForce from './techniques/bruteForce'
import type { Scene, SceneStep, Solution } from '@features/explain/types'

const TECHNIQUES = [clearNotes, bruteForce]

const isSolved = (board: Square[]) => board.every((sq) => sq.value !== null)

export function applySteps(board: Square[], steps: SceneStep[]): Square[] {
  const next = board.map((sq) => ({ ...sq, notes: new Set(sq.notes) }))
  for (const step of steps) {
    for (const [key, delta] of Object.entries(step.delta ?? {})) {
      const sq = next[Number(key)]
      if (delta.setValue) sq.value = delta.setValue
      if (delta.addNotes) for (const n of delta.addNotes) sq.notes.add(n)
      if (delta.removeNotes) for (const n of delta.removeNotes) sq.notes.delete(n)
    }
  }
  return next
}

const applyDeltas = (board: Square[], scene: Scene): Square[] =>
  applySteps(board, scene.steps)

export function solve(initial: Square[]): Solution {
  let board = initial
  const scenes: Scene[] = []
  outer: while (!isSolved(board)) {
    for (const t of TECHNIQUES) {
      const scene = t.run(board)
      if (scene) {
        scenes.push(scene)
        board = applyDeltas(board, scene)
        continue outer
      }
    }
    break
  }

  return { initial, scenes }
}
