import { cn } from '../../libs/cn'
import { MODE_LABEL } from './types'
import type { MoveMode } from './types'
import { usePlayableGrid } from './context'
import penIcon from '../../../assets/pen-icon.png'
import pencilIcon from '../../../assets/pencil-icon.png'
import eraserIcon from '../../../assets/eraser-icon.png'
import bucketIcon from '../../../assets/bucket-icon.png'
import lockIcon from '../../../assets/lock-icon.png'

const MODES: { mode: MoveMode; icon: string; title: string }[] = [
  { mode: 'pen', icon: penIcon, title: 'Pen — fill a square' },
  { mode: 'pencil', icon: pencilIcon, title: 'Pencil — mark candidates' },
  { mode: 'eraser', icon: eraserIcon, title: 'Erase' },
  { mode: 'paint', icon: bucketIcon, title: 'Color — paint background' },
  { mode: 'lock', icon: lockIcon, title: 'Lock — fix given squares' },
]

export default function Toolbox() {
  const { activeMode: active, onModeChange: onChange, canUndo, onUndo } =
    usePlayableGrid()
  return (
    <div className="flex flex-col gap-1.5">
      <div role="status" aria-live="polite" className="sr-only">
        {MODE_LABEL[active].title} mode active — {MODE_LABEL[active].hint}
      </div>
      {MODES.map(({ mode, icon, title }) => (
        <button
          key={mode}
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

      <div className="mt-auto pt-3">
        <button
          title="Undo"
          onClick={onUndo}
          disabled={!canUndo}
          className={cn(
            'size-12 flex items-center justify-center font-style text-xs cursor-default select-none',
            'shadow-raise bg-bg-raised text-fg',
            'disabled:opacity-40 disabled:pointer-events-none',
            'hover:bg-bg-widget transition-[box-shadow,background-color] duration-75'
          )}
        >
          Un
        </button>
      </div>
    </div>
  )
}
