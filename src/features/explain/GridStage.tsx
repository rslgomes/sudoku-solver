import SudokuGrid, { Notes } from '@shared/components/SudokuGrid'
import { useStageContext } from './contexts/stageContext'

export default function GridStage() {
  const { board, registerCell } = useStageContext()
  return (
    <SudokuGrid
      ariaLabel="Solution"
      cellProps={(i) => ({ ref: (el) => registerCell(i, el) })}
      renderCell={(i) => {
        const sq = board[i]
        if (sq.value)
          return (
            <span className="flex h-full w-full items-center justify-center text-xl text-fg">
              {sq.value}
            </span>
          )
        return <Notes notes={sq.notes} />
      }}
    />
  )
}
