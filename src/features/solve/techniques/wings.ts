import { highlightNotes, highlightValues } from '@features/explain/lib/atoms'
import type { CellDelta, Scene, SceneStep } from '@features/explain/types'
import {
  ALL_UNITS,
  getCandidates,
  GRID_SIZE,
  squareName,
  SUDOKU_NUMBERS,
  unitLabel,
  type Square,
  type SudokuNumber,
  type Unit,
} from '@shared/sudoku'
import type { Technique } from '../types'

/**
 * XY-Wing, shown for a pivot holding 1 and 2:
 *
 *      c1    c2    c3    c4    c5
 *     ______ ______ ______ ______ ______
 *    | 1 2  |      |      |      | 1   3|
 * r1 |      |      |      |      |      |
 *    |______|______|______|______|______|
 * ...
 * rows 2 to 4
 *     ______ ______ ______ ______ ______
 *    |   2 3|      |      |      |   [3]|
 * r5 |      |      |      |      |      |
 *    |______|______|______|______|______|
 * ...
 * rows 6 to 9
 *
 * The pivot r1c1 sees both wings and has no third option, so it forces
 * one of them either way it falls. Take 1 and r1c5 loses its 1 and has
 * to be 3; take 2 and r5c1 loses its 2 and has to be 3. The pivot never
 * pushes 3 into both wings at once, but it can never keep 3 out of both
 * either — one of them always holds it.
 *
 * That is enough. r5c5 sees both wings, so whichever wing the 3 lands
 * in, that square is blocked from taking it: [3] goes.
 *
 * XYZ-Wing is the same picture with the shared digit left in the pivot:
 *
 *      c1    c2    c3
 *     _____ _____ _____
 *    |     |     |     |
 * r1 |1 2 3| 1 3 |     |
 *    |_____|_____|_____|
 *    |     |     |     |
 * r2 | [3] |     |     |
 *    |_____|_____|_____|
 *    |     |     |     |
 * r3 | [3] |     |     |
 *    |_____|_____|_____|
 * ...
 *    |     |     |     |
 * r5 | 2 3 |     |     |
 *    |_____|_____|_____|
 *
 * Now the pivot can take the 3 itself, so it stops being a switch and
 * joins the wings as a third place the digit may land. The squares that
 * get blocked are the ones seeing all three, not just the two wings.
 *
 * W-Wing drops the pivot entirely and lets a strong link do the forcing:
 *
 *      c1    c2    c3    c4
 *     ______ ______ ______ ______
 *    | 1   3|      |      |[1]   |
 * r1 |      |      |      |      |
 *    |______|______|______|______|
 * ...
 *     ______ ______ ______ ______
 *    |[1]   |      |      | 1   3|
 * r4 |      |      |      |      |
 *    |______|______|______|______|
 * ...
 *     ______ ______ ______ ______
 *    |     3|      |      |     3|
 * r7 |      |      |      |      |
 *    |______|______|______|______|
 *
 * Row 7 has only two homes left for 3, one under each pair square. If
 * r1c1 took the 3 it would knock out r7c1, handing row 7's 3 to r7c4,
 * which knocks the 3 out of r4c4 — so r4c4 is 1. And if r1c1 is not 3
 * it is 1 outright. Either way the 1 is in one of the pair.
 *
 * All three land on the same claim: a set of squares that must hold the
 * digit between them. Only the forcing differs, so only the search
 * differs — every square that sees the whole set is blocked, and that
 * elimination is one function.
 **/

const CELL_COUNT = GRID_SIZE * GRID_SIZE

const PIVOT_SIZES = [2, 3] as const
type PivotSize = (typeof PIVOT_SIZES)[number]

const PIVOT_NAMES: Record<PivotSize, string> = {
  2: 'XY-Wing',
  3: 'XYZ-Wing',
}

const valueBit = (value: SudokuNumber) => 1 << (value - 1)

function countOnes(mask: number): number {
  let count = 0
  for (let m = mask; m; m &= m - 1) count++
  return count
}

