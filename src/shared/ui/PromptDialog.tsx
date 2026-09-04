import { useId, useRef } from 'react'
import { cn } from '../libs/cn'
import Dialog from './Dialog'
import Button from './Button'

export interface PromptOption {
  name: string
  title?: string
  icon?: React.ReactNode
  onSelect: () => void
  className?: string
  disabled?: boolean
  disabledReason?: string
}

interface Props {
  prompt: React.ReactNode
  options: PromptOption[]
  trigger: (open: () => void) => React.ReactNode
  title?: string
  dialogClassName?: string
}

export default function PromptDialog({
  prompt,
  options,
  trigger,
  title = '',
  dialogClassName,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const lastFocusedRef = useRef<HTMLElement | null>(null)
  const promptId = useId()

  function open() {
    lastFocusedRef.current = document.activeElement as HTMLElement | null
    dialogRef.current?.showModal()
  }

  function close() {
    dialogRef.current?.close()
    lastFocusedRef.current?.focus()
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
    if (e.target === e.currentTarget) close()
  }

  function handleSelect(option: PromptOption) {
    option.onSelect()
    close()
  }

  return (
    <>
      {trigger(open)}
      <Dialog
        ref={dialogRef}
        onClick={handleBackdropClick}
        onClose={close}
        title={title}
        aria-describedby={promptId}
        className={cn('w-full max-w-sm', dialogClassName)}
      >
        <div className="flex flex-col gap-4 p-4">
          <p id={promptId} className="text-fg text-sm">
            {prompt}
          </p>
          <div className="flex flex-wrap justify-end gap-2">
            {options.map((option) => (
              <span
                key={option.name}
                title={option.disabled ? option.disabledReason : undefined}
              >
                <Button
                  type="button"
                  title={option.disabled ? undefined : option.title}
                  disabled={option.disabled}
                  onClick={() => handleSelect(option)}
                  className={cn('gap-2 font-semibold', option.className)}
                >
                  {option.icon}
                  {option.name}
                </Button>
              </span>
            ))}
          </div>
        </div>
      </Dialog>
    </>
  )
}
