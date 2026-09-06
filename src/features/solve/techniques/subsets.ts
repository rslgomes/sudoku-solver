import { highlightNotes, highlightValues } from '@features/explain/lib/atoms'
import type { CellDelta, Scene, SceneStep } from '@features/explain/types'
import {
  ALL_UNITS,
  getCandidates,
  squareName,
  unitLabel,
  type Square,
  type SudokuNumber,
  type Unit,
} from '@shared/sudoku'
import type { Technique } from '../types'

const SUBSET_SIZES = [2, 3, 4] as const
type SubsetSize = (typeof SUBSET_SIZES)[number]

type Subset = {
  kind: 'naked' | 'hidden'
  size: SubsetSize
  unit: Unit
  squares: Set<number>
  values: Set<SudokuNumber>
}

type UnitMatrix = {
  unit: Unit
  matrix: bigint
  squares: number[]
  candidates: SudokuNumber[]
  size: number
}

function buildMatrix(grid: Square[], unit: Unit): UnitMatrix {
  const unsolvedSquares = unit.squares.filter((idx) => !grid[idx].value)
  const size = unsolvedSquares.length
  if (size === 0)
    return { unit, matrix: 0n, squares: [], candidates: [], size: 0 }

  const candidatesSet = new Set<SudokuNumber>()
  for (const square of unsolvedSquares)
    for (const note of grid[square].notes) candidatesSet.add(note)

  const candidates = [...candidatesSet].sort((a, b) => a - b)

  const candidateCols = new Map(candidates.map((c, i) => [c, i]))

  let matrix = 0n
  for (let row = 0; row < size; row++) {
    const { notes } = grid[unsolvedSquares[row]]
    for (const note of notes) {
      const col = candidateCols.get(note)
      if (col === undefined) continue
      matrix |= 1n << BigInt(row * size + col)
    }
  }

  return { unit, matrix, squares: unsolvedSquares, candidates, size }
}

function getSquareCandidates(
  matrix: bigint,
  sqIndex: number,
  size: number
): number {
  let mask = 0
  const offset = BigInt(sqIndex * size)
  for (let col = 0; col < size; col++)
    if (matrix & (1n << (offset + BigInt(col)))) mask |= 1 << col
  return mask
}

function getCandidateSquares(
  matrix: bigint,
  candIndex: number,
  size: number
): number {
  let mask = 0
  const candidateCol = BigInt(candIndex)
  const stride = BigInt(size)
  for (let row = 0; row < size; row++)
    if (matrix & (1n << (BigInt(row) * stride + candidateCol))) mask |= 1 << row

  return mask
}

function countOnes(bitmap: number): number {
  let count = 0
  for (let bm = bitmap; bm; bm &= bm - 1) count++
  return count
}

function maskToIndices(mask: number): number[] {
  const indices = []
  for (let i = 0; mask >> i; i++) if (mask & (1 << i)) indices.push(i)
  return indices
}

function mergeMasks(
  indices: number[],
  fetcher: (idx: number) => number
): number {
  let union = 0
  for (const idx of indices) union |= fetcher(idx)
  return union
}

/**
 * Naked pair: 
 * 2 and 3 are confined to the first two squares, so they can be
 * eliminated from the remaining squares.
 *  ______ ______ ______ ______ ______
 * |   2 3|   2 3|   2  | 1   3| 1 2 3|
 * |      |      | 4 5  |   5  |   5  |
 * |______|______|______|______|______|
 * 
 * Hidden pair:
 * 2 and 3 only appear in the first two squares, so every other candidate
 * can be removed from those squares.
 *  ______ ______ ______ ______ ______
 * | 1 2 3|   2 3| 1    | 1    |      |
 * |      | 4 5  |   5  | 4   6| 4 5 6|
 * |______|______|______|______|______|

 * Naked and hidden subsets are the same relationship viewed in opposite
 * directions.
 *
 * For a naked subset, start with squares and find the candidate digits
 * shared between them.
 *
 * For a hidden subset, start with candidate digits and find the squares
 * they are confined to.
 *
 * In either direction, a subset exists when k selected indices connect to
 * exactly k indices on the opposite axis. If those locked indices cover
 * anything beyond the original k, there is a candidate to eliminate.
 **/
function checkSubsetMatch(
  data: UnitMatrix,
  combination: number[],
  subsetSize: SubsetSize,
  kind: Subset['kind']
): { squares: Set<number>; values: Set<SudokuNumber> } | null {
  const { matrix, squares, candidates, size } = data
  const isNaked = kind === 'naked'

  const matchFetcher = (idx: number) =>
    isNaked
      ? getSquareCandidates(matrix, idx, size)
      : getCandidateSquares(matrix, idx, size)

  const toRemoveFetcher = (idx: number) =>
    isNaked
      ? getCandidateSquares(matrix, idx, size)
      : getSquareCandidates(matrix, idx, size)

  const lockedMask = mergeMasks(combination, matchFetcher)
  if (countOnes(lockedMask) !== subsetSize) return null

  const lockedIndices = maskToIndices(lockedMask)
  const toRemoveMask = mergeMasks(lockedIndices, toRemoveFetcher)
  if (countOnes(toRemoveMask) <= subsetSize) return null

  const squareIndices = isNaked ? combination : lockedIndices
  const candidateIndices = isNaked ? lockedIndices : combination

  return {
    squares: new Set(squareIndices.map((idx) => squares[idx])),
    values: new Set(candidateIndices.map((idx) => candidates[idx])),
  }
}