const maskValues = (mask: number): SudokuNumber[] =>
  SUDOKU_NUMBERS.filter((value) => (mask & valueBit(value)) !== 0)

const singleValue = (mask: number): SudokuNumber => maskValues(mask)[0]

function buildAdjacency(): Uint8Array {
  const adjacency = new Uint8Array(CELL_COUNT * CELL_COUNT)
  for (const unit of ALL_UNITS)
    for (const a of unit.squares)
      for (const b of unit.squares)
        if (a !== b) adjacency[a * CELL_COUNT + b] = 1
  return adjacency
}

const ADJACENCY = buildAdjacency()

const sees = (a: number, b: number) => ADJACENCY[a * CELL_COUNT + b] === 1

const PEERS: number[][] = Array.from({ length: CELL_COUNT }, (_, square) => {
  const peers: number[] = []
  for (let other = 0; other < CELL_COUNT; other++)
    if (sees(square, other)) peers.push(other)
  return peers
})

function commonPeers(squares: number[]): number[] {
  if (squares.length === 0) return []
  return PEERS[squares[0]].filter((peer) =>
    squares.every((square) => sees(square, peer))
  )
}

/**
 * Two kinds of link carry every wing.
 *
 * A weak link is geometric — two squares sharing a unit cannot both take
 * the same digit, so one being it means the other is not. A strong link
 * is exclusive — only two places are left, so one not being it means the
 * other is. Weak links propagate a yes, strong links propagate a no.
 *
 * Strong links come in two shapes, and they are the same relationship on
 * opposite axes: one square down to two digits, or one unit down to two
 * squares for a digit.
 *
 *    cell link             unit link
 *     _____                 _____ _____ _____
 *    |     |               |     |     |     |
 *    | 1 3 |               |  3  |     |  3  |
 *    |_____|               |_____|_____|_____|
 *
 *    1 or 3,                here or there,
 *    never neither          never neither
 **/
type StrongLink = {
  value: SudokuNumber
  squares: [number, number]
  unit: Unit
}

const weakLink = (masks: number[], value: SudokuNumber, a: number, b: number) =>
  sees(a, b) && (masks[a] & masks[b] & valueBit(value)) !== 0

const cellStrongLink = (mask: number): [SudokuNumber, SudokuNumber] | null => {
  if (countOnes(mask) !== 2) return null
  const [first, second] = maskValues(mask)
  return [first, second]
}

function unitStrongLinks(masks: number[]): Map<SudokuNumber, StrongLink[]> {
  const byValue = new Map<SudokuNumber, StrongLink[]>(
    SUDOKU_NUMBERS.map((value): [SudokuNumber, StrongLink[]] => [value, []])
  )
  const seen = new Set<string>()

  for (const unit of ALL_UNITS)
    for (const value of SUDOKU_NUMBERS) {
      const bit = valueBit(value)
      const holders = unit.squares.filter((square) => masks[square] & bit)
      if (holders.length !== 2) continue

      const key = `${value}:${holders[0]}:${holders[1]}`
      if (seen.has(key)) continue
      seen.add(key)

      byValue.get(value)?.push({
        value,
        squares: [holders[0], holders[1]],
        unit,
      })
    }

  return byValue
}

type CellMasks = {
  masks: number[]
  bivaluesByMask: Map<number, number[]>
}

function buildCellMasks(grid: Square[]): CellMasks {
  const masks = new Array<number>(CELL_COUNT).fill(0)
  const bivaluesByMask = new Map<number, number[]>()

  for (let square = 0; square < CELL_COUNT; square++) {
    let mask = 0
    for (const value of getCandidates(grid[square])) mask |= valueBit(value)
    masks[square] = mask

    if (!cellStrongLink(mask)) continue
    const group = bivaluesByMask.get(mask)
    if (group) group.push(square)
    else bivaluesByMask.set(mask, [square])
  }

  return { masks, bivaluesByMask }
}

type Wing = {
  title: string
  value: SudokuNumber
  squares: number[]
  holders: number[]
  link: StrongLink | null
  eliminations: number[]
  explanation: string
  anchorNote: string
}

