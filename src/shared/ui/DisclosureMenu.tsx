import { useEffect, useRef, useState } from 'react'
import { cn } from '../libs/cn'
import useShortcuts from '../hooks/useShortcuts'

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
      role="menuitemcheckbox"
      tabIndex={-1}
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
      role="menuitem"
      tabIndex={-1}
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
  altKey?: string
  className?: string
  panelClassName?: string
}

export default function DisclosureMenu({
  trigger,
  children,
  label,
  altKey,
  className,
  panelClassName,
}: Props) {
  const ref = useRef<HTMLDetailsElement>(null)
  const summaryRef = useRef<HTMLElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

  function items() {
    const found = panelRef.current?.querySelectorAll<HTMLButtonElement>(
      'button:not([disabled])'
    )
    return found ? [...found] : []
  }

  function focusItem(index: number) {
    const all = items()
    if (all.length === 0) return
    const wrapped = (index + all.length) % all.length
    all[wrapped].focus()
  }

  function close(focusTrigger: boolean) {
    if (ref.current) ref.current.open = false
    setOpen(false)
    if (focusTrigger) summaryRef.current?.focus()
  }

  function handlePanelKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const all = items()
    const current = all.indexOf(document.activeElement as HTMLButtonElement)

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        focusItem(current + 1)
        break
      case 'ArrowUp':
        e.preventDefault()
        focusItem(current - 1)
        break
      case 'Home':
        e.preventDefault()
        focusItem(0)
        break
      case 'End':
        e.preventDefault()
        focusItem(all.length - 1)
        break
      case 'Tab':
        close(false)
        break
    }
  }

  useShortcuts({
    [`alt+${altKey}`]: altKey ? () => toggle() : undefined,
  })

  function toggle() {
    if (!ref.current) return
    const next = !ref.current.open
    ref.current.open = next
    if (!next) summaryRef.current?.focus()
  }

  function handleToggle(e: React.SyntheticEvent<HTMLDetailsElement>) {
    const isOpen = e.currentTarget.open
    setOpen(isOpen)
    if (isOpen) focusItem(0)
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
    <details
      ref={ref}
      onToggle={handleToggle}
      className={cn('group relative', className)}
    >
      <summary
        ref={summaryRef as React.RefObject<HTMLElement>}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-keyshortcuts={altKey && `Alt+${altKey.toUpperCase()}`}
        className={cn(
          '[&::-webkit-details-marker]:hidden list-none',
          'inline-flex items-center gap-1.5 px-3 py-1 text-sm font-main text-fg',
          'bg-bg-raised',
          'cursor-default select-none',
          'transition-[box-shadow,background-color] duration-75',
          'group-open:shadow-press group-open:bg-titlebar-alt group-open:text-fg-on-titlebar-alt',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-alt',
          'hover:bg-bg-sunken'
        )}
      >
        {trigger}
      </summary>
      <div
        ref={panelRef}
        role="menu"
        tabIndex={-1}
        aria-label={label}
        onKeyDown={handlePanelKeyDown}
        className={cn(
          'absolute top-full left-0 z-50 min-w-max',
          'bg-bg-raised shadow-raise border-t-2 border-titlebar-alt',
          'flex flex-col py-1',
          panelClassName
        )}
      >
        {children}
      </div>
    </details>
  )
}
