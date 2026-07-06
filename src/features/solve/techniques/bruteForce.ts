// Constraint propagation + MRV search, after Peter Norvig,
// "Solving Every Sudoku Puzzle" (https://norvig.com/sudoku.html).
import {
  PEERS,
  UNITS,
  SUDOKU_NUMBERS,
  type Square,
  type SudokuNumber,
} from '@shared/sudoku'
import type { Technique } from '../types'
import type { Beat, CellDelta, Scene, SceneStep } from '@features/explain/types'
import { BEAT_MS, drawPolyline, highlightValues } from '@features/explain/lib/atoms'

export type Contradiction =
  | { kind: 'cellEmptied'; square: number }
  | { kind: 'valueTrapped'; unit: number[]; value: SudokuNumber }

export type PropagationEvent =
  | { kind: 'nakedSingle'; square: number; value: SudokuNumber }
  | { kind: 'hiddenSingle'; square: number; value: SudokuNumber; unit: number[] }

export type PolylineTerminal =
  | { kind: 'dead'; square: number }
  | { kind: 'branch'; square: number }
  | { kind: 'solved' }

export type Polyline = {
  origin: { square: number; value: SudokuNumber }
  events: PropagationEvent[]
  terminal: PolylineTerminal
}

export type DoomedLayer = { polylines: Polyline[] }

export type DoomedAttempt = {
  value: SudokuNumber
  layers: DoomedLayer[]
}

export type GuessNode = {
  square: number
  candidates: SudokuNumber[]
  doomed: DoomedAttempt[]
  chosen: { value: SudokuNumber; cascade: Polyline }
}

export type BruteForceScene = Scene & { spine: GuessNode[] }

type Candidates = Set<SudokuNumber>[]

type Trace = { events: PropagationEvent[]; contradiction: Contradiction | null }

const freshTrace = (): Trace => ({ events: [], contradiction: null })

function eliminate(
  boardCandidates: Candidates,
  squareIdx: number,
  value: SudokuNumber,
  trace: Trace
): boolean {
  const candidates = boardCandidates[squareIdx]
  if (!candidates.has(value)) return true
  candidates.delete(value)

  if (candidates.size === 0) {
    trace.contradiction = { kind: 'cellEmptied', square: squareIdx }
    return false
  }

  if (candidates.size === 1) {
    const [soleCandidate] = candidates
    trace.events.push({
      kind: 'nakedSingle',
      square: squareIdx,
      value: soleCandidate,
    })
    for (const peerIdx of PEERS[squareIdx]) {
      if (!eliminate(boardCandidates, peerIdx, soleCandidate, trace)) return false
    }
  }

  for (const unit of UNITS[squareIdx]) {
    const homesForValue = unit.filter((cell) => boardCandidates[cell].has(value))
    if (homesForValue.length === 0) {
      trace.contradiction = { kind: 'valueTrapped', unit, value }
      return false
    }
    if (homesForValue.length === 1 && boardCandidates[homesForValue[0]].size > 1) {
      trace.events.push({
        kind: 'hiddenSingle',
        square: homesForValue[0],
        value,
        unit,
      })
      if (!assign(boardCandidates, homesForValue[0], value, trace)) return false
    }
  }

  return true
}

function assign(
  boardCandidates: Candidates,
  squareIdx: number,
  value: SudokuNumber,
  trace: Trace
): boolean {
  for (const otherCandidate of [...boardCandidates[squareIdx]]) {
    if (otherCandidate === value) continue
    if (!eliminate(boardCandidates, squareIdx, otherCandidate, trace)) return false
  }
  return true
}

function seedFromGivens(grid: Square[]): Candidates | null {
  const boardCandidates: Candidates = Array.from(
    { length: 81 },
    () => new Set(SUDOKU_NUMBERS)
  )
  for (let squareIdx = 0; squareIdx < 81; squareIdx++) {
    const givenValue = grid[squareIdx].value
    if (
      givenValue &&
      !assign(boardCandidates, squareIdx, givenValue, freshTrace())
    )
      return null
  }
  return boardCandidates
}

const isSolved = (boardCandidates: Candidates) =>
  boardCandidates.every((candidates) => candidates.size === 1)

const cloneCandidates = (boardCandidates: Candidates): Candidates =>
  boardCandidates.map((candidates) => new Set(candidates))

