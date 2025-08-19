import { forwardRef, memo, useMemo } from 'react'
import { useGrid } from '../../contexts/GridContext'
import Square from './Square'

const generateBorders = (rowIndex: number, colIndex: number) => ({
  top: rowIndex === 0 ? 'border-t-4' : rowIndex % 3 === 0 ? 'border-t-2' : '',
  left: colIndex === 0 ? 'border-l-4' : colIndex % 3 === 0 ? 'border-l-2' : '',
  right:
    colIndex === 8
      ? 'border-r-4'
      : (colIndex + 1) % 3 === 0
        ? 'border-r-2'
        : '',
  bottom:
    rowIndex === 8
      ? 'border-b-4'
      : (rowIndex + 1) % 3 === 0
        ? 'border-b-2'
        : '',
})

interface GridProps {
  onSelect: (indices: number[]) => void
  selection: number[]
}

const Grid = memo(
  forwardRef<HTMLDivElement, GridProps>(function Grid(
    { onSelect, selection },
    ref
  ) {
    const { gridData } = useGrid()
    const selectionSet = useMemo(() => new Set(selection), [selection])

    return (
      <div
        ref={ref}
        role="grid"
        aria-label="Sudoku puzzle grid"
        aria-rowcount={9}
        aria-colcount={9}
        className="grid grid-rows-9 grid-cols-9 gap-0 min-w-[30rem] w-full max-w-[36rem] aspect-square"
      >
        {Array.from({ length: 9 }).map((_, rowIndex) => (
          <div key={rowIndex} role="row" className="contents">
            {Array.from({ length: 9 }).map((_, colIndex) => {
              const index = rowIndex * 9 + colIndex
              const {
                penMark,
                pencilMarks = [],
                locked = false,
                customBgColor,
              } = gridData[index] ?? {}
              return (
                <Square
                  key={index}
                  mode={penMark ? 'pen' : 'pencil'}
                  pencilMarks={pencilMarks}
                  penMark={penMark}
                  borders={generateBorders(rowIndex, colIndex)}
                  isSelected={selectionSet.has(index)}
                  locked={locked}
                  onClick={() => {
                    onSelect([index])
                  }}
                  customBgColor={customBgColor}
                  aria-rowindex={rowIndex + 1}
                  aria-colindex={colIndex + 1}
                />
              )
            })}
          </div>
        ))}
      </div>
    )
  })
)

Grid.displayName = 'Grid'
export default Grid
