import { highlightNotes, highlightValues } from '@features/explain/lib/atoms'
import type { CellDelta, Scene } from '@features/explain/types'
import {
  getCandidates,
  SUDOKU_NUMBERS,
  type Square,
  type SudokuNumber,
} from '@shared/sudoku'
import type { Technique } from '../types'

/**
 * pairings are called bands (row x box) and stacks (column x box)
 * --------------------------------------
 *
 * stack0 stack1 stack2
 * ______ ______ ______
 * |_____|______|______|
 * |_____|______|______|  this is a band
 * |_____|______|______|
 *
 * --------------------------------------
 * this is a stack
 *  _____
 * | | | |
 * | | | | band 0
 * |_|_|_|
 * | | | |
 * | | | | band 1
 * |_|_|_|
 * | | | |
 * | | | | band 2
 * |_|_|_|
 *
 * generalized line x box are called GROUPS
 ***/

const BANDS = 3
const STACKS = 3
const GROUPS = BANDS + STACKS

function buildMatrices(grid: Square[]): Uint16Array {
  const out = new Uint16Array(SUDOKU_NUMBERS.length * GROUPS)

  for (let i = 0; i < grid.length; i++) {
    const square = grid[i]

    const row = Math.floor(i / 9)
    const col = i % 9

    const band = Math.floor(row / 3)
    const stack = Math.floor(col / 3)

    const bandFlatIndex = (row % 3) * 3 + stack
    const rowBit = 1 << bandFlatIndex

    const stackFlatIndex = (col % 3) * 3 + band
    const colBit = 1 << stackFlatIndex

    for (const n of getCandidates(square)) {
      const currentBandMatrixIdx = GROUPS * (n - 1) + band
      const currentStackMatrixIdx = GROUPS * (n - 1) + (stack + BANDS)
      out[currentBandMatrixIdx] |= rowBit
      out[currentStackMatrixIdx] |= colBit
    }
  }
  return out
}

/**
 * Matrices are flattened 3x3 from line x box pairings
 * example:
 *         box0  box1  box2
 * line 0   1     1     0
 * line 1   0     1     1
 * line 2   1     0     1
 *
 * is equivalent to 110 011 101 -> 110011101 -> 0000000101110011 (bit Reversed)
 * **/
const MATRIX_SIZE = 3
const LINE_MASKS = [0b000000111, 0b000111000, 0b111000000]
const BOX_MASKS = [0b001001001, 0b010010010, 0b100100100]
const lineOf = (flatIndex: number) => Math.floor(flatIndex / MATRIX_SIZE)
const boxOf = (flatIndex: number) => flatIndex % MATRIX_SIZE

const isSingle = (masked: number) =>
  masked !== 0 && (masked & (masked - 1)) === 0
const slotOf = (singleBit: number) => 31 - Math.clz32(singleBit)

type Lock = {
  value: SudokuNumber
  group: number
  lineBoxIntersection: number
  toClear: number
  kind: 'pointing' | 'claiming'
}

function findLock(matrices: Uint16Array): Lock | null {
  for (const value of SUDOKU_NUMBERS) {
    for (let group = 0; group < GROUPS; group++) {
      const matrix = matrices[(value - 1) * GROUPS + group]

      for (let k = 0; k < MATRIX_SIZE; k++) {
        const filledLines = matrix & LINE_MASKS[k]
        if (isSingle(filledLines)) {
          const intersection = slotOf(filledLines)
          const toClear = matrix & BOX_MASKS[boxOf(intersection)] & ~filledLines
          if (toClear)
            return {
              value,
              group,
              lineBoxIntersection: intersection,
              toClear,
              kind: 'claiming',
            }
        }

        const filledBoxes = matrix & BOX_MASKS[k]
        if (isSingle(filledBoxes)) {
          const intersection = slotOf(filledBoxes)
          const toClear =
            matrix & LINE_MASKS[lineOf(intersection)] & ~filledBoxes
          if (toClear)
            return {
              value,
              group,
              lineBoxIntersection: intersection,
              toClear,
              kind: 'pointing',
            }
        }
      }
    }
  }
  return null
}

