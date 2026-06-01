import { MoonIcon, SunIcon } from '@heroicons/react/24/solid'
import Logo from '../../../../assets/logo.svg?react'
import { cn } from '../../../libs/cn'
import { usePreferences } from '../../../contexts/PreferencesContext'
import ToggleButton from '../../../ui/ToggleButton'

type Props = React.HTMLAttributes<HTMLElement>

export default function MainHeader({ className }: Props) {
  const { theme, toggleTheme } = usePreferences()
  const isDark = theme === 'dark'

  return (
    <header
      className={cn(
        'flex items-center justify-between px-4 lg:px-8 -mx-2 lg:-mx-4 py-2 lg:py-4',
        'shadow-raise bg-bg-base',
        className
      )}
    >
      <a href="/" aria-label="Sudoku Solver - home">
        <Logo aria-hidden className="size-8 text-accent-dim" />
      </a>
      <h1 className="text-accent font-style font-medium text-3xl ml-4">
        Sudoku Solver
      </h1>
      <div className="ml-auto" role="toolbar" aria-label="actions">
        <ToggleButton checked={isDark} onChange={toggleTheme}>
          {isDark ? (
            <MoonIcon aria-hidden className="size-3.5" />
          ) : (
            <SunIcon aria-hidden className="size-3.5" />
          )}
          Dark mode
        </ToggleButton>
      </div>
    </header>
  )
}
