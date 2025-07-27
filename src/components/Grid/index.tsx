import { useGrid } from '../../contexts/GridContext'
import Square from './Square'

const generateBorders = (rowIndex: number, colIndex: number) => {
  return {
    top: rowIndex === 0 ? 'border-t-4' : rowIndex % 3 === 0 ? 'border-t-2' : '',
    left:
      colIndex === 0 ? 'border-l-4' : colIndex % 3 === 0 ? 'border-l-2' : '',
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
  }
}

export default function Grid() {
  const grid = useGrid()
  const { gridData } = grid
  return (
    <div
      role="grid"
      aria-label="Sudoku puzzle grid"
      aria-rowcount={9}
      aria-colcount={9}
      className="grid grid-rows-9 grid-cols-9 gap-0 min-w-[27rem] w-full max-w-[36rem] aspect-square mt-10"
    >
      {Array.from({ length: 9 }).map((_, rowIndex) => (
        <div key={rowIndex} role="row" className="contents">
          {Array.from({ length: 9 }).map((_, colIndex) => {
            const index = rowIndex * 9 + colIndex
            const { penMark, pencilMarks = [] } = gridData[index] ?? {}
            return (
              <Square
                key={`${rowIndex}-${colIndex}`}
                mode={penMark ? 'pen' : 'pencil'}
                pencilMarks={pencilMarks}
                penMark={penMark}
                borders={generateBorders(rowIndex, colIndex)}
                aria-rowindex={rowIndex + 1}
                aria-colindex={colIndex + 1}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}
