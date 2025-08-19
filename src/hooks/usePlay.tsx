import { useCallback, useMemo } from 'react'
import { useGrid } from '../contexts/GridContext'
import type { CellData } from '../libs/types'

type TypeValueMap = {
  pen: number
  pencil: number
  clear: undefined
  lock: boolean | undefined
  color: string
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
  clear?: boolean
  lock?: boolean
}

const NO_NUMBER_SQUARE: Pick<CellData, 'penMark' | 'pencilMarks'> = {
  penMark: undefined,
  pencilMarks: [],
}

export default function usePlay() {
  const { gridData, setGridData } = useGrid()

  const clearGrid = () => {
    const newGridData = gridData.map(() => ({
      ...NO_NUMBER_SQUARE,
      locked: false,
      customBgColor: undefined,
    }))
    setGridData(newGridData)
  }

  const squareHandlers = useMemo(() => {
    const clearSquare = (square: CellData) => ({
      ...square,
      ...NO_NUMBER_SQUARE,
    })

    const updatePenMark = (square: CellData, value?: number): CellData => {
      if (value === undefined) return { ...square, penMark: undefined }
      const willRemove = square.penMark === value
      return { ...square, penMark: willRemove ? undefined : value }
    }

    const updatePencilMark = (square: CellData, value?: number): CellData => {
      if (value === undefined) return { ...square, pencilMarks: [] }
      const { pencilMarks } = square
      const willRemove = pencilMarks.includes(value)
      return {
        ...square,
        pencilMarks: willRemove
          ? pencilMarks.filter((mark) => mark !== value)
          : [...pencilMarks, value],
      }
    }

    const updateBgColor = (square: CellData, value?: string): CellData => {
      if (value === undefined) return { ...square, customBgColor: undefined }
      const willRemove = square.customBgColor === value || value === 'none'
      return { ...square, customBgColor: willRemove ? undefined : value }
    }

    const handleLock = (square: CellData, value?: boolean): CellData => {
      if (value === undefined) return { ...square, locked: !square.locked }
      return { ...square, locked: value }
    }

    const map = {
      pen: updatePenMark,
      pencil: updatePencilMark,
      color: updateBgColor,
      lock: handleLock,
      clear: clearSquare,
    }

    return map
  }, [])

  const makeMove = useCallback(
    (move: Move) => {
      const { index: moveIndex, mode, value } = move
      const square = gridData[moveIndex]

      if (square.locked && !(mode === 'lock' || mode === 'color')) return

      const newSquare =
        mode === 'clear'
          ? squareHandlers.clear(square)
          : squareHandlers[mode](square, value as never)

      const newGridData = gridData.map((cell, cellIndex) =>
        moveIndex === cellIndex ? newSquare : cell
      )

      setGridData(newGridData)
    },
    [squareHandlers, gridData, setGridData]
  )

  const makeMoves = useCallback(
    (moves: Move[]) => {
      const moveSetPerCell = new Map<number, MoveSet>()

      for (const { mode, value, index } of moves) {
        const matchMoveSet = moveSetPerCell.get(index) ?? {}

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
            const current = matchMoveSet.pencil ?? []
            const v = value as number
            matchMoveSet.pencil = current.includes(v)
              ? current
              : [...current, v]
            break
          }
          case 'color':
            matchMoveSet.color = value as string
            break
          case 'lock':
            matchMoveSet.lock = value as boolean
            break
        }

        moveSetPerCell.set(index, matchMoveSet)
      }

      const newGridData = gridData.map((originalSquare, idx) => {
        const moveSet = moveSetPerCell.get(idx)
        if (!moveSet) return originalSquare
        if (moveSet.clear) return squareHandlers.clear(originalSquare)

        const treatAsUnlocked =
          moveSet.lock !== undefined || !originalSquare.locked

        const { pen, pencil, color, lock } = moveSet

        const moveList: Move[] = []
        if (treatAsUnlocked && pen !== undefined) {
          moveList.push({ mode: 'pen', value: pen, index: idx })
        }
        if (treatAsUnlocked && pencil && pencil.length) {
          for (const mark of pencil) {
            moveList.push({ mode: 'pencil', value: mark, index: idx })
          }
        }
        if (color !== undefined) {
          moveList.push({ mode: 'color', value: color, index: idx })
        }
        if (lock !== undefined)
          moveList.push({ mode: 'lock', value: lock, index: idx })

        return moveList.reduce((accSquare, mv) => {
          if (mv.mode === 'clear') return squareHandlers.clear(accSquare)
          return squareHandlers[mv.mode](accSquare, mv.value as never)
        }, originalSquare)
      })

      setGridData(newGridData)
    },
    [squareHandlers, gridData, setGridData]
  )

  return {
    makeMove,
    makeMoves,
    clearGrid,
  }
}
