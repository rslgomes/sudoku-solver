// Constraint propagation + MRV search, after Peter Norvig,
// "Solving Every Sudoku Puzzle" (https://norvig.com/sudoku.html), with the
// recursion flattened into a worklist so propagation reads as breadth-first
// waves rather than a depth-first walk.
import {
  PEERS,
  UNITS,
  SUDOKU_NUMBERS,
  GRID_SIZE,
  getErrors,
  type Square,
  type SudokuNumber,
} from '@shared/sudoku'
import type { Technique } from '../types'
import type { Beat, CellDelta, Scene, SceneStep } from '@features/explain/types'
import {
  BEAT_MS,
  drawFan,
  highlightNotes,
  highlightValues,
} from '@features/explain/lib/atoms'

type Contradiction =
  | { kind: 'cellEmptied'; square: number }
  | { kind: 'valueTrapped'; unit: number[]; value: SudokuNumber }

type Claim = { square: number; value: SudokuNumber; evidence: number[] }

type Pulse = {
  trigger: number
  value: SudokuNumber
  evidence: number[]
  removals: Record<number, SudokuNumber[]>
  resolved: Record<number, SudokuNumber>
  contradiction: Contradiction | null
}

type Propagation = { pulses: Pulse[]; contradiction: Contradiction | null }

type Verdict = { kind: 'contradiction' | 'exhausted'; cells: number[] }

type Attempt = { value: SudokuNumber; pulses: Pulse[]; verdict: Verdict }

type GuessNode = {
  square: number
  rejected: Attempt[]
  chosen: { value: SudokuNumber; pulses: Pulse[] }
}

type Candidates = Set<SudokuNumber>[]

const claim = (
  square: number,
  value: SudokuNumber,
  evidence: number[] = []
): Claim => ({ square, value, evidence })

function propagate(board: Candidates, seeds: Claim[]): Propagation {
  const pulses: Pulse[] = []
  const queue = [...seeds]

  while (queue.length > 0) {
    const pending = queue.shift()!
    const removals: Record<number, SudokuNumber[]> = {}
    const resolved: Record<number, SudokuNumber> = {}
    const followUps: Claim[] = []

    const strike = (cell: number, value: SudokuNumber): Contradiction | null => {
      const candidates = board[cell]
      if (!candidates.has(value)) return null
      candidates.delete(value)
      ;(removals[cell] ??= []).push(value)

      if (candidates.size === 0) return { kind: 'cellEmptied', square: cell }
      if (candidates.size === 1) {
        const [sole] = candidates
        resolved[cell] = sole
        followUps.push(claim(cell, sole))
      }

      for (const unit of UNITS[cell]) {
        const homes = unit.filter((home) => board[home].has(value))
        if (homes.length === 0) return { kind: 'valueTrapped', unit, value }
        if (homes.length === 1 && board[homes[0]].size > 1)
          followUps.push(claim(homes[0], value, unit))
      }
      return null
    }

    let contradiction: Contradiction | null = null
    if (!board[pending.square].has(pending.value)) {
      contradiction = { kind: 'cellEmptied', square: pending.square }
    } else {
      const wave: [number, SudokuNumber][] = [
        ...[...board[pending.square]]
          .filter((other) => other !== pending.value)
          .map((other): [number, SudokuNumber] => [pending.square, other]),
        ...[...PEERS[pending.square]].map(
          (peer): [number, SudokuNumber] => [peer, pending.value]
        ),
      ]
      for (const [cell, value] of wave) {
        contradiction = strike(cell, value)
        if (contradiction) break
      }
    }

    if (contradiction || Object.keys(removals).length > 0)
      pulses.push({
        trigger: pending.square,
        value: pending.value,
        evidence: pending.evidence,
        removals,
        resolved,
        contradiction,
      })

    if (contradiction) return { pulses, contradiction }
    queue.push(...followUps)
  }

  return { pulses, contradiction: null }
}

