import { useRef } from 'react'
import { cn } from '../../../libs/cn'
import Dialog from '../../../ui/Dialog'
import Button from '../../../ui/Button'

type Props = {
  classNames?: {
    dialog?: string
    trigger?: string
  }
  buttonChildren?: React.ReactNode
  children: React.ReactNode
}

export default function DialogTrigger({
  classNames,
  buttonChildren,
  children,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  function openDialog() {
    dialogRef.current?.showModal()
  }

  function closeDialog() {
    dialogRef.current?.close()
    triggerRef.current?.focus()
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
    if (e.target === e.currentTarget) closeDialog()
  }

  return (
    <>
      <Button
        ref={triggerRef}
        type="button"
        onClick={openDialog}
        aria-haspopup="dialog"
        aria-label="Open puzzle input"
        className={classNames?.trigger}
      >
        {buttonChildren}
      </Button>

      <Dialog
        ref={dialogRef}
        onClick={handleBackdropClick}
        onClose={closeDialog}
        title="Puzzle Input"
        className={cn('w-full max-w-sm', classNames?.dialog)}
        headerClassName="pl-3"
      >
        {children}
      </Dialog>
    </>
  )
}
