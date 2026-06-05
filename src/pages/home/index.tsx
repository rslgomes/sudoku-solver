import { useEffect, useRef } from 'react'
import { useLocation } from '@tanstack/react-router'
import PlayLayout from '@features/play/PlayLayout'
import { ControllerContext } from '@features/play/contexts/controllerContext'
import {
  ConfigContext,
  useConfigContext,
} from '@features/play/contexts/playSettings'
import { useControllerOrchestrator } from '@features/play/hooks/useControllerOrchestrator'
import type { Square, SudokuNumber } from '@features/play/types'
import ConfigMenu from '@features/play/widgets/ConfigMenu'
import Timer from '@features/play/widgets/Timer'
import SolveAlert from '@features/play/widgets/SolveAlert'
import ShareButton from '@features/play/widgets/ShareButton'
import NewPuzzleButton from '@features/play/widgets/NewPuzzleButton'
import MainLayout from '@shared/layouts/MainLayout'
import { parseGrid } from '@shared/sudoku/codec'

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
      <MainProvider />
    </ConfigContext.Provider>
  )
}

function MainProvider() {
  const sharedGrid = useLocation({ select: (l) => l.state.initialGrid })
  const controller = useControllerOrchestrator({ initialGrid: getEmptyBoard() })

  const fillGridRef = useRef(controller.fillGrid)
  fillGridRef.current = controller.fillGrid
  useEffect(() => {
    if (sharedGrid) fillGridRef.current(parseGrid(sharedGrid))
  }, [sharedGrid])

  return (
    <ControllerContext.Provider value={controller}>
      <MainLayout
        header={<ConfigMenu />}
        footer={<Timer />}
        actions={
          <>
            <ShareButton />
            <NewPuzzleButton />
          </>
        }
      >
        <PlayLayout />
      </MainLayout>
      <SolveAlert />
    </ControllerContext.Provider>
  )
}
