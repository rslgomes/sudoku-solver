import { useEffect, useRef } from 'react'
import { cn } from '../libs/cn'

interface ToggleMenuItemProps {
  label: string
  checked: boolean
  onChange: (next: boolean) => void
  className?: string
}

export function ToggleMenuItem({
  label,
  checked,
  onChange,
  className,
}: ToggleMenuItemProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'group w-full text-left px-4 py-1 text-sm font-main text-fg',
        'inline-flex items-center gap-2',
        'cursor-default select-none',
        'transition-[box-shadow,background-color] duration-75',
        'hover:bg-bg-sunken',
        'aria-checked:shadow-press',
        'focus:outline-none focus-visible:bg-bg-sunken',
        'disabled:opacity-40 disabled:pointer-events-none',
        className
      )}
    >
      <span
        aria-hidden
        className={cn(
          'size-2 shrink-0 rounded-full transition-[background-color] duration-150',
          'bg-red/50 ring-red/30',
          'group-aria-checked:bg-red group-aria-checked:ring-red/50 group-aria-checked:ring-2'
        )}
      />
      {label}
    </button>
  )
}

interface ActionMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

export function ActionMenuItem({
  children,
  className,
  onClick,
  ...delegated
}: ActionMenuItemProps) {
  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    onClick?.(e)
    const details = e.currentTarget.closest('details')
    if (details) {
      details.open = false
      details.querySelector('summary')?.focus()
    }
  }

  return (
    <button
      type="button"
      className={cn(
        'w-full text-left px-4 py-1 text-sm font-main text-fg',
        'cursor-default select-none',
        'hover:bg-accent hover:text-fg-on-accent',
        'focus:outline-none focus-visible:bg-accent focus-visible:text-fg-on-accent',
        'disabled:opacity-40 disabled:pointer-events-none',
        className
      )}
      onClick={handleClick}
      {...delegated}
    >
      {children}
    </button>
  )
}

export function MenuSeparator({ className }: { className?: string }) {
  return (
    <hr
      aria-orientation="horizontal"
      className={cn('border-bevel-dark my-0.5 mx-2', className)}
    />
  )
}

interface Props {
  trigger: React.ReactNode
  children: React.ReactNode
  label: string
  className?: string
  panelClassName?: string
}

export default function DisclosureMenu({
  trigger,
  children,
  label,
  className,
  panelClassName,
}: Props) {
  const ref = useRef<HTMLDetailsElement>(null)
  const summaryRef = useRef<HTMLElement>(null)

  function close(focusTrigger: boolean) {
    if (ref.current) ref.current.open = false
    if (focusTrigger) summaryRef.current?.focus()
  }

  useEffect(() => {
    function onOutsideClick(e: MouseEvent) {
      if (ref.current?.open && !ref.current.contains(e.target as Node)) {
        close(false)
      }
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === 'Escape' && ref.current?.open) {
        e.preventDefault()
        close(true)
      }
    }
    document.addEventListener('click', onOutsideClick)
    document.addEventListener('keydown', onEscape)
    return () => {
      document.removeEventListener('click', onOutsideClick)
      document.removeEventListener('keydown', onEscape)
    }
  }, [])

  return (
    <details ref={ref} className={cn('group relative', className)}>
      <summary
        ref={summaryRef as React.RefObject<HTMLElement>}
        className={cn(
          '[&::-webkit-details-marker]:hidden list-none',
          'inline-flex items-center gap-1.5 px-3 py-1 text-sm font-main text-fg',
          'bg-bg-raised',
          'cursor-default select-none',
          'transition-[box-shadow,background-color] duration-75',
          'group-open:shadow-press group-open:bg-bg-sunken',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
          'hover:bg-bg-sunken'
        )}
      >
        {trigger}
      </summary>
      <div
        role="group"
        aria-label={label}
        className={cn(
          'absolute top-full left-0 z-50 min-w-max',
          'bg-bg-raised shadow-raise',
          'flex flex-col py-1',
          panelClassName
        )}
      >
        {children}
      </div>
    </details>
  )
}
