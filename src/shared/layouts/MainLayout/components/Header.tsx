import { usePreferences } from '@shared/contexts/PreferencesContext'
import Logo from '@assets/logo.svg?react'
import ToggleButton from '@shared/ui/ToggleButton'
import { MoonIcon, SunIcon } from '@heroicons/react/24/solid'
import ModeTabs from '@shared/components/ModeTabs'

export default function HeaderMainLayout({
  children,
  actions,
}: {
  children: React.ReactNode
  actions?: React.ReactNode
}) {
  const { theme, toggleTheme } = usePreferences()
  const isDark = theme === 'dark'

  return (
    <header className="shadow-raise">
      <div className="bg-accent flex justify-start items-center p-1">
        <a href="/" aria-label="Sudoku Solver - home">
          <Logo aria-hidden className="size-8 text-accent-dim" />
        </a>
        <h1 className="text-fg font-style font-medium text-3xl ml-4">
          Sudoku Solver
        </h1>
        <div className="ml-auto flex gap-2" role="toolbar" aria-label="actions">
          {actions}
          <ToggleButton
            checked={isDark}
            onChange={toggleTheme}
            aria-label="Dark mode"
            className="h-full"
          >
            {isDark ? (
              <MoonIcon aria-hidden className="size-6" />
            ) : (
              <SunIcon aria-hidden className="size-6" />
            )}
          </ToggleButton>
        </div>
      </div>
      <div className="flex items-center gap-2 px-2 bg-bg-raised">
        <ModeTabs />
        {children}
      </div>
    </header>
  )
}
