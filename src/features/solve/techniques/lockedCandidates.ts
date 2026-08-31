import { highlightNotes, highlightValues } from '@features/explain/lib/atoms'
import type { CellDelta, Scene } from '@features/explain/types'
import {
  ALL_UNITS,
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
 * Bands and stacks are the same line x box relationship viewed in
 * opposite directions — inverting rows and columns turns one into the
 * other. That inversion is captured below as a pair of Orientations.
 ***/

const MATRIX_SIZE = 3
const LINE_MASKS = [0b000000111, 0b000111000, 0b111000000]
const BOX_MASKS = [0b001001001, 0b010010010, 0b100100100]
const lineOf = (flatIndex: number) => Math.floor(flatIndex / MATRIX_SIZE)
const boxOf = (flatIndex: number) => flatIndex % MATRIX_SIZE

type Orientation = {
  label: 'row' | 'column'
  baseStep: number
  lineStep: number
  boxStep: number
  innerStep: number
  lineLabel(group: number, slot: number): string
  boxLabel(group: number, slot: number): string
}

const ROW_ORIENTATION: Orientation = {
  label: 'row',
  baseStep: 27,
  lineStep: 9,
  boxStep: 3,
  innerStep: 1,
  lineLabel: (band, slot) => `row ${band * MATRIX_SIZE + lineOf(slot) + 1}`,
  boxLabel: (band, slot) => `box ${band * MATRIX_SIZE + boxOf(slot) + 1}`,
}

const COLUMN_ORIENTATION: Orientation = {
  label: 'column',
  baseStep: 3,
  lineStep: 1,
  boxStep: 27,
  innerStep: 9,
  lineLabel: (stack, slot) => `column ${stack * MATRIX_SIZE + lineOf(slot) + 1}`,
  boxLabel: (stack, slot) => `box ${boxOf(slot) * MATRIX_SIZE + stack + 1}`,
}

const ORIENTATIONS = [ROW_ORIENTATION, COLUMN_ORIENTATION]
const LINE_GROUPS = ORIENTATIONS.length * MATRIX_SIZE

function resolveGroup(group: number): {
  orientation: Orientation
  localGroup: number
} {
  return {
    orientation: ORIENTATIONS[Math.floor(group / MATRIX_SIZE)],
    localGroup: group % MATRIX_SIZE,
  }
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
function buildMatrices(grid: Square[]): Uint16Array {
  const out = new Uint16Array(SUDOKU_NUMBERS.length * LINE_GROUPS)
  const boxes = ALL_UNITS.filter((unit) => unit.kind === 'box')

  boxes.forEach((box, boxIndex) => {
    const band = Math.floor(boxIndex / MATRIX_SIZE)
    const stack = boxIndex % MATRIX_SIZE

    box.squares.forEach((squareIndex, slot) => {
      const rowInBox = Math.floor(slot / MATRIX_SIZE)
      const colInBox = slot % MATRIX_SIZE

      const rowBit = 1 << (rowInBox * MATRIX_SIZE + stack)
      const colBit = 1 << (colInBox * MATRIX_SIZE + band)

      for (const n of getCandidates(grid[squareIndex])) {
        out[LINE_GROUPS * (n - 1) + band] |= rowBit
        out[LINE_GROUPS * (n - 1) + MATRIX_SIZE + stack] |= colBit
      }
    })
  })

  return out
}

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
    for (let group = 0; group < LINE_GROUPS; group++) {
      const matrix = matrices[(value - 1) * LINE_GROUPS + group]

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

function slotSquares(group: number, slot: number): number[] {
  const { orientation, localGroup } = resolveGroup(group)
  const { baseStep, lineStep, boxStep, innerStep } = orientation

  const start =
    localGroup * baseStep + boxOf(slot) * boxStep + lineOf(slot) * lineStep
  return [start, start + innerStep, start + 2 * innerStep]
}

function maskSquares(group: number, mask: number): number[] {
  const squares = []
  for (let slot = 0; slot < MATRIX_SIZE * MATRIX_SIZE; slot++) {
    if (mask & (1 << slot)) squares.push(...slotSquares(group, slot))
  }
  return squares
}

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

  const { orientation, localGroup } = resolveGroup(lock.group)
  const line = orientation.lineLabel(localGroup, lock.lineBoxIntersection)
  const box = orientation.boxLabel(localGroup, lock.lineBoxIntersection)
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