function mostConstrainedSquare(boardCandidates: Candidates): number {
  let bestIdx = -1
  let fewestCandidates = 10
  for (let squareIdx = 0; squareIdx < 81; squareIdx++) {
    const candidateCount = boardCandidates[squareIdx].size
    if (candidateCount > 1 && candidateCount < fewestCandidates) {
      bestIdx = squareIdx
      fewestCandidates = candidateCount
      if (candidateCount === 2) break
    }
  }
  return bestIdx
}

const contradictionSquare = (contradiction: Contradiction): number =>
  contradiction.kind === 'cellEmptied' ? contradiction.square : contradiction.unit[0]

function makePolyline(
  origin: Polyline['origin'],
  events: PropagationEvent[],
  terminal: PolylineTerminal
): Polyline {
  const seen = new Set([`${origin.square}:${origin.value}`])
  const resolutions: PropagationEvent[] = []
  for (const event of events) {
    const key = `${event.square}:${event.value}`
    if (seen.has(key)) continue
    seen.add(key)
    resolutions.push(event)
  }
  return { origin, events: resolutions, terminal }
}

function zipConcat(lists: DoomedLayer[][]): DoomedLayer[] {
  const depth = lists.reduce((max, list) => Math.max(max, list.length), 0)
  return Array.from({ length: depth }, (_, layerIdx) => ({
    polylines: lists.flatMap((list) => list[layerIdx]?.polylines ?? []),
  }))
}

function doomedLayers(boardCandidates: Candidates): DoomedLayer[] {
  const guessSquare = mostConstrainedSquare(boardCandidates)
  const layer0: Polyline[] = []
  const deeper: DoomedLayer[][] = []

  for (const guessValue of boardCandidates[guessSquare]) {
    const branch = cloneCandidates(boardCandidates)
    const trace = freshTrace()
    const origin = { square: guessSquare, value: guessValue }

    if (!assign(branch, guessSquare, guessValue, trace)) {
      layer0.push(
        makePolyline(origin, trace.events, {
          kind: 'dead',
          square: contradictionSquare(trace.contradiction!),
        })
      )
    } else {
      layer0.push(
        makePolyline(origin, trace.events, {
          kind: 'branch',
          square: mostConstrainedSquare(branch),
        })
      )
      deeper.push(doomedLayers(branch))
    }
  }

  return [{ polylines: layer0 }, ...zipConcat(deeper)]
}

function newlyPlaced(
  before: Candidates,
  after: Candidates
): Record<number, CellDelta> {
  const delta: Record<number, CellDelta> = {}
  for (let squareIdx = 0; squareIdx < 81; squareIdx++) {
    if (before[squareIdx].size > 1 && after[squareIdx].size === 1) {
      const [value] = after[squareIdx]
      delta[squareIdx] = { setValue: value }
    }
  }
  return delta
}

const RED = 'var(--color-red)'
const GREEN = 'var(--color-green)'
const YELLOW = 'var(--color-yellow)'

function polylinePath(polyline: Polyline): number[] {
  const path = [polyline.origin.square, ...polyline.events.map((e) => e.square)]
  if (polyline.terminal.kind !== 'solved') path.push(polyline.terminal.square)
  return path.filter((square, idx, arr) => idx === 0 || square !== arr[idx - 1])
}

function doomedBeats(attempt: DoomedAttempt): Beat[] {
  const beats: Beat[] = []
  attempt.layers.forEach((layer, layerIdx) => {
    const delay = layerIdx * BEAT_MS
    for (const polyline of layer.polylines) {
      const path = polylinePath(polyline)
      if (path.length > 1) beats.push(drawPolyline(path, RED, delay))
      if (polyline.terminal.kind === 'dead')
        beats.push(
          highlightValues([polyline.terminal.square], RED, delay + BEAT_MS / 2)
        )
      if (polyline.terminal.kind === 'branch')
        beats.push(
          highlightValues([polyline.terminal.square], YELLOW, delay + BEAT_MS / 2)
        )
    }
  })
  return beats
}

function chosenBeats(node: GuessNode): Beat[] {
  const beats: Beat[] = [highlightValues([node.square], GREEN)]
  const path = polylinePath(node.chosen.cascade)
  if (path.length > 1) beats.push(drawPolyline(path, GREEN, BEAT_MS / 2))
  return beats
}