function seedFromGivens(grid: Square[]): {
  board: Candidates
  contradiction: Contradiction | null
} {
  const board: Candidates = Array.from(
    { length: 81 },
    () => new Set(SUDOKU_NUMBERS)
  )
  const givens = grid.flatMap((square, idx) =>
    square.value ? [claim(idx, square.value)] : []
  )
  return { board, contradiction: propagate(board, givens).contradiction }
}

const isSolved = (board: Candidates) =>
  board.every((candidates) => candidates.size === 1)

const cloneCandidates = (board: Candidates): Candidates =>
  board.map((candidates) => new Set(candidates))

function mostConstrainedSquare(board: Candidates): number {
  let bestIdx = -1
  let fewestCandidates = 10
  for (let squareIdx = 0; squareIdx < 81; squareIdx++) {
    const candidateCount = board[squareIdx].size
    if (candidateCount > 1 && candidateCount < fewestCandidates) {
      bestIdx = squareIdx
      fewestCandidates = candidateCount
      if (candidateCount === 2) break
    }
  }
  return bestIdx
}

const contradictionCells = (contradiction: Contradiction): number[] =>
  contradiction.kind === 'cellEmptied'
    ? [contradiction.square]
    : contradiction.unit

function search(board: Candidates): GuessNode[] | null {
  if (isSolved(board)) return []

  const guessSquare = mostConstrainedSquare(board)
  if (guessSquare < 0) return null

  const rejected: Attempt[] = []
  for (const value of [...board[guessSquare]]) {
    const branch = cloneCandidates(board)
    const { pulses, contradiction } = propagate(branch, [
      claim(guessSquare, value),
    ])

    if (contradiction) {
      rejected.push({
        value,
        pulses,
        verdict: { kind: 'contradiction', cells: contradictionCells(contradiction) },
      })
      continue
    }

    const deeper = search(branch)
    if (deeper)
      return [
        { square: guessSquare, rejected, chosen: { value, pulses } },
        ...deeper,
      ]

    rejected.push({
      value,
      pulses,
      verdict: { kind: 'exhausted', cells: [mostConstrainedSquare(branch)] },
    })
  }

  return null
}

const RED = 'var(--color-red)'
const GREEN = 'var(--color-green)'
const YELLOW = 'var(--color-yellow)'
const BLUE = 'var(--color-blue)'

const THIRD_BEAT = BEAT_MS / 3

const cellIndices = (record: Record<number, unknown>) =>
  Object.keys(record).map(Number)

function pulseBeats(pulse: Pulse, color: string): Beat[] {
  const beats: Beat[] = [highlightValues([pulse.trigger], color)]
  if (pulse.evidence.length > 0)
    beats.push(highlightValues(pulse.evidence, BLUE))

  const fanned = cellIndices(pulse.removals).filter(
    (cell) => cell !== pulse.trigger
  )
  if (fanned.length > 0) beats.push(drawFan(pulse.trigger, fanned, color, THIRD_BEAT))

  beats.push(highlightNotes(pulse.removals, RED, THIRD_BEAT * 2))

  const settled = cellIndices(pulse.resolved)
  if (settled.length > 0) beats.push(highlightValues(settled, color, BEAT_MS))
  if (pulse.contradiction)
    beats.push(
      highlightValues(contradictionCells(pulse.contradiction), RED, BEAT_MS)
    )

  return beats
}

function pulseDelta(pulse: Pulse, commit: boolean): Record<number, CellDelta> {
  const delta: Record<number, CellDelta> = {}
  for (const [key, values] of Object.entries(pulse.removals))
    delta[Number(key)] = { removeNotes: values }
  if (commit)
    for (const [key, value] of Object.entries(pulse.resolved))
      delta[Number(key)] = { ...delta[Number(key)], setValue: value }
  return delta
}

