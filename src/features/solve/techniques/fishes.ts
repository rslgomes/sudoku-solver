import { highlightNotes, highlightValues } from '@features/explain/lib/atoms'
import type { CellDelta, Scene, SceneStep } from '@features/explain/types'
import {
  getCandidates,
  GRID_SIZE,
  SUDOKU_NUMBERS,
  type Square,
  type SudokuNumber,
} from '@shared/sudoku'
import type { Technique } from '../types'

/**
 * Swordfish (size 3), shown for candidate 4:
 *
 *            col2        col4        col6
 *     _____ _____ _____ _____ _____ _____ _____ _____ _____
 *    |     |     |     |     |     |     |     |     |     |
 * r1 |     | 4   |     |     |     | 4   |     |     |     |
 *    |_____|_____|_____|_____|_____|_____|_____|_____|_____|
 * ...
 * rows 2 and 3
 *     _____ _____ _____ _____ _____ _____ _____ _____ _____
 *    |     |     |     |     |     |     |     |     |     |
 * r4 |     | 4   |     | 4   |     |     |     |     |     |
 *    |_____|_____|_____|_____|_____|_____|_____|_____|_____|
 *    |     |     |     |     |     |     |     |     |     |
 * r5 |     | 4   |     | 4   |     | 4   |     |     |     |
 *    |_____|_____|_____|_____|_____|_____|_____|_____|_____|
 * ...
 * rows 6 to 9
 *
 * Rows 1, 4 and 5 are the only rows left needing a 4, and between them
 * it can only sit in columns 2, 4 and 6. Whichever way those three rows
 * resolve, 4 still ends up once in each of those three columns — so
 * every other 4 in columns 2, 4 and 6 (rows 2, 3, 6, 7, 8, 9) can be
 * struck, no matter which cross the trio actually forms.
 *
 * X-Wing (2 rows / 2 cols) and jellyfish (4 / 4) are the same
 * relationship at other sizes, and rows and columns are the same
 * relationship viewed from opposite axes — inverting one search's
 * base/cover masks turns it into the other.
 **/
const FISH_SIZES = [2, 3, 4] as const
type FishSize = (typeof FISH_SIZES)[number]

const FISH_NAMES: Record<FishSize, string> = {
  2: 'X-Wing',
  3: 'Swordfish',
  4: 'Jellyfish',
}

type Axis = 'row' | 'column'

type LineMasks = {
  rowMasks: number[]
  colMasks: number[]
}

type Fish = {
  value: SudokuNumber
  size: FishSize
  base: Axis
  baseLines: number[]
  coverLines: number[]
  holdCells: number[]
  eliminations: number[]
}

const squareIndex = (row: number, col: number) => row * GRID_SIZE + col

const cellAt = (base: Axis, baseLine: number, coverLine: number) =>
  base === 'row'
    ? squareIndex(baseLine, coverLine)
    : squareIndex(coverLine, baseLine)

const coverAxis = (base: Axis): Axis => (base === 'row' ? 'column' : 'row')

function countOnes(mask: number): number {
  let count = 0
  for (let m = mask; m; m &= m - 1) count++
  return count
}

function maskToIndices(mask: number): number[] {
  const indices: number[] = []
  for (let i = 0; i < GRID_SIZE; i++) if (mask & (1 << i)) indices.push(i)
  return indices
}

function buildCandidateMasks(grid: Square[]): Map<SudokuNumber, LineMasks> {
  const masks = new Map<SudokuNumber, LineMasks>(
    SUDOKU_NUMBERS.map((value): [SudokuNumber, LineMasks] => [
      value,
      {
        rowMasks: new Array<number>(GRID_SIZE).fill(0),
        colMasks: new Array<number>(GRID_SIZE).fill(0),
      },
    ])
  )

  for (let row = 0; row < GRID_SIZE; row++)
    for (let col = 0; col < GRID_SIZE; col++) {
      const candidates = getCandidates(grid[squareIndex(row, col)])
      for (const [value, { rowMasks, colMasks }] of masks) {
        if (!candidates.has(value)) continue
        rowMasks[row] |= 1 << col
        colMasks[col] |= 1 << row
      }
    }

  return masks
}

/**
 * `base` is the axis being picked (rows for a row-based fish), `cover`
 * is the opposite axis being confined to. A fish exists when `size`
 * base lines connect to exactly `size` cover lines between them — same
 * k-to-k relationship as a subset, just between lines instead of
 * squares and candidates. `extend` backtracks over base lines,
 * widening the cover union as it goes and pruning the moment that
 * union outgrows `size`, so a dead branch never gets fully built out.
 **/
