import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
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

const routeTree = rootRoute.addChildren([homeRoute, solveRoute])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
