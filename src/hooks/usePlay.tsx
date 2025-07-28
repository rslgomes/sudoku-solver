import { useCallback, useMemo } from 'react'
import { useGrid } from '../contexts/GridContext'
import type { CellData } from '../libs/types'

type TypeValueMap = {
  pen: number
  pencil: number
  color: string
  clear: undefined
}

export type Move = {
  [K in keyof TypeValueMap]: {
    mode: K
    index: number
    value: TypeValueMap[K]
  }
}[keyof TypeValueMap]

type MoveSet = {
  pen?: number
  pencil?: number[]
  color?: string
  clear: boolean
}

const EMPTY_SQUARE: CellData = {
  penMark: undefined,
  pencilMarks: [],
}

export default function usePlay() {
  const { gridData, setGridData } = useGrid()

  const clearSquare = () => EMPTY_SQUARE

  const updatePenMark = (square: CellData, value?: number): CellData => {
    if (!value) return EMPTY_SQUARE
    const willRemove = square.penMark === value
    return { ...square, penMark: willRemove ? undefined : value }
  }

  const updatePencilMark = (square: CellData, value?: number): CellData => {
    if (!value) return EMPTY_SQUARE
    const { pencilMarks } = square
    const willRemove = pencilMarks.includes(value)
    return {
      ...square,
      pencilMarks: willRemove
        ? pencilMarks.filter((mark) => mark !== value)
        : [...pencilMarks, value],
    }
  }

  const updateColor = (square: CellData, value?: string): CellData => {
    if (!value) return EMPTY_SQUARE
    const willRemove = square.color === value
    return { ...square, color: willRemove ? undefined : value }
  }

  const handlers = useMemo(() => {
    const map = {
      pen: updatePenMark,
      pencil: updatePencilMark,
      color: updateColor,
    }

    return map
  }, [])

  const makeMove = useCallback(
    (move: Move) => {
      const { index: moveIndex, mode, value } = move
      const square = gridData[moveIndex]
      if (!square) return

      const newSquare =
        mode === 'clear'
          ? clearSquare()
          : handlers[mode](square, value as never)

      const newGridData = gridData.map((cell, cellIndex) =>
        moveIndex === cellIndex ? newSquare : cell
      )

      setGridData(newGridData)
    },
    [handlers, gridData, setGridData]
  )

  const makeMoves = useCallback(
    (moves: Move[]) => {
      const moveSetPerCell = new Map<number, MoveSet>()

      for (const { mode, value, index } of moves) {
        const matchMoveSet = moveSetPerCell.get(index) || { clear: false }
        if (matchMoveSet.clear) continue

        if (mode === 'clear') {
          moveSetPerCell.set(index, { clear: true })
          continue
        }

        switch (mode) {
          case 'pen':
            matchMoveSet.pen = value as number
            break
          case 'pencil': {
            const currentPencilMarks = matchMoveSet.pencil ?? []
            matchMoveSet.pencil = [...new Set([...currentPencilMarks, value])]
            break
          }
          case 'color':
            matchMoveSet.color = value as string
            break
        }

        moveSetPerCell.set(index, matchMoveSet)
      }

      const newGridData = gridData.map((originalSquare, idx) => {
        const moveSet = moveSetPerCell.get(idx)
        if (!moveSet) return originalSquare
        if (moveSet.clear) return clearSquare()

        const { pen, pencil, color } = moveSet

        const moveList: Move[] = [
          pen && { mode: 'pen', value: pen, index: idx },
          color && { mode: 'color', value: color, index: idx },
          ...(pencil?.map(
            (mark): Move => ({ mode: 'pencil', value: mark, index: idx })
          ) ?? []),
        ].filter(Boolean) as Move[]

        return moveList.reduce((accSquare, move) => {
          if (move.mode === 'clear') return clearSquare()
          return handlers[move.mode](accSquare, move.value as never)
        }, originalSquare)
      })

      setGridData(newGridData)
    },
    [handlers, gridData, setGridData]
  )

  return {
    makeMove,
    makeMoves,
  }
}
