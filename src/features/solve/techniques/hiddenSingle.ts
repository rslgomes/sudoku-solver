import { highlightValues } from '@features/explain/lib/atoms'
import type { Scene, SceneStep } from '@features/explain/types'
import {
  ALL_UNITS,
  getCandidates,
  squareName,
  unitLabel,
  type Square,
  type SudokuNumber,
  type Unit,
} from '@shared/sudoku'
import type { Placement, Technique } from '../types'

const CELLS_CUE = 'cells'
const PLACE_CUE = 'place'

type HiddenPlacement = Placement & { unit: Unit }

function findUnitPlacements(grid: Square[], unit: Unit): Placement[] {
  const hiddenSingles = new Map<SudokuNumber, number>()
  const foundBefore = new Set<SudokuNumber>()

  for (const index of unit.squares) {
    const sq = grid[index]
    if (sq.value) {
      hiddenSingles.delete(sq.value)
      foundBefore.add(sq.value)
      continue
    }
    for (const candidate of getCandidates(sq)) {
      if (foundBefore.has(candidate)) continue

      if (hiddenSingles.has(candidate)) {
        hiddenSingles.delete(candidate)
        foundBefore.add(candidate)
      } else {
        hiddenSingles.set(candidate, index)
      }
    }
  }

  const taken = new Set<number>()
  const placements: Placement[] = []
  for (const [value, index] of hiddenSingles) {
    if (taken.has(index)) continue
    taken.add(index)
    placements.push({ index, value })
  }
  return placements
}

function findPlacements(grid: Square[]): HiddenPlacement[] {
  const taken = new Set<number>()
  const placements: HiddenPlacement[] = []

  for (const unit of ALL_UNITS) {
    for (const placement of findUnitPlacements(grid, unit)) {
      if (taken.has(placement.index)) continue
      taken.add(placement.index)
      placements.push({ ...placement, unit })
    }
  }
  return placements
}

function headline(count: number): string {
  const cells = `{{${CELLS_CUE}|${count === 1 ? 'one square' : `${count} squares`}}}`
  return count === 1
    ? `${cells} has a single square left to hold its number in a row, column, or box. So we mark it with the pen.`
    : `${cells} have a single square left to hold their number in a row, column, or box. So we mark each with the pen.`
}

const placementLine = ({ index, value, unit }: HiddenPlacement) =>
  `${value} → {{${PLACE_CUE}|${squareName(index)}}}, the only square in ${unitLabel(unit)} that can hold it`

function toScene(placements: HiddenPlacement[]): Scene {
  const delta: Record<number, { setValue: SudokuNumber }> = {}
  for (const { index, value } of placements) delta[index] = { setValue: value }

  const indices = placements.map(({ index }) => index)
  const note = placements
    .map(({ index, value }) => `${squareName(index)} = ${value}`)
    .join(', ')

  const steps: SceneStep[] = [
    {
      beats: [highlightValues(indices)],
      cue: CELLS_CUE,
    },
    {
      beats: [highlightValues(indices)],
      cue: PLACE_CUE,
      note,
      delta,
    },
  ]

  return {
    title: 'Hidden Single',
    explanation: [
      headline(placements.length),
      ...placements.map(placementLine),
    ].join('\n'),
    steps,
  }
}

function run(grid: Square[]): Scene | null {
  const placements = findPlacements(grid)
  return placements.length > 0 ? toScene(placements) : null
}

const hiddenSingle: Technique = {
  name: 'Hidden Single',
  run,
}

export default hiddenSingle
