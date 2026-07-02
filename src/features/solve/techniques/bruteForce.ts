// Constraint propagation + MRV search, after Peter Norvig,
// "Solving Every Sudoku Puzzle" (https://norvig.com/sudoku.html).
import {
  PEERS,
  UNITS,
  SUDOKU_NUMBERS,
  type Square,
  type SudokuNumber,
} from '@shared/sudoku'
import type { Technique } from '../types'
import type { CellDelta, Scene, SceneStep } from '@features/explain/types'

type Candidates = Set<SudokuNumber>[]

function eliminate(
  boardCandidates: Candidates,
  squareIdx: number,
  value: SudokuNumber
): boolean {
  const candidates = boardCandidates[squareIdx]
  if (!candidates.has(value)) return true
  candidates.delete(value)

  if (candidates.size === 0) return false

  if (candidates.size === 1) {
    const [soleCandidate] = candidates
    for (const peerIdx of PEERS[squareIdx]) {
      if (!eliminate(boardCandidates, peerIdx, soleCandidate)) return false
    }
  }

  for (const unit of UNITS[squareIdx]) {
    const homesForValue = unit.filter((cell) => boardCandidates[cell].has(value))
    if (homesForValue.length === 0) return false
    if (homesForValue.length === 1 && boardCandidates[homesForValue[0]].size > 1) {
      if (!assign(boardCandidates, homesForValue[0], value)) return false
    }
  }

  return true
}

function assign(
  boardCandidates: Candidates,
  squareIdx: number,
  value: SudokuNumber
): boolean {
  for (const otherCandidate of [...boardCandidates[squareIdx]]) {
    if (otherCandidate === value) continue
    if (!eliminate(boardCandidates, squareIdx, otherCandidate)) return false
  }
  return true
}

function seedFromGivens(grid: Square[]): Candidates | null {
  const boardCandidates: Candidates = Array.from(
    { length: 81 },
    () => new Set(SUDOKU_NUMBERS)
  )
  for (let squareIdx = 0; squareIdx < 81; squareIdx++) {
    const givenValue = grid[squareIdx].value
    if (givenValue && !assign(boardCandidates, squareIdx, givenValue)) return null
  }
  return boardCandidates
}

const isSolved = (boardCandidates: Candidates) =>
  boardCandidates.every((candidates) => candidates.size === 1)

const cloneCandidates = (boardCandidates: Candidates): Candidates =>
  boardCandidates.map((candidates) => new Set(candidates))

function mostConstrainedSquare(boardCandidates: Candidates): number {
  let bestIdx = -1
  let fewestCandidates = 10
  for (let squareIdx = 0; squareIdx < 81; squareIdx++) {
    const candidateCount = boardCandidates[squareIdx].size
    if (candidateCount > 1 && candidateCount < fewestCandidates) {
      bestIdx = squareIdx
      fewestCandidates = candidateCount
      if (candidateCount === 2) break
    }
  }
  return bestIdx
}

function newlyPlaced(
  before: Candidates,
  after: Candidates
): Record<number, CellDelta> {
  const delta: Record<number, CellDelta> = {}
  for (let squareIdx = 0; squareIdx < 81; squareIdx++) {
    if (before[squareIdx].size > 1 && after[squareIdx].size === 1) {
      const [value] = after[squareIdx]
      delta[squareIdx] = { setValue: value }
    }
  }
  return delta
}

function search(boardCandidates: Candidates): SceneStep[] | null {
  if (isSolved(boardCandidates)) return []

  const guessSquare = mostConstrainedSquare(boardCandidates)
  for (const guessValue of boardCandidates[guessSquare]) {
    const branch = cloneCandidates(boardCandidates)
    if (!assign(branch, guessSquare, guessValue)) continue

    const remainingSteps = search(branch)
    if (remainingSteps) {
      const delta = newlyPlaced(boardCandidates, branch)
      return [{ beats: [], delta }, ...remainingSteps]
    }
  }
  return null
}

function run(grid: Square[]): Scene | null {
  const boardCandidates = seedFromGivens(grid)
  if (!boardCandidates) return null

  const steps: SceneStep[] = []

  const forcedByGivens: Record<number, CellDelta> = {}
  for (let squareIdx = 0; squareIdx < 81; squareIdx++) {
    if (!grid[squareIdx].value && boardCandidates[squareIdx].size === 1) {
      const [value] = boardCandidates[squareIdx]
      forcedByGivens[squareIdx] = { setValue: value }
    }
  }
  if (Object.keys(forcedByGivens).length > 0)
    steps.push({ beats: [], delta: forcedByGivens })

  const remainingSteps = search(boardCandidates)
  if (!remainingSteps) return null
  steps.push(...remainingSteps)

  if (steps.length === 0) return null

  return {
    title: 'Brute force',
    explanation:
      'No known technique applies. Guess the most constrained cell, propagate forced values, and backtrack on contradiction.',
    steps,
  }
}

const bruteForce: Technique = {
  name: 'Brute force',
  run,
}

export default bruteForce
