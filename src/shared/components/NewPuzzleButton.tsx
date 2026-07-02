import { useRef } from 'react'
import { SparklesIcon } from '@heroicons/react/24/solid'
import Dialog from '@shared/ui/Dialog'
import Button from '@shared/ui/Button'
import PuzzleInput from './PuzzleInput'

export default function NewPuzzleButton({
  onSubmit,
}: {
  onSubmit: (raw: string) => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const open = () => dialogRef.current?.showModal()
  const close = () => {
    dialogRef.current?.close()
    triggerRef.current?.focus()
  }
  const handleBackdrop = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === e.currentTarget) close()
  }

  return (
    <>
      <Button
        ref={triggerRef}
        type="button"
        onClick={open}
        aria-haspopup="dialog"
        aria-label="Open puzzle input"
        className="h-8 p-1"
      >
        <span className="flex items-center justify-between gap-2">
          <SparklesIcon aria-hidden className="size-6 text-blue" />
          <span className="hidden lg:block">New</span>
        </span>
      </Button>

      <Dialog
        ref={dialogRef}
        onClick={handleBackdrop}
        onClose={close}
        title="Puzzle Input"
        className="w-full max-w-sm"
        headerClassName="pl-3"
      >
        <PuzzleInput className="mt-4 mb-4 px-2" onSubmit={onSubmit} />
      </Dialog>
    </>
  )
}