function searchFish(
  value: SudokuNumber,
  size: FishSize,
  base: Axis,
  baseMasks: number[],
  coverMasks: number[]
): Fish | null {
  const usableLines: number[] = []
  for (let line = 0; line < GRID_SIZE; line++) {
    const count = countOnes(baseMasks[line])
    if (count > 0 && count <= size) usableLines.push(line)
  }
  if (usableLines.length < size) return null

  const baseLines: number[] = []

  const buildFish = (coverUnion: number, baseLineMask: number): Fish | null => {
    const coverLines = maskToIndices(coverUnion)

    const eliminations: number[] = []
    for (const cover of coverLines)
      for (const line of maskToIndices(coverMasks[cover] & ~baseLineMask))
        eliminations.push(cellAt(base, line, cover))
    if (eliminations.length === 0) return null

    const holdCells: number[] = []
    for (const line of baseLines)
      for (const cover of maskToIndices(baseMasks[line]))
        holdCells.push(cellAt(base, line, cover))

    return {
      value,
      size,
      base,
      baseLines: [...baseLines],
      coverLines,
      holdCells,
      eliminations,
    }
  }

  const extend = (
    start: number,
    coverUnion: number,
    baseLineMask: number
  ): Fish | null => {
    if (baseLines.length === size)
      return countOnes(coverUnion) === size
        ? buildFish(coverUnion, baseLineMask)
        : null

    const missing = size - baseLines.length
    for (let i = start; i + missing <= usableLines.length; i++) {
      const line = usableLines[i]
      const union = coverUnion | baseMasks[line]
      if (countOnes(union) > size) continue

      baseLines.push(line)
      const fish = extend(i + 1, union, baseLineMask | (1 << line))
      baseLines.pop()
      if (fish) return fish
    }

    return null
  }

  return extend(0, 0, 0)
}

function findFish(grid: Square[]): Fish | null {
  const masks = buildCandidateMasks(grid)

  for (const size of FISH_SIZES) {
    for (const [value, { rowMasks, colMasks }] of masks) {
      const fish =
        searchFish(value, size, 'row', rowMasks, colMasks) ??
        searchFish(value, size, 'column', colMasks, rowMasks)
      if (fish) return fish
    }
  }

  return null
}

const HOLD_CUE = 'hold'
const CLEARED_CUE = 'cleared'

const plural = (count: number, noun: string) =>
  `${count} ${noun}${count === 1 ? '' : 's'}`

const lineLabel = (axis: Axis, lines: number[]) =>
  `${axis}${lines.length > 1 ? 's' : ''} ${lines.map((line) => line + 1).join(', ')}`

const baseLabel = (fish: Fish) => lineLabel(fish.base, fish.baseLines)

const coverLabel = (fish: Fish) =>
  lineLabel(coverAxis(fish.base), fish.coverLines)

function headline(fish: Fish): string {
  const axis = coverAxis(fish.base)
  const cover = `{{${HOLD_CUE}|${coverLabel(fish)}}}`
  const cleared = `{{${CLEARED_CUE}|${plural(fish.eliminations.length, 'candidate')}}}`

  return `Across ${baseLabel(fish)}, every home for ${fish.value} falls inside ${cover} — a ${FISH_NAMES[fish.size]}. Wherever it lands in each ${fish.base}, it still claims one of those ${axis}s, so ${cleared} leave every other ${fish.base}.`
}

function toScene(fish: Fish): Scene {
  const removals: Record<number, SudokuNumber[]> = {}
  const delta: Record<number, CellDelta> = {}
  for (const index of fish.eliminations) {
    removals[index] = [fish.value]
    delta[index] = { removeNotes: [fish.value] }
  }

  const cleared = fish.eliminations.length

  const steps: SceneStep[] = [
    {
      beats: [highlightValues(fish.holdCells)],
      cue: HOLD_CUE,
      note: `${fish.value} confined to ${baseLabel(fish)} ∩ ${coverLabel(fish)}`,
    },
    {
      beats: [highlightNotes(removals)],
      cue: CLEARED_CUE,
      note: `${plural(cleared, 'candidate')} cleared from ${plural(cleared, 'square')}`,
      delta,
    },
  ]

  return {
    title: FISH_NAMES[fish.size],
    explanation: headline(fish),
    steps,
  }
}

function run(grid: Square[]): Scene | null {
  const fish = findFish(grid)
  return fish && toScene(fish)
}

const fishes: Technique = {
  name: 'Fishes',
  run,
}

export default fishes
