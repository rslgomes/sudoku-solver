import { useReducer, useCallback } from 'react'
import type { Move, Square } from './types'

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
}

type Action =
  | { type: 'move'; move: Move; jailBreak?: boolean }
  | { type: 'fill'; squares: Square[]; lockFilled?: boolean }
  | { type: 'clear' }
  | { type: 'undo' }

const pushHistory = (state: State, nextGrid: Square[]): State => {
  if (nextGrid === state.grid) return state
  const history = [...state.history, state.grid]
  if (history.length > HISTORY_LIMIT) history.shift()
  return { grid: nextGrid, history }
}

const applyMove = (
  grid: Square[],
  move: Move,
  jailBreak: boolean
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
      const isRemove = editable.every((t) => next[t].value === move.data)
      for (const t of editable) {
        next[t] = { ...next[t], value: isRemove ? null : move.data }
      }
      return next
    }

    case 'pencil': {
      const marks = [...move.data].map((mark) => ({
        mark,
        isRemove: editable.every((t) => next[t].notes.has(mark)),
      }))
      for (const t of editable) {
        const notes = new Set(next[t].notes)
        for (const { mark, isRemove } of marks) {
          if (isRemove) notes.delete(mark)
          else notes.add(mark)
        }
        next[t] = { ...next[t], notes }
      }
      return next
    }

    case 'eraser': {
      for (const t of editable) {
        next[t] = { ...next[t], value: null, notes: new Set() }
      }
      return next
    }

    case 'lock': {
      const shouldLock = move.data ?? !editable.every((t) => next[t].locked)
      for (const t of editable) {
        next[t] = { ...next[t], locked: shouldLock }
      }
      return next
    }

    case 'paint': {
      for (const t of editable) {
        next[t] = { ...next[t], color: move.data }
      }
      return next
    }
  }
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
      return { grid: nextGrid, history: [] }
    }
    case 'clear': {
      return pushHistory(state, getEmptyGrid())
    }
    case 'undo': {
      if (state.history.length === 0) return state
      const history = [...state.history]
      const previous = history.pop()!
      return { grid: previous, history }
    }
  }
}

const init = (initial?: Square[]): State => ({
  grid: initial ?? getEmptyGrid(),
  history: [],
})

export default function usePlay(initial?: Square[]) {
  const [state, dispatch] = useReducer(reducer, initial, init)

  const handleMove = useCallback((move: Move, jailBreak = false) => {
    dispatch({ type: 'move', move, jailBreak })
  }, [])

  const fillGrid = useCallback((squares: Square[], lockFilled = true) => {
    dispatch({ type: 'fill', squares, lockFilled })
  }, [])

  const clearGrid = useCallback(() => {
    dispatch({ type: 'clear' })
  }, [])

  const undo = useCallback(() => {
    dispatch({ type: 'undo' })
  }, [])

  return {
    grid: state.grid,
    handleMove,
    fillGrid,
    clearGrid,
    undo,
    canUndo: state.history.length > 0,
  }
}
