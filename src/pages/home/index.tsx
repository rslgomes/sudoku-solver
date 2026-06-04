import { useEffect, useRef } from 'react'
import { useLocation } from '@tanstack/react-router'
import PlayableGrid from '../../shared/components/PlayableGrid'
import { GridContext } from '../../shared/components/PlayableGrid/contexts/gridContext'
import MainLayout from '../../shared/layouts/MainLayout'
import type {
  Square,
  SudokuNumber,
} from '../../shared/components/PlayableGrid/types'
import { usePadActions } from '@shared/components/PlayableGrid/hooks/usePadActions'
import { parseGrid } from '@shared/libs/gridCodec'
import {
  ConfigContext,
  useConfigContext,
} from '@shared/components/PlayableGrid/contexts/configContext'
import ConfigMenu from '@shared/components/ConfigMenu'
import Timer from '@shared/components/Timer'
import SolveAlert from '@shared/components/SolveAlert'

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

function GridProvider() {
  const sharedGrid = useLocation({ select: (l) => l.state.initialGrid })
  const padActions = usePadActions({ initialGrid: getEmptyBoard() })

  const fillGridRef = useRef(padActions.fillGrid)
  fillGridRef.current = padActions.fillGrid
  useEffect(() => {
    if (sharedGrid) fillGridRef.current(parseGrid(sharedGrid))
  }, [sharedGrid])

  return (
    <GridContext.Provider value={padActions}>
      <MainLayout header={<ConfigMenu />} footer={<Timer />}>
        <PlayableGrid />
      </MainLayout>
      <SolveAlert />
    </GridContext.Provider>
  )
}
