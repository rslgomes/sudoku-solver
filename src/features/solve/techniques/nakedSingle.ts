import { highlightNotes, highlightValues } from '@features/explain/lib/atoms'
import type { Scene, SceneStep } from '@features/explain/types'
import {
  getCandidates,
  getLegalValues,
  PEERS,
  squareName,
  type Square,
  type SudokuNumber,
} from '@shared/sudoku'
import type { Placement, Technique } from '../types'

const CELLS_CUE = 'cells'
const placementCue = (index: number) => `place-${index}`

const soleCandidate = (
  grid: Square[],
  index: number
): SudokuNumber | null => {
  const notes = getCandidates(grid[index])
  if (notes.size !== 1) return null

  const [value] = notes
  const legal = getLegalValues(grid, index)
  return legal.has(value) ? value : null
}

function findPlacements(grid: Square[]): Placement[] {
  const placements: Placement[] = []

  for (let index = 0; index < grid.length; index++) {
    const value = soleCandidate(grid, index)
    if (!value) continue

    const contested = placements.some(
      (taken) => taken.value === value && PEERS[index].has(taken.index)
    )
    if (!contested) placements.push({ index, value })
  }

  return placements
}

function headline(count: number): string {
  const cells = `{{${CELLS_CUE}|${count === 1 ? 'one square' : `${count} squares`}}}`
  return count === 1
    ? `${cells} has a single note left, and nothing else fits there. So we mark it with the pen.`
    : `${cells} have a single note left, and nothing else fits in them. So we mark each with the pen.`
}

const placementLine = ({ index, value }: Placement) =>
  `{{${placementCue(index)}|${squareName(index)}}} → ${value}, its last note standing`

function toScene(placements: Placement[]): Scene {
  const notes: Record<number, SudokuNumber[]> = {}
  for (const { index, value } of placements) notes[index] = [value]

  const steps: SceneStep[] = [
    {
      beats: [
        highlightValues(placements.map(({ index }) => index)),
        highlightNotes(notes),
      ],
      cue: CELLS_CUE,
    },
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
    title: 'Naked Single',
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

const nakedSingle: Technique = {
  name: 'Naked Single',
  run,
}

export default nakedSingle
