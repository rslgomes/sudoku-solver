import { useRef } from 'react'
import { cn } from '../../../libs/cn'
import Dialog from '../../../ui/Dialog'
import Button from '../../../ui/Button'
import { SparklesIcon } from '@heroicons/react/24/solid'

type Props = {
  className?: string
  children: React.ReactNode
}

export default function FABDialogOrAside({ className, children }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const fabRef = useRef<HTMLButtonElement>(null)

  function openDialog() {
    dialogRef.current?.showModal()
  }

  function closeDialog() {
    dialogRef.current?.close()
    fabRef.current?.focus()
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
    if (e.target === e.currentTarget) closeDialog()
  }

  return (
    <>
      <Button
        ref={fabRef}
        type="button"
        onClick={openDialog}
        aria-haspopup="dialog"
        aria-label="Open puzzle input"
        className={cn(
          'bg-accent text-fg-on-accent',
          'shadow-raise-accent',
          'active:shadow-press-accent active:bg-accent-dim',
          'fixed bottom-3 left-3 size-11 p-0 z-10',
          'lg:hidden'
        )}
      >
        <SparklesIcon aria-hidden className="size-6 text-fg-on-accent" />
      </Button>

      <aside
        aria-label="Puzzle input"
        className={cn('hidden lg:block', 'bg-bg-base shadow-raise', className)}
      >
        {children}
      </aside>

      <Dialog
        ref={dialogRef}
        onClick={handleBackdropClick}
        onClose={closeDialog}
        title="Puzzle Input"
        className="w-full max-w-sm"
        headerClassName="pl-3"
      >
        {children}
      </Dialog>
    </>
  )
}
