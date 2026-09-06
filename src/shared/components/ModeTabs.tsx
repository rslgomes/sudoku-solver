import { Link, useLocation } from '@tanstack/react-router'
import { cn } from '@shared/libs/cn'
import { useSolveGrid } from '@features/solve/contexts/solveGridContext'
import useReducedMotion from '@shared/hooks/useReducedMotion'

const base = cn(
  'inline-flex items-center px-3 py-1 text-sm font-main',
  'select-none cursor-default',
  'transition-[box-shadow,background-color] duration-75'
)
const inactiveClass = 'bg-bg-raised text-fg-muted shadow-raise'
const activeClass = 'bg-bg-sunken text-alt shadow-press'

const tabProps = {
  activeOptions: { exact: true, includeSearch: false },
  className: base,
  inactiveProps: { className: inactiveClass },
  activeProps: { className: activeClass },
} as const

export default function ModeTabs() {
  const { resultReady } = useSolveGrid()
  const pathname = useLocation({ select: (l) => l.pathname })
  const reducedMotion = useReducedMotion()
  const awaitingSolve = resultReady && pathname !== '/solver'

  return (
    <nav
      aria-label="Mode"
      className="flex items-center gap-1 py-1 pr-2 mr-1 border-r border-bevel-dark"
    >
      <Link to="/" {...tabProps}>
        Play
      </Link>
      <Link
        to="/solver"
        search={{ initial: '' }}
        {...tabProps}
        className={cn(
          base,
          awaitingSolve &&
            (reducedMotion
              ? 'bg-accent text-fg-on-accent'
              : 'animate-blink-alert')
        )}
      >
        Solve{awaitingSolve && <span className="sr-only"> — solution ready</span>}
      </Link>
    </nav>
  )
}
