import { useRef } from 'react'
import { cn } from '@shared/libs/cn'
import useShortcuts from '@shared/hooks/useShortcuts'
import { MODE_LABEL } from './types'
import type { MoveMode } from './types'
import { useController } from './contexts/playControllerContext'
import penIcon from '@assets/pen-icon.png'
import pencilIcon from '@assets/pencil-icon.png'
import eraserIcon from '@assets/eraser-icon.png'
import bucketIcon from '@assets/bucket-icon.png'
import undoIcon from '@assets/undo-icon.png'
import lockIcon from '@assets/lock-icon.png'
import { useConfig } from './contexts/playSettings'
import { ArrowPathIcon } from '@heroicons/react/24/solid'
import PromptDialog from '@shared/ui/PromptDialog'

const MODES: { mode: MoveMode; icon: string; title: string; shortcut: string }[] =
  [
    { mode: 'pen', icon: penIcon, title: 'Pen — fill a square', shortcut: 'p' },
    {
      mode: 'pencil',
      icon: pencilIcon,
      title: 'Pencil — mark candidates',
      shortcut: 'n',
    },
    { mode: 'eraser', icon: eraserIcon, title: 'Erase', shortcut: 'e' },
    {
      mode: 'paint',
      icon: bucketIcon,
      title: 'Color — paint background',
      shortcut: 'c',
    },
    {
      mode: 'lock',
      icon: lockIcon,
      title: 'Lock — fix given squares',
      shortcut: 'l',
    },
  ]

const UNDO_SHORTCUT = 'ctrl+z'
const RESET_SHORTCUT = 'alt+r'

function shortcutLabel(shortcut: string) {
  return shortcut
    .split('+')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('+')
}

function ShortcutHint({ shortcut }: { shortcut: string }) {
  return (
    <span
      aria-hidden
      className="absolute bottom-0.5 right-1 font-style text-[10px] leading-none text-fg-faint"
    >
      {shortcutLabel(shortcut)}
    </span>
  )
}

export default function Toolbox({ className }: { className?: string }) {
  const {
    activeMode: active,
    onModeChange: onChange,
    registerInteractive,
    onUndo,
    canUndo,
    onReset,
  } = useController()
  const { showLockButton } = useConfig()
  const resetTriggerRef = useRef<HTMLButtonElement>(null)

  const visibleModes = MODES.filter(({ mode }) =>
    mode === 'lock' ? showLockButton : true
  )

  useShortcuts({
    ...Object.fromEntries(
      visibleModes.map(({ mode, shortcut }) => [shortcut, () => onChange(mode)])
    ),
    [UNDO_SHORTCUT]: canUndo ? onUndo : undefined,
    [RESET_SHORTCUT]: () => resetTriggerRef.current?.click(),
  })

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div role="status" aria-live="polite" className="sr-only">
        {MODE_LABEL[active].title} mode active — {MODE_LABEL[active].hint}
      </div>
      {visibleModes.map(({ mode, icon, title, shortcut }) => (
        <button
          key={mode}
          ref={registerInteractive}
          aria-pressed={active === mode}
          aria-keyshortcuts={shortcut}
          title={`${title} (${shortcutLabel(shortcut)})`}
          onClick={() => onChange(mode)}
          className={cn(
            'relative size-12 flex items-center justify-center font-style text-xs cursor-default select-none',
            'transition-[box-shadow,background-color] duration-75',
            active === mode
              ? 'shadow-press-accent bg-bg-sunken text-accent'
              : 'shadow-raise bg-bg-raised text-fg hover:bg-bg-widget'
          )}
        >
          <img src={icon} alt={title} className="size-8" />
          <ShortcutHint shortcut={shortcut} />
        </button>
      ))}
      <button
        onClick={onUndo}
        type="button"
        aria-keyshortcuts={UNDO_SHORTCUT}
        title={`Undo (${shortcutLabel(UNDO_SHORTCUT)})`}
        disabled={!canUndo}
        className={cn(
          'relative size-12 mt-auto flex items-center justify-center font-style text-xs cursor-default select-none',
          'transition-[box-shadow,background-color] duration-75',
          'shadow-raise bg-bg-raised text-fg hover:bg-bg-widget',
          'disabled:text-fg-muted disabled:cursor-not-allowed disabled:hover:bg-bg-raised'
        )}
      >
        <img src={undoIcon} alt="Undo" className="size-8" />
      </button>
      <PromptDialog
        title="Reset puzzle"
        prompt="Reset the puzzle to its initial state? Your progress and pencil marks will be lost."
        options={[
          {
            name: 'Reset',
            title: 'Reset to the initial puzzle',
            icon: <ArrowPathIcon aria-hidden className="size-5 text-accent" />,
            onSelect: onReset,
            className: 'text-accent',
          },
          {
            name: 'Keep playing',
            title: 'Dismiss without resetting',
            onSelect: () => {},
          },
        ]}
        trigger={(open) => (
          <button
            ref={resetTriggerRef}
            onClick={open}
            type="button"
            aria-keyshortcuts={RESET_SHORTCUT}
            title={`Reset puzzle (${shortcutLabel(RESET_SHORTCUT)})`}
            disabled={!canUndo}
            className={cn(
              'size-12 flex items-center justify-center font-style text-xs cursor-default select-none',
              'transition-[box-shadow,background-color] duration-75',
              'shadow-raise bg-bg-raised text-fg hover:bg-bg-widget',
              'disabled:text-fg-muted disabled:cursor-not-allowed disabled:hover:bg-bg-raised',
              'disabled:[&_svg]:text-fg-muted'
            )}
          >
            <ArrowPathIcon aria-hidden className="size-6 text-accent-dim" />
          </button>
        )}
      />
    </div>
  )
}
