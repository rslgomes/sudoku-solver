import { useId } from 'react'
import { XMarkIcon } from '@heroicons/react/24/solid'
import Logo from '@assets/logo.svg?react'
import { cn } from '../libs/cn'
import Button from './Button'

interface Props extends React.DialogHTMLAttributes<HTMLDialogElement> {
  children: React.ReactNode
  ref: React.ForwardedRef<HTMLDialogElement>
  onClose: () => void
  title?: string
  headerClassName?: string
}

export default function Dialog({
  children,
  ref,
  onClose: closeDialog,
  title = '',
  className,
  headerClassName,
  ...delegated
}: Props) {
  const titleId = useId()

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-modal="true"
      onCancel={closeDialog}
      className={cn(
        'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
        'bg-bg-raised p-0.5 shadow-raise',
        'backdrop:bg-black/35',
        className
      )}
      {...delegated}
    >
      <header className="shadow-bar">
        <div
          className={cn(
            'flex items-center justify-start bg-titlebar-alt p-1',
            headerClassName
          )}
        >
          <Logo
            aria-hidden
            className="size-5 shrink-0"
            style={
              {
                '--primary': 'var(--color-titlebar-alt)',
                '--secondary': 'var(--color-titlebar)',
                '--fg': 'var(--color-fg-on-titlebar-alt)',
              } as React.CSSProperties
            }
          />
          <h2
            id={titleId}
            className="ml-2 font-style font-medium text-lg text-fg-on-titlebar-alt"
          >
            {title}
          </h2>
          <Button
            type="button"
            className="bg-bg-raised ml-auto size-5"
            onClick={closeDialog}
            aria-label={`Close ${title || 'dialog'}`}
          >
            <span aria-hidden="true">
              <XMarkIcon className="text-fg size-4" />
            </span>
          </Button>
        </div>
      </header>
      {children}
    </dialog>
  )
}
