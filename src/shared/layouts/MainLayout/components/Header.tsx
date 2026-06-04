import { usePreferences } from '@shared/contexts/PreferencesContext'
import Logo from '@assets/logo.svg?react'
import ToggleButton from '@shared/ui/ToggleButton'
import { MoonIcon, SparklesIcon, SunIcon } from '@heroicons/react/24/solid'
import DialogTrigger from './DialogTrigger'
import PuzzleInput from '@shared/components/PuzzleInput'

export default function HeaderMainLayout({
  children,
}: {
  children: React.ReactNode
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
          <DialogTrigger
            classNames={{ trigger: 'h-8 p-1' }}
            buttonChildren={
              <span className="flex items-center justify-between gap-2">
                <SparklesIcon aria-hidden className="size-6 text-blue" />
                <span className="hidden lg:block">New</span>
              </span>
            }
          >
            <PuzzleInput className="mt-4 mb-4 px-2" />
          </DialogTrigger>
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
      <div className="flex gap-2 px-2 bg-bg-raised">{children}</div>
    </header>
  )
}
