import { useEffect, useRef } from 'react'
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
  useLocation,
} from '@tanstack/react-router'
import HomePage from './pages/home'
import SolvePage from './pages/solver'
import {
  ConfigContext,
  useConfigContext,
} from '@features/play/contexts/playSettings'
import { ControllerContext } from '@features/play/contexts/playControllerContext'
import { useControllerOrchestrator } from '@features/play/hooks/useControllerOrchestrator'
import { SolveGridContext } from '@features/solve/contexts/solveGridContext'
import useSolveGridState from '@features/solve/hooks/useSolveGridState'
import type { Square, SudokuNumber } from '@features/play/types'
import { parseGrid } from '@shared/sudoku/codec'

const emptyGrid = (): Square[] =>
  Array.from({ length: 81 }, () => ({
    value: null as null,
    notes: new Set<SudokuNumber>(),
    color: null,
    locked: false,
  }))

// eslint-disable-next-line react-refresh/only-export-components
function RootShell() {
  const config = useConfigContext()
  const playGrid = useControllerOrchestrator({ initialGrid: emptyGrid() })
  const solveGrid = useSolveGridState()

  const sharedGrid = useLocation({ select: (l) => l.state.initialGrid })
  const fillGridRef = useRef(playGrid.fillGrid)
  fillGridRef.current = playGrid.fillGrid
  useEffect(() => {
    if (sharedGrid) fillGridRef.current(parseGrid(sharedGrid))
  }, [sharedGrid])

  return (
    <ConfigContext.Provider value={config}>
      <ControllerContext.Provider value={playGrid}>
        <SolveGridContext.Provider value={solveGrid}>
          <Outlet />
        </SolveGridContext.Provider>
      </ControllerContext.Provider>
    </ConfigContext.Provider>
  )
}

const rootRoute = createRootRoute({
  component: RootShell,
})

export const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
})

export const solveRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/solver',
  validateSearch: (search: Record<string, unknown>) => ({
    initial: typeof search.initial === 'string' ? search.initial : '',
  }),
  component: SolvePage,
})

export const shareRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/share',
  validateSearch: (search: Record<string, unknown>) => ({
    grid: typeof search.grid === 'string' ? search.grid : '',
  }),
  beforeLoad: ({ search }) => {
    throw redirect({
      to: '/',
      replace: true,
      state: { initialGrid: search.grid },
    })
  },
})

const routeTree = rootRoute.addChildren([homeRoute, solveRoute, shareRoute])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

declare module '@tanstack/history' {
  interface HistoryState {
    /** 81-digit puzzle string handed from `/share` to the home route. */
    initialGrid?: string
  }
}
