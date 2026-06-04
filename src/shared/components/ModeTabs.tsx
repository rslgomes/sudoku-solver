import { Link } from '@tanstack/react-router'
import { cn } from '@shared/libs/cn'

const base = cn(
  'inline-flex items-center px-3 py-1 text-sm font-main',
  'select-none cursor-default',
  'transition-[box-shadow,background-color] duration-75'
)
const inactiveClass = 'bg-bg-raised text-fg-muted shadow-raise'
const activeClass = 'bg-bg-sunken text-accent shadow-press'

const tabProps = {
  activeOptions: { exact: true, includeSearch: false },
  className: base,
  inactiveProps: { className: inactiveClass },
  activeProps: { className: activeClass },
} as const

export default function ModeTabs() {
  return (
    <nav
      aria-label="Mode"
      className="flex items-center gap-1 py-1 pr-2 mr-1 border-r border-bevel-dark"
    >
      <Link to="/" {...tabProps}>
        Play
      </Link>
      <Link to="/solver" search={{ initial: '' }} {...tabProps}>
        Solve
      </Link>
    </nav>
  )
}
