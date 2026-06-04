import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from '@tanstack/react-router'
import HomePage from './pages/home'
import SolvePage from './pages/solver'

const rootRoute = createRootRoute({
  component: Outlet,
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