const searchCue = (square: number) => `search-${square}`
const attemptCue = (square: number, value: SudokuNumber) =>
  `guess-${square}-${value}`
const chosenCue = (square: number) => `chosen-${square}`

type SearchResult = { steps: SceneStep[]; spine: GuessNode[] }

function search(boardCandidates: Candidates): SearchResult | null {
  if (isSolved(boardCandidates)) return { steps: [], spine: [] }

  const guessSquare = mostConstrainedSquare(boardCandidates)
  const candidates = [...boardCandidates[guessSquare]]
  const doomed: DoomedAttempt[] = []

  for (const guessValue of candidates) {
    const branch = cloneCandidates(boardCandidates)
    const trace = freshTrace()
    const origin = { square: guessSquare, value: guessValue }

    if (!assign(branch, guessSquare, guessValue, trace)) {
      doomed.push({
        value: guessValue,
        layers: [
          {
            polylines: [
              makePolyline(origin, trace.events, {
                kind: 'dead',
                square: contradictionSquare(trace.contradiction!),
              }),
            ],
          },
        ],
      })
      continue
    }

    const deeper = search(branch)
    if (deeper) {
      const terminal: PolylineTerminal =
        deeper.spine.length > 0
          ? { kind: 'branch', square: deeper.spine[0].square }
          : { kind: 'solved' }
      const node: GuessNode = {
        square: guessSquare,
        candidates,
        doomed,
        chosen: {
          value: guessValue,
          cascade: makePolyline(origin, trace.events, terminal),
        },
      }
      const delta = newlyPlaced(boardCandidates, branch)
      const searchStep: SceneStep = {
        beats: [highlightValues([guessSquare], YELLOW)],
        cue: searchCue(guessSquare),
      }
      const doomedSteps: SceneStep[] = doomed.map((attempt) => ({
        beats: doomedBeats(attempt),
        cue: attemptCue(guessSquare, attempt.value),
      }))
      return {
        steps: [
          searchStep,
          ...doomedSteps,
          { beats: chosenBeats(node), delta, cue: chosenCue(guessSquare) },
          ...deeper.steps,
        ],
        spine: [node, ...deeper.spine],
      }
    }

    doomed.push({
      value: guessValue,
      layers: [
        {
          polylines: [
            makePolyline(origin, trace.events, {
              kind: 'branch',
              square: mostConstrainedSquare(branch),
            }),
          ],
        },
        ...doomedLayers(branch),
      ],
    })
  }

  return null
}

function run(grid: Square[]): BruteForceScene | null {
  const boardCandidates = seedFromGivens(grid)
  if (!boardCandidates) return null

  const steps: SceneStep[] = []

  const forcedByGivens: Record<number, CellDelta> = {}
  for (let squareIdx = 0; squareIdx < 81; squareIdx++) {
    if (!grid[squareIdx].value && boardCandidates[squareIdx].size === 1) {
      const [value] = boardCandidates[squareIdx]
      forcedByGivens[squareIdx] = { setValue: value }
    }
  }
  if (Object.keys(forcedByGivens).length > 0)
    steps.push({ beats: [], delta: forcedByGivens })

  const result = search(boardCandidates)
  if (!result) return null
  steps.push(...result.steps)

  if (steps.length === 0) return null

  return {
    title: 'Brute force',
    explanation: buildExplanation(result.spine),
    steps,
    spine: result.spine,
  }
}

const squareName = (idx: number) =>
  `R${Math.floor(idx / 9) + 1}C${(idx % 9) + 1}`

function buildExplanation(spine: GuessNode[]): string {
  const base =
    'No known technique applies. Guess the most constrained cell, propagate forced values, and backtrack on contradiction.'
  if (spine.length === 0) return base

  const sentences = spine.map((node) => {
    const square = `{{${searchCue(node.square)}|${squareName(node.square)}}}`
    const chosen = `{{${chosenCue(node.square)}|${node.chosen.value}}}`
    if (node.doomed.length === 0) return `${square}: ${chosen} held`
    const attempts = node.doomed
      .map(
        (attempt) =>
          `{{${attemptCue(node.square, attempt.value)}|${attempt.value}}}`
      )
      .join(', ')
    return `${square}: rejected ${attempts} before ${chosen} held`
  })
  return `${base}\nGuesses:\n${sentences.join('\n')}`
}

const bruteForce: Technique = {
  name: 'Brute force',
  run,
}

export default bruteForce
