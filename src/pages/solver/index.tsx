import {
  ConfigContext,
  useConfigContext,
} from '@shared/components/PlayableGrid/contexts/configContext'
import { GridContext } from '@shared/components/PlayableGrid/contexts/gridContext'
import { usePadActions } from '@shared/components/PlayableGrid/hooks/usePadActions'
import type {
  Square,
  SudokuNumber,
} from '@shared/components/PlayableGrid/types'
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
      <SolverGrid />
    </ConfigContext.Provider>
  )
}

function SolverGrid() {
  const padActions = usePadActions({ initialGrid: getEmptyBoard() })
  return (
    <GridContext.Provider value={padActions}>
      <MainLayout>
        <div>Solver</div>
      </MainLayout>
    </GridContext.Provider>
  )
}