const HOLD_CUE = 'hold'
const LINK_CUE = 'link'
const CLEARED_CUE = 'cleared'

const plural = (count: number, noun: string) =>
  `${count} ${noun}${count === 1 ? '' : 's'}`

const squareNames = (squares: number[]) => squares.map(squareName).join(', ')

const cue = (name: string, text: string) => `{{${name}|${text}}}`

function eliminationsFor(
  masks: number[],
  holders: number[],
  value: SudokuNumber
): number[] {
  const bit = valueBit(value)
  return commonPeers(holders).filter((square) => masks[square] & bit)
}

function pivotWing(
  size: PivotSize,
  pivot: number,
  wings: [number, number],
  wingValues: [SudokuNumber, SudokuNumber],
  value: SudokuNumber,
  holders: number[],
  eliminations: number[]
): Wing {
  const [left, right] = wings
  const [leftValue, rightValue] = wingValues
  const title = PIVOT_NAMES[size]
  const pair = `${squareName(left)} (${leftValue}/${value}) and ${squareName(right)} (${rightValue}/${value})`
  const cleared = cue(CLEARED_CUE, plural(eliminations.length, 'candidate'))

  const explanation =
    size === 2
      ? `${squareName(pivot)} is only ${leftValue} or ${rightValue}, and it sees ${pair} — an ${title}. Whichever way it falls it pushes ${cue(HOLD_CUE, `${value} into one wing or the other`)}, so ${cleared} leave every square seeing both wings.`
      : `${squareName(pivot)} holds ${leftValue}, ${rightValue} and ${value}, and it sees ${pair} — an ${title}. The pivot can keep the ${value} itself, so ${cue(HOLD_CUE, `${value} is trapped in the three of them`)} and ${cleared} leave every square seeing all three.`

  return {
    title,
    value,
    squares: [pivot, left, right],
    holders,
    link: null,
    eliminations,
    explanation,
    anchorNote: `pivot ${squareName(pivot)} forces ${value} into ${squareNames(holders)}`,
  }
}

/**
 * XY and XYZ are one search. Two bivalue wings sharing exactly one digit
 * hang off a pivot that supplies each wing's other digit, and the pivot's
 * own size decides the rest:
 *
 *   pivot 1 2   -> shared 3 sits outside the pivot, wings hold it
 *   pivot 1 2 3 -> shared 3 sits inside the pivot, all three hold it
 *
 * so `holders` is just the pattern squares that still carry the shared
 * digit, and the same masks that prove the shape pick it out.
 **/
function findPivotWing(cells: CellMasks, size: PivotSize): Wing | null {
  const { masks } = cells

  for (let pivot = 0; pivot < CELL_COUNT; pivot++) {
    const pivotMask = masks[pivot]
    if (countOnes(pivotMask) !== size) continue

    const wings = PEERS[pivot].filter((square) => cellStrongLink(masks[square]))

    for (let i = 0; i < wings.length; i++)
      for (let j = i + 1; j < wings.length; j++) {
        const left = wings[i]
        const right = wings[j]

        const shared = masks[left] & masks[right]
        if (countOnes(shared) !== 1) continue

        const leftOnly = masks[left] & ~shared
        const rightOnly = masks[right] & ~shared
        if (leftOnly === rightOnly) continue
        if (pivotMask & ~(leftOnly | rightOnly | shared)) continue

        const leftValue = singleValue(leftOnly)
        const rightValue = singleValue(rightOnly)
        if (!weakLink(masks, leftValue, pivot, left)) continue
        if (!weakLink(masks, rightValue, pivot, right)) continue

        const value = singleValue(shared)
        const holders = [pivot, left, right].filter(
          (square) => masks[square] & shared
        )
        const eliminations = eliminationsFor(masks, holders, value)
        if (eliminations.length === 0) continue

        return pivotWing(
          size,
          pivot,
          [left, right],
          [leftValue, rightValue],
          value,
          holders,
          eliminations
        )
      }
  }

  return null
}