function restoredNotes(pulses: Pulse[]): Record<number, SudokuNumber[]> {
  const restored: Record<number, Set<SudokuNumber>> = {}
  for (const pulse of pulses)
    for (const [key, values] of Object.entries(pulse.removals)) {
      const cell = Number(key)
      restored[cell] ??= new Set()
      for (const value of values) restored[cell].add(value)
    }
  return Object.fromEntries(
    Object.entries(restored).map(([cell, values]) => [cell, [...values]])
  )
}

const squareName = (idx: number) =>
  `R${Math.floor(idx / GRID_SIZE) + 1}C${(idx % GRID_SIZE) + 1}`

function unitName(unit: number[]): string {
  const [first] = unit
  const row = Math.floor(first / GRID_SIZE)
  const col = first % GRID_SIZE
  if (unit.every((cell) => Math.floor(cell / GRID_SIZE) === row))
    return `row ${row + 1}`
  if (unit.every((cell) => cell % GRID_SIZE === col))
    return `column ${col + 1}`
  return `box ${Math.floor(row / 3) * 3 + Math.floor(col / 3) + 1}`
}

const plural = (count: number, noun: string) =>
  `${count} ${noun}${count === 1 ? '' : 's'}`

function contradictionNote(contradiction: Contradiction): string {
  if (contradiction.kind === 'cellEmptied')
    return `${squareName(contradiction.square)} has no candidates left`
  return `${unitName(contradiction.unit)} has nowhere left to put ${contradiction.value}`
}

function pulseNote(pulse: Pulse, origin: boolean): string {
  const placement = `${squareName(pulse.trigger)} = ${pulse.value}`
  const because = origin
    ? 'assumed'
    : pulse.evidence.length > 0
      ? `only home for ${pulse.value} in ${unitName(pulse.evidence)}`
      : 'last candidate standing'
  const struck = Object.values(pulse.removals).reduce(
    (total, values) => total + values.length,
    0
  )
  const head = `${placement} (${because}) clears ${plural(struck, 'candidate')}`
  return pulse.contradiction
    ? `${head} — ${contradictionNote(pulse.contradiction)}`
    : head
}

const searchCue = (square: number) => `search-${square}`
const attemptCue = (square: number, value: SudokuNumber) =>
  `guess-${square}-${value}`
const chosenCue = (square: number) => `chosen-${square}`

function withCue(steps: SceneStep[], cue: string): SceneStep[] {
  if (steps.length === 0) return steps
  return [{ ...steps[0], cue }, ...steps.slice(1)]
}

function attemptSteps(square: number, attempt: Attempt): SceneStep[] {
  const steps: SceneStep[] = attempt.pulses.map((pulse, idx) => ({
    beats: pulseBeats(pulse, YELLOW),
    note: `Trying ${attempt.value} — ${pulseNote(pulse, idx === 0)}`,
    delta: pulseDelta(pulse, false),
  }))

  if (attempt.verdict.kind === 'exhausted')
    steps.push({
      beats: [highlightValues(attempt.verdict.cells, RED)],
      note: `${attempt.value} survives here but every value deeper in this line fails, stalling at ${squareName(attempt.verdict.cells[0])}`,
    })

  const restored = restoredNotes(attempt.pulses)
  if (Object.keys(restored).length > 0) {
    const delta: Record<number, CellDelta> = {}
    let count = 0
    for (const [key, values] of Object.entries(restored)) {
      delta[Number(key)] = { addNotes: values }
      count += values.length
    }
    steps.push({
      beats: [highlightNotes(restored, BLUE)],
      note: `Backtrack: ${plural(count, 'candidate')} removed by ${attempt.value} go back`,
      delta,
    })
  }

  return withCue(steps, attemptCue(square, attempt.value))
}

