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

/**
 * 9×9 bitmap of a single unit.
 *
 * Row (0–8): square index within the unit
 * Column (0–8): candidate value (1–9)
 *
 * Bit index = squareIndex * 9 + candidateIndex
 *
 * Reading a row gives the digits a square can take.
 * Reading a column gives the squares a digit can go in.
 **/
function buildMatrix(grid: Square[], unit: Unit): bigint {
  let bitmap = 0n
  for (let sqIndex = 0; sqIndex < unit.squares.length; sqIndex++) {
    const gridIndex = unit.squares[sqIndex]
    const { value, notes } = grid[gridIndex]

    if (value) bitmap |= 1n << BigInt(value - 1 + 9 * sqIndex)
    else for (const c of notes) bitmap |= 1n << BigInt(c - 1 + 9 * sqIndex)
  }
  return bitmap
}

function getSquareCandidates(matrix: bigint, sqIndex: number): number {
  let mask = 0
  for (let candIndex = 0; candIndex < 9; candIndex++)
    if (matrix & (1n << BigInt(sqIndex * 9 + candIndex))) mask |= 1 << candIndex
  return mask
}

function getCandidateSquares(matrix: bigint, candIndex: number): number {
  let mask = 0
  for (let sqIndex = 0; sqIndex < 9; sqIndex++)
    if (matrix & (1n << BigInt(sqIndex * 9 + candIndex))) mask |= 1 << sqIndex

  return mask
}

function countOnes(bitmap: number): number {
  let count = 0
  for (let bm = bitmap; bm; bm &= bm - 1) count++
  return count
}

function maskToIndices(mask: number): number[] {
  const indices = []
  for (let i = 0; i < 9; i++) if (mask & (1 << i)) indices.push(i)
  return indices
}

function mergeMasks(
  indices: number[],
  matrix: bigint,
  fetcher: (m: bigint, idx: number) => number
): number {
  let union = 0
  for (const idx of indices) union |= fetcher(matrix, idx)
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
  matrix: bigint,
  unit: Unit,
  combination: number[],
  size: SubsetSize,
  kind: Subset['kind']
): { squares: Set<number>; values: Set<SudokuNumber> } | null {
  const isNaked = kind === 'naked'
  const matchFetcher = isNaked ? getSquareCandidates : getCandidateSquares
  const toRemoveFetcher = isNaked ? getCandidateSquares : getSquareCandidates

  const lockedMask = mergeMasks(combination, matrix, matchFetcher)
  if (countOnes(lockedMask) !== size) return null

  const lockedIndices = maskToIndices(lockedMask)
  const toRemoveMask = mergeMasks(lockedIndices, matrix, toRemoveFetcher)
  if (countOnes(toRemoveMask) <= size) return null //no point finding a subset that doesn't remove anything from board

  const squareIndices = isNaked ? combination : lockedIndices
  const candidateIndices = isNaked ? lockedIndices : combination
  return {
    squares: new Set(squareIndices.map((idx) => unit.squares[idx])),
    values: new Set(candidateIndices.map((idx) => (idx + 1) as SudokuNumber)),
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
  const unitData = ALL_UNITS.map((unit) => ({
    unit,
    matrix: buildMatrix(grid, unit),
  }))

  for (const size of SUBSET_SIZES) {
    const combs = combinations(9, size)
    let firstHidden: Subset | null = null

    for (const { unit, matrix } of unitData) {
      for (const combination of combs) {
        const nakedMatch = checkSubsetMatch(
          matrix,
          unit,
          combination,
          size,
          'naked'
        )
        if (nakedMatch) return { kind: 'naked', size, unit, ...nakedMatch }

        if (firstHidden) continue
        const hiddenMatch = checkSubsetMatch(
          matrix,
          unit,
          combination,
          size,
          'hidden'
        )
        if (hiddenMatch) {
          firstHidden = { kind: 'hidden', size, unit, ...hiddenMatch }
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
