import { cn } from '../../libs/cn'
import { MODE_LABEL } from './types'
import type { MoveMode } from './types'
import { useGrid } from './contexts/gridContext'
import penIcon from '@assets/pen-icon.png'
import pencilIcon from '@assets/pencil-icon.png'
import eraserIcon from '@assets/eraser-icon.png'
import bucketIcon from '@assets/bucket-icon.png'
import undoIcon from '@assets/undo-icon.png'
import lockIcon from '@assets/lock-icon.png'
import { useConfig } from './contexts/configContext'
import { ArrowPathIcon } from '@heroicons/react/24/solid'
import PromptDialog from '../../ui/PromptDialog'

const MODES: { mode: MoveMode; icon: string; title: string }[] = [
  { mode: 'pen', icon: penIcon, title: 'Pen — fill a square' },
  { mode: 'pencil', icon: pencilIcon, title: 'Pencil — mark candidates' },
  { mode: 'eraser', icon: eraserIcon, title: 'Erase' },
  { mode: 'paint', icon: bucketIcon, title: 'Color — paint background' },
  { mode: 'lock', icon: lockIcon, title: 'Lock — fix given squares' },
]

export default function Toolbox({ className }: { className?: string }) {
  const {
    activeMode: active,
    onModeChange: onChange,
    registerInteractive,
    onUndo,
    canUndo,
    onReset,
  } = useGrid()
  const { showLockButton } = useConfig()
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div role="status" aria-live="polite" className="sr-only">
        {MODE_LABEL[active].title} mode active — {MODE_LABEL[active].hint}
      </div>
      {MODES.filter(({ mode }) =>
        mode === 'lock' ? showLockButton : true
      ).map(({ mode, icon, title }) => (
        <button
          key={mode}
          ref={registerInteractive}
          aria-pressed={active === mode}
          title={title}
          onClick={() => onChange(mode)}
          className={cn(
            'size-12 flex items-center justify-center font-style text-xs cursor-default select-none',
            'transition-[box-shadow,background-color] duration-75',
            active === mode
              ? 'shadow-press-accent bg-bg-sunken text-accent'
              : 'shadow-raise bg-bg-raised text-fg hover:bg-bg-widget'
          )}
        >
          <img src={icon} alt={title} className="size-8" />
        </button>
      ))}
      <button
        onClick={onUndo}
        type="button"
        title="Undo"
        disabled={!canUndo}
        className={cn(
          'size-12 mt-auto flex items-center justify-center font-style text-xs cursor-default select-none',
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
            onClick={open}
            type="button"
            title="Reset puzzle"
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
