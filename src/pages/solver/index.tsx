import {
  ConfigContext,
  useConfigContext,
} from '@features/play/contexts/playSettings'
import { ControllerContext } from '@features/play/contexts/controllerContext'
import { useControllerOrchestrator } from '@features/play/hooks/useControllerOrchestrator'
import type { Square, SudokuNumber } from '@features/play/types'
import NewPuzzleButton from '@features/play/widgets/NewPuzzleButton'
import MainLayout from '@shared/layouts/MainLayout'

const getEmptyBoard = (): Square[] =>
  Array.from({ length: 81 }, () => ({
    value: null as null,
    notes: new Set<SudokuNumber>(),
    color: null,
    locked: false,
  }))

export default function SolvePage() {
  const config = useConfigContext()
  return (
    <ConfigContext.Provider value={config}>
      <MainProvider />
    </ConfigContext.Provider>
  )
}

function MainProvider() {
  const controller = useControllerOrchestrator({ initialGrid: getEmptyBoard() })
  return (
    <ControllerContext.Provider value={controller}>
      <MainLayout actions={<NewPuzzleButton />}>
        <div>Solver</div>
      </MainLayout>
    </ControllerContext.Provider>
  )
}
