import { useRef, useState } from 'react'
import { SparklesIcon } from '@heroicons/react/24/solid'
import Dialog from '@shared/ui/Dialog'
import Button from '@shared/ui/Button'
import PuzzleInput from './PuzzleInput'
import { getDailyPuzzle, type Difficulty } from '@shared/api/dailyPuzzle'

const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
]

export default function NewPuzzleButton({
  onSubmit,
}: {
  onSubmit: (raw: string) => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [loading, setLoading] = useState<Difficulty | null>(null)
  const [error, setError] = useState<string | null>(null)

  const open = () => {
    dialogRef.current?.showModal()
    const firstInput = dialogRef.current?.querySelector('input')
    firstInput?.focus({ preventScroll: true })
    firstInput?.scrollIntoView({ block: 'start' })
  }
  const close = () => {
    dialogRef.current?.close()
    triggerRef.current?.focus()
    setError(null)
  }
  const handleBackdrop = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === e.currentTarget) close()
  }

  const handleSelectDaily = async (difficulty: Difficulty) => {
    setError(null)
    setLoading(difficulty)
    try {
      const raw = await getDailyPuzzle(difficulty)
      onSubmit(raw)
      close()
    } catch {
      setError('Could not load today’s puzzle. Try again.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <>
      <Button
        ref={triggerRef}
        type="button"
        onClick={open}
        aria-haspopup="dialog"
        aria-label="Open puzzle input"
        className="h-7 sm:h-8 p-1 shrink-0"
      >
        <span className="flex items-center justify-between gap-2">
          <SparklesIcon
            aria-hidden
            className="size-5 sm:size-6 text-alt shrink-0"
          />
          <span className="hidden lg:block">New</span>
        </span>
      </Button>

      <Dialog
        ref={dialogRef}
        onClick={handleBackdrop}
        onClose={close}
        title="New Puzzle"
        className="w-full max-w-sm"
      >
        <div className="mt-4 mb-4 px-2">
          <h3 className="text-sm font-semibold text-fg">Insert Puzzle</h3>
          <PuzzleInput
            className="mt-2"
            onSubmit={(raw) => {
              onSubmit(raw)
              close()
            }}
          />
        </div>

        <hr className="mx-2 border-fg-muted/20" />

        <div className="mt-4 mb-4 px-2 flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-fg">Daily Puzzle</h3>
          <p className="text-sm text-fg-muted">
            Pick a difficulty for today’s puzzle.
          </p>
          <div className="flex justify-center gap-2">
            {DIFFICULTIES.map(({ value, label }) => (
              <Button
                key={value}
                type="button"
                onClick={() => handleSelectDaily(value)}
                disabled={loading !== null}
                className="flex-1 justify-center font-semibold shadow-raise-accent"
              >
                {loading === value ? '…' : label}
              </Button>
            ))}
          </div>
          {error && (
            <p role="alert" className="text-xs text-red">
              {error}
            </p>
          )}
        </div>
      </Dialog>
    </>
  )
}
