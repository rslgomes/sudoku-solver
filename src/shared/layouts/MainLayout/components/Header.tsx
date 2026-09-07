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
    <header className="shadow-bar">
      <div className="bg-titlebar flex justify-start items-center p-1">
        <a href="/" aria-label="Sudoku Solver - home" className="shrink-0">
          <Logo aria-hidden className="size-10" />
        </a>
        <div className="min-w-0 flex-1 ml-2 [container-type:inline-size]">
          <h1 className="text-fg-on-titlebar font-style font-medium truncate text-[clamp(1rem,8cqi,1.875rem)]">
            Sudoku Solver
          </h1>
        </div>
        <div
          className="ml-auto flex gap-2 shrink-0"
          role="toolbar"
          aria-label="actions"
        >
          {actions}
          <ToggleButton
            checked={isDark}
            onChange={toggleTheme}
            aria-label="Dark mode"
            className="h-full shrink-0"
          >
            {isDark ? (
              <MoonIcon aria-hidden className="size-5 sm:size-6 shrink-0" />
            ) : (
              <SunIcon aria-hidden className="size-5 sm:size-6 shrink-0" />
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
