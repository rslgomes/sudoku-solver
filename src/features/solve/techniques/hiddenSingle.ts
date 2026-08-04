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

const UNIT_CUE = 'peerGroup'
const placementCue = (index: number) => `place-${index}`

function findPlacements(grid: Square[], unit: Unit): Placement[] {
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

function headline(unit: Unit, count: number): string {
  const where = `{{${UNIT_CUE}|${unitLabel(unit)}}}`
  return count === 1
    ? `In ${where}, one number has a single square left to live in. So we mark it with the pen.`
    : `In ${where}, ${count} numbers have a single square left to live in. So we mark each with the pen.`
}

const placementLine = ({ index, value }: Placement) =>
  `${value} → {{${placementCue(index)}|${squareName(index)}}}, the only square that can hold it`

function toScene(unit: Unit, placements: Placement[]): Scene {
  const steps: SceneStep[] = [
    { beats: [highlightValues(unit.squares)], cue: UNIT_CUE },
    ...placements.map(
      ({ index, value }): SceneStep => ({
        beats: [highlightValues([index])],
        cue: placementCue(index),
        note: `${squareName(index)} = ${value}`,
        delta: { [index]: { setValue: value } },
      })
    ),
  ]

  return {
    title: 'Hidden Single',
    explanation: [
      headline(unit, placements.length),
      ...placements.map(placementLine),
    ].join('\n'),
    steps,
  }
}

function run(grid: Square[]): Scene | null {
  for (const unit of ALL_UNITS) {
    const placements = findPlacements(grid, unit)
    if (placements.length > 0) return toScene(unit, placements)
  }
  return null
}

const hiddenSingle: Technique = {
  name: 'Hidden Single',
  run,
}

export default hiddenSingle