function nodeSteps(node: GuessNode): SceneStep[] {
  const chosen = node.chosen.pulses.map((pulse, idx) => ({
    beats: pulseBeats(pulse, GREEN),
    note: pulseNote(pulse, idx === 0),
    delta: pulseDelta(pulse, true),
  }))

  return [
    {
      beats: [highlightValues([node.square], YELLOW)],
      cue: searchCue(node.square),
      note: `${squareName(node.square)} has the fewest candidates left. Try each in turn.`,
    },
    ...node.rejected.flatMap((attempt) => attemptSteps(node.square, attempt)),
    ...withCue(chosen, chosenCue(node.square)),
  ]
}

function seedStep(grid: Square[], board: Candidates): SceneStep | null {
  const delta: Record<number, CellDelta> = {}
  for (let squareIdx = 0; squareIdx < 81; squareIdx++) {
    if (grid[squareIdx].value) continue

    const candidates = board[squareIdx]
    const notes = grid[squareIdx].notes
    const cell: CellDelta = {}

    const stale = [...notes].filter((note) => !candidates.has(note))
    if (stale.length > 0) cell.removeNotes = stale
    if (candidates.size === 1) {
      const [value] = candidates
      cell.setValue = value
    }

    if (Object.keys(cell).length > 0) delta[squareIdx] = cell
  }

  const forced = Object.values(delta).filter((cell) => cell.setValue).length
  return Object.keys(delta).length > 0
    ? {
        beats: [],
        note: `Givens propagated to their peers: ${plural(forced, 'cell')} forced outright.`,
        delta,
      }
    : null
}

function buildExplanation(spine: GuessNode[]): string {
  const base =
    'No known technique applies. Guess the most constrained cell, propagate each forced value to its peers one wave at a time, and backtrack on contradiction.'
  if (spine.length === 0) return base

  const sentences = spine.map((node) => {
    const square = `{{${searchCue(node.square)}|${squareName(node.square)}}}`
    const chosen = `{{${chosenCue(node.square)}|${node.chosen.value}}}`
    if (node.rejected.length === 0) return `${square}: ${chosen} held`
    const attempts = node.rejected
      .map(
        (attempt) =>
          `{{${attemptCue(node.square, attempt.value)}|${attempt.value}}}`
      )
      .join(', ')
    return `${square}: rejected ${attempts} before ${chosen} held`
  })
  return `${base}\nGuesses:\n${sentences.join('\n')}`
}

const DEAD_END_CUE = 'dead-end'

function unsolvableScene(cells: number[], reason: string): Scene {
  const pointer =
    cells.length > 0
      ? ` {{${DEAD_END_CUE}|${cells.map(squareName).join(', ')}}}`
      : ''
  return {
    title: 'Brute force (no solution)',
    explanation: `Brute force did not solve this puzzle — every line of play runs into a contradiction, so no completion exists.\n${reason}${pointer}`,
    steps: [
      {
        beats: [highlightValues(cells, RED)],
        note: reason,
        cue: DEAD_END_CUE,
      },
    ],
  }
}

function run(grid: Square[]): Scene | null {
  const conflicts = [...getErrors(grid)]
  if (conflicts.length > 0)
    return unsolvableScene(
      conflicts,
      'Two of the givens already break sudoku rules:'
    )

  const { board, contradiction } = seedFromGivens(grid)
  if (contradiction)
    return unsolvableScene(
      contradictionCells(contradiction),
      `Propagating the givens alone is enough to break the grid — ${contradictionNote(contradiction)}:`
    )

  const spine = search(board)
  if (!spine) {
    const stall = mostConstrainedSquare(board)
    return unsolvableScene(
      stall >= 0 ? [stall] : [],
      `Every value for ${squareName(stall)} was tried, and every line below each one dies:`
    )
  }

  const seed = seedStep(grid, board)
  const steps = [...(seed ? [seed] : []), ...spine.flatMap(nodeSteps)]
  if (steps.length === 0) return null

  return {
    title: 'Brute force',
    explanation: buildExplanation(spine),
    steps,
  }
}

const bruteForce: Technique = {
  name: 'Brute force',
  run,
}

export default bruteForce