function wWing(
  pair: [number, number],
  value: SudokuNumber,
  link: StrongLink,
  eliminations: number[]
): Wing {
  const holders = [...pair]
  const where = unitLabel(link.unit)
  const cleared = cue(CLEARED_CUE, plural(eliminations.length, 'candidate'))
  const linked = cue(
    LINK_CUE,
    `${link.value} is down to two squares in ${where}`
  )

  return {
    title: 'W-Wing',
    value,
    squares: holders,
    holders,
    link,
    eliminations,
    explanation: `${squareNames(holders)} both hold only ${value} and ${link.value}, and ${linked} — one under each of them. Whichever end of ${where} takes the ${link.value}, the square above it gives up its own, so ${cue(HOLD_CUE, `${value} is trapped in the pair`)} and ${cleared} leave every square seeing both.`,
    anchorNote: `${squareNames(holders)} both hold only ${value} and ${link.value}`,
  }
}

/**
 * No pivot to fall either way here, so the switch is a strong link
 * bridged to the pair by a weak link at each end. The pair must be
 * identical bivalues and must not see each other — two of them in one
 * unit is a naked pair, a plainer thing to be shown.
 **/
function findWWing(cells: CellMasks): Wing | null {
  const { masks, bivaluesByMask } = cells
  const linksByValue = unitStrongLinks(masks)

  for (const [mask, squares] of bivaluesByMask) {
    const pair = cellStrongLink(mask)
    if (!pair || squares.length < 2) continue

    for (let i = 0; i < squares.length; i++)
      for (let j = i + 1; j < squares.length; j++) {
        const left = squares[i]
        const right = squares[j]
        if (sees(left, right)) continue

        for (const value of pair) {
          const linkValue = value === pair[0] ? pair[1] : pair[0]

          for (const link of linksByValue.get(linkValue) ?? []) {
            const [near, far] = link.squares
            if (near === left || near === right) continue
            if (far === left || far === right) continue

            const bridged =
              (weakLink(masks, linkValue, near, left) &&
                weakLink(masks, linkValue, far, right)) ||
              (weakLink(masks, linkValue, near, right) &&
                weakLink(masks, linkValue, far, left))
            if (!bridged) continue

            const eliminations = eliminationsFor(masks, [left, right], value)
            if (eliminations.length === 0) continue

            return wWing([left, right], value, link, eliminations)
          }
        }
      }
  }

  return null
}

function findWing(grid: Square[]): Wing | null {
  const cells = buildCellMasks(grid)

  for (const size of PIVOT_SIZES) {
    const wing = findPivotWing(cells, size)
    if (wing) return wing
  }

  return findWWing(cells)
}

const notesOn = (
  squares: number[],
  value: SudokuNumber
): Record<number, SudokuNumber[]> => {
  const notes: Record<number, SudokuNumber[]> = {}
  for (const square of squares) notes[square] = [value]
  return notes
}

function toScene(wing: Wing): Scene {
  const delta: Record<number, CellDelta> = {}
  for (const square of wing.eliminations)
    delta[square] = { removeNotes: [wing.value] }

  const linkStep: SceneStep[] = wing.link
    ? [
        {
          beats: [highlightNotes(notesOn(wing.link.squares, wing.link.value))],
          cue: LINK_CUE,
          note: `${wing.link.value} locked to ${squareNames(wing.link.squares)} in ${unitLabel(wing.link.unit)}`,
        },
      ]
    : []

  const steps: SceneStep[] = [
    ...linkStep,
    {
      beats: [
        highlightValues(wing.squares),
        highlightNotes(notesOn(wing.holders, wing.value)),
      ],
      cue: HOLD_CUE,
      note: wing.anchorNote,
    },
    {
      beats: [highlightNotes(notesOn(wing.eliminations, wing.value))],
      cue: CLEARED_CUE,
      note: `${wing.value} struck from ${plural(wing.eliminations.length, 'square')}`,
      delta,
    },
  ]

  return {
    title: wing.title,
    explanation: wing.explanation,
    steps,
  }
}

function run(grid: Square[]): Scene | null {
  const wing = findWing(grid)
  return wing && toScene(wing)
}

const wings: Technique = {
  name: 'Wings',
  run,
}

export default wings
