import { useReducer, useCallback } from 'react'
import type { Move, Square, SudokuNumber } from '../types'

const GRID_SIZE = 81
const HISTORY_LIMIT = 100

const getEmptySquare = (): Square => ({
  value: null,
  notes: new Set(),
  color: null,
  locked: false,
})

const getEmptyGrid = (): Square[] =>
  Array.from({ length: GRID_SIZE }, getEmptySquare)

interface State {
  grid: Square[]
  history: Square[][]
  initialGrid: Square[]
}

type Action =
  | { type: 'move'; move: Move; jailBreak?: boolean; destructive?: boolean }
  | { type: 'fill'; squares: Square[]; lockFilled?: boolean }
  | { type: 'clear' }
  | { type: 'undo' }
  | { type: 'reset' }

const pushHistory = (state: State, nextGrid: Square[]): State => {
  if (nextGrid === state.grid) return state
  const history = [...state.history, state.grid]
  const initialGrid = [...state.initialGrid]
  if (history.length > HISTORY_LIMIT) history.shift()
  return { grid: nextGrid, history, initialGrid }
}

const notesEqual = (a: Set<SudokuNumber>, b: Set<SudokuNumber>): boolean => {
  if (a.size !== b.size) return false
  for (const n of a) if (!b.has(n)) return false
  return true
}

const squaresEqual = (a: Square, b: Square): boolean =>
  a.value === b.value &&
  a.color === b.color &&
  a.locked === b.locked &&
  notesEqual(a.notes, b.notes)

const applyMove = (
  grid: Square[],
  move: Move,
  jailBreak: boolean,
  destructive?: boolean
): Square[] => {
  if (move.targets.size === 0) return grid

  const targets = [...move.targets]
  const editable =
    move.mode === 'paint' || move.mode === 'lock'
      ? targets
      : targets.filter((t) => jailBreak || !grid[t].locked)

  if (editable.length === 0) return grid

  const next = [...grid]

  switch (move.mode) {
    case 'pen': {
      const isRemove =
        destructive || editable.every((t) => next[t].value === move.data)
      for (const t of editable) {
        next[t] = { ...next[t], value: isRemove ? null : move.data }
      }
      break
    }

    case 'pencil': {
      const marks = [...move.data].map((mark) => ({
        mark,
        isRemove: destructive || editable.every((t) => next[t].notes.has(mark)),
      }))
      for (const t of editable) {
        const notes = new Set(next[t].notes)
        for (const { mark, isRemove } of marks) {
          if (isRemove) notes.delete(mark)
          else notes.add(mark)
        }
        next[t] = { ...next[t], notes }
      }
      break
    }

    case 'eraser': {
      for (const t of editable) {
        next[t] = { ...next[t], value: null, notes: new Set() }
      }
      break
    }

    case 'lock': {
      const shouldLock = move.data ?? !editable.every((t) => next[t].locked)
      for (const t of editable) {
        next[t] = { ...next[t], locked: shouldLock }
      }
      break
    }

    case 'paint': {
      for (const t of editable) {
        next[t] = { ...next[t], color: move.data }
      }
      break
    }
  }

  // Drop no-op moves so they never reach history (erase empty cell, paint
  // same color, re-lock...). Only the touched cells can differ.
  const changed = editable.some((t) => !squaresEqual(grid[t], next[t]))
  return changed ? next : grid
}

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'move': {
      const nextGrid = applyMove(
        state.grid,
        action.move,
        action.jailBreak ?? false
      )
      return pushHistory(state, nextGrid)
    }
    case 'fill': {
      const nextGrid = action.lockFilled
        ? action.squares.map((sq) => ({
            ...sq,
            locked: sq.value !== null,
          }))
        : action.squares
      return { grid: nextGrid, history: [], initialGrid: nextGrid }
    }
    case 'clear': {
      return pushHistory(state, getEmptyGrid())
    }
    case 'undo': {
      if (state.history.length === 0) return state
      const history = [...state.history]
      const initialGrid = state.initialGrid
      const previous = history.pop()!
      return { grid: previous, history, initialGrid }
    }
    case 'reset': {
      return {
        grid: state.initialGrid,
        history: [],
        initialGrid: state.initialGrid,
      }
    }
  }
}

const init = (initial?: Square[]): State => ({
  grid: initial ?? getEmptyGrid(),
  history: [],
  initialGrid: initial ?? getEmptyGrid(),
})

export default function usePlay(initial?: Square[]) {
  const [state, dispatch] = useReducer(reducer, initial, init)

  const handleMove = useCallback(
    (move: Move, ops?: { jailBreak?: boolean; destructive?: boolean }) => {
      const { jailBreak = false, destructive = false } = ops ?? {}
      dispatch({ type: 'move', move, jailBreak, destructive })
    },
    []
  )

  const fillGrid = useCallback((squares: Square[], lockFilled = true) => {
    dispatch({ type: 'fill', squares, lockFilled })
  }, [])

  const clearGrid = useCallback(() => {
    dispatch({ type: 'clear' })
  }, [])

  const undo = useCallback(() => {
    dispatch({ type: 'undo' })
  }, [])

  const reset = useCallback(() => {
    dispatch({ type: 'reset' })
  }, [])

  return {
    grid: state.grid,
    handleMove,
    fillGrid,
    clearGrid,
    undo,
    reset,
    canUndo: state.history.length > 0,
  }
}