function combinations(n: number, k: number): number[][] {
  const out: number[][] = []
  function checkAndIterate(start: number, current: number[]) {
    if (current.length === k) return out.push([...current])

    for (let i = start; i < n; i++) {
      current.push(i)
      checkAndIterate(i + 1, current)
      current.pop()
    }
  }
  checkAndIterate(0, [])
  return out
}

function findSubset(grid: Square[]): Subset | null {
  const unitData = ALL_UNITS.map((unit) => buildMatrix(grid, unit)).filter(
    (u) => u.size >= 4
    // 3 or less candidates units are resolved by hidden single/naked single
  )

  for (const size of SUBSET_SIZES) {
    let firstHidden: Subset | null = null

    for (const data of unitData) {
      const maxAllowedSize = Math.floor(data.size / 2)
      if (size > maxAllowedSize) continue

      const combs = combinations(data.size, size)

      for (const comb of combs) {
        const nakedMatch = checkSubsetMatch(data, comb, size, 'naked')
        if (nakedMatch)
          return { kind: 'naked', size, unit: data.unit, ...nakedMatch }

        if (firstHidden) continue
        const hiddenMatch = checkSubsetMatch(data, comb, size, 'hidden')
        if (hiddenMatch)
          firstHidden = {
            kind: 'hidden',
            size,
            unit: data.unit,
            ...hiddenMatch,
          }
      }
    }
    if (firstHidden) return firstHidden
  }
  return null
}

const SUBSET_NAMES = { 2: 'pair', 3: 'triple', 4: 'quad' }
const HOLD_CUE = 'hold'
const CLEARED_CUE = 'cleared'

const squareNames = (indices: Iterable<number>) =>
  [...indices].map(squareName).join(', ')

const valueList = (values: Iterable<SudokuNumber>) =>
  [...values].sort((a, b) => a - b).join(', ')

function collectRemovals(
  grid: Square[],
  match: Subset
): Record<number, SudokuNumber[]> {
  const removals: Record<number, SudokuNumber[]> = {}

  if (match.kind === 'naked') {
    for (const index of match.unit.squares) {
      if (match.squares.has(index)) continue
      const toRemove = [...match.values].filter((v) =>
        getCandidates(grid[index]).has(v)
      )
      if (toRemove.length > 0) removals[index] = toRemove
    }
  } else {
    for (const index of match.squares) {
      const toRemove = [...getCandidates(grid[index])].filter(
        (v) => !match.values.has(v)
      )
      if (toRemove.length > 0) removals[index] = toRemove
    }
  }

  return removals
}

function headline(match: Subset, removedCount: number): string {
  const name = SUBSET_NAMES[match.size]
  const where = unitLabel(match.unit)
  const squares = `{{${HOLD_CUE}|${squareNames(match.squares)}}}`
  const values = valueList(match.values)
  const cleared = `{{${CLEARED_CUE}|${removedCount} candidate${removedCount === 1 ? '' : 's'}}}`

  return match.kind === 'naked'
    ? `In ${where}, ${squares} can only be ${values} between them — a naked ${name}. Since no other square needs those digits, ${cleared} sweep away everywhere else in ${where}.`
    : `In ${where}, ${values} only fit inside ${squares} — a hidden ${name}. Nothing else survives there, so ${cleared} clear out.`
}

function toScene(grid: Square[], match: Subset): Scene | null {
  const removals = collectRemovals(grid, match)
  const removedCount = Object.values(removals).reduce(
    (sum, notes) => sum + notes.length,
    0
  )
  if (removedCount === 0) return null

  const delta: Record<number, CellDelta> = {}
  for (const [index, notes] of Object.entries(removals))
    delta[Number(index)] = { removeNotes: notes }

  const steps: SceneStep[] = [
    {
      beats: [highlightValues([...match.squares])],
      cue: HOLD_CUE,
      note:
        match.kind === 'naked'
          ? `${squareNames(match.squares)} hold only ${valueList(match.values)} between them`
          : `${valueList(match.values)} confined to ${squareNames(match.squares)}`,
    },
    {
      beats: [highlightNotes(removals)],
      cue: CLEARED_CUE,
      note: `${removedCount} candidate${removedCount === 1 ? '' : 's'} cleared from ${Object.keys(removals).length} square${Object.keys(removals).length === 1 ? '' : 's'}`,
      delta,
    },
  ]

  const name = SUBSET_NAMES[match.size]
  return {
    title: `${match.kind === 'naked' ? 'Naked' : 'Hidden'} ${name[0].toUpperCase()}${name.slice(1)}`,
    explanation: headline(match, removedCount),
    steps,
  }
}

function run(grid: Square[]): Scene | null {
  const match = findSubset(grid)
  return match ? toScene(grid, match) : null
}

const subsets: Technique = {
  name: 'Subsets',
  run,
}

export default subsets
