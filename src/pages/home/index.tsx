import PlayableGrid from '../../shared/components/PlayableGrid'
import { GridContext } from '../../shared/components/PlayableGrid/contexts/gridContext'
import MainLayout from '../../shared/layouts/MainLayout'
import type {
  Square,
  SudokuNumber,
} from '../../shared/components/PlayableGrid/types'
import { usePadActions } from '@shared/components/PlayableGrid/hooks/usePadActions'
import {
  ConfigContext,
  useConfigContext,
} from '@shared/components/PlayableGrid/contexts/configContext'
import ConfigMenu from '@shared/components/ConfigMenu'
import Timer from '@shared/components/Timer'

const getEmptyBoard = (): Square[] =>
  Array.from({ length: 81 }, () => ({
    value: null as null,
    notes: new Set<SudokuNumber>(),
    color: null,
    locked: false,
  }))

export default function HomePage() {
  const config = useConfigContext()
  return (
    <ConfigContext.Provider value={config}>
      <GridProvider />
    </ConfigContext.Provider>
  )
}

// Separate component so usePadActions (which reads ConfigContext) runs
// *inside* the provider above.
function GridProvider() {
  const padActions = usePadActions({ initialGrid: getEmptyBoard() })
  return (
    <GridContext.Provider value={padActions}>
      <MainLayout header={<ConfigMenu />} footer={<Timer />}>
        <PlayableGrid />
      </MainLayout>
    </GridContext.Provider>
  )
}