const BAND_META = {
  baseStep: 27,
  lineStep: 9,
  boxStep: 3,
  innerStep: 1,
}
const STACK_META = {
  baseStep: 3,
  lineStep: 1,
  boxStep: 27,
  innerStep: 9,
}

function slotSquares(group: number, slot: number): number[] {
  const isBand = group < BANDS
  const normalized = isBand ? group : group - BANDS
  const { baseStep, lineStep, boxStep, innerStep } = isBand
    ? BAND_META
    : STACK_META

  const start =
    normalized * baseStep + boxOf(slot) * boxStep + lineOf(slot) * lineStep
  return [start, start + innerStep, start + 2 * innerStep]
}

function maskSquares(group: number, mask: number): number[] {
  const squares = []
  for (let slot = 0; slot < MATRIX_SIZE * MATRIX_SIZE; slot++) {
    if (mask & (1 << slot)) squares.push(...slotSquares(group, slot))
  }
  return squares
}

const lineLabel = (group: number, slot: number) =>
  group < BANDS
    ? `row ${group * MATRIX_SIZE + lineOf(slot) + 1}`
    : `column ${(group - BANDS) * MATRIX_SIZE + lineOf(slot) + 1}`

const boxLabel = (group: number, slot: number) =>
  group < BANDS
    ? `box ${group * MATRIX_SIZE + boxOf(slot) + 1}`
    : `box ${boxOf(slot) * MATRIX_SIZE + (group - BANDS) + 1}`

const LOCKED_CUE = 'locked'
const CLEARED_CUE = 'cleared'

function toScene(grid: Square[], lock: Lock): Scene | null {
  const cleared = maskSquares(lock.group, lock.toClear).filter((index) =>
    getCandidates(grid[index]).has(lock.value)
  )
  if (cleared.length === 0) return null

  const removals: Record<number, SudokuNumber[]> = {}
  const delta: Record<number, CellDelta> = {}
  for (const index of cleared) {
    removals[index] = [lock.value]
    delta[index] = { removeNotes: [lock.value] }
  }

  const line = lineLabel(lock.group, lock.lineBoxIntersection)
  const box = boxLabel(lock.group, lock.lineBoxIntersection)
  const holds = `{{${LOCKED_CUE}|where they overlap}}`
  const swept =
    lock.kind === 'pointing'
      ? `{{${CLEARED_CUE}|the rest of ${line}}}`
      : `{{${CLEARED_CUE}|the rest of ${box}}}`
  const headline =
    lock.kind === 'pointing'
      ? `Every home for ${lock.value} in ${box} sits on ${line}, ${holds}. Wherever it lands it still owns ${line}, so ${lock.value} leaves ${swept}.`
      : `Every home for ${lock.value} in ${line} sits inside ${box}, ${holds}. Wherever it lands it still owns ${box}, so ${lock.value} leaves ${swept}.`

  return {
    title: 'Locked Candidates',
    explanation: headline,
    steps: [
      {
        beats: [
          highlightValues(slotSquares(lock.group, lock.lineBoxIntersection)),
        ],
        cue: LOCKED_CUE,
        note: `${lock.value} is locked to ${line} ∩ ${box}`,
      },
      {
        beats: [highlightNotes(removals)],
        cue: CLEARED_CUE,
        note: `${lock.value} struck from ${cleared.length} square${cleared.length === 1 ? '' : 's'} in ${lock.kind === 'pointing' ? line : box}`,
        delta,
      },
    ],
  }
}

function run(grid: Square[]): Scene | null {
  const lock = findLock(buildMatrices(grid))
  return lock ? toScene(grid, lock) : null
}

const lockedCandidates: Technique = {
  name: 'Locked Candidates',
  run,
}

export default lockedCandidates
