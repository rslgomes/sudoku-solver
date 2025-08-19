import { forwardRef, memo } from 'react'
import {
  LockClosedIcon,
  PaintBrushIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import IconButton from '../ui/IconButton'
import { cn } from '../../libs/cn'
import type { UIInputMode } from '../../libs/types'
import type { ForwardRefExoticComponent, RefAttributes, SVGProps } from 'react'

type IconType = ForwardRefExoticComponent<
  SVGProps<SVGSVGElement> & RefAttributes<SVGSVGElement>
>

interface BadgeStyles {
  hoverClass: string
  textClass: string
  activeClass: string
  Icon: IconType
}

const MODE_TO_BADGE_STYLE: Record<Exclude<UIInputMode, 'pen'>, BadgeStyles> = {
  pencil: {
    hoverClass: 'hover:text-primary',
    activeClass: 'bg-primary-fg2',
    textClass: 'text-primary',
    Icon: PencilIcon,
  },
  color: {
    hoverClass: 'hover:text-primary',
    activeClass: 'bg-primary-fg2',
    textClass: 'text-primary',
    Icon: PaintBrushIcon,
  },
  clear: {
    hoverClass: 'hover:text-error',
    activeClass: 'bg-error/80',
    textClass: 'text-error',
    Icon: TrashIcon,
  },
  lock: {
    hoverClass: 'hover:text-border',
    activeClass: 'bg-border',
    textClass: 'text-border',
    Icon: LockClosedIcon,
  },
}

interface ToolbarProps {
  mode: UIInputMode
  handleMode: (mode: UIInputMode) => void
}

const ToolBar = memo(
  forwardRef<HTMLDivElement, ToolbarProps>(function ToolBar(
    { mode, handleMode },
    ref
  ) {
    function ModeButton({
      thisMode,
    }: {
      thisMode: keyof typeof MODE_TO_BADGE_STYLE
    }) {
      const isActive = mode === thisMode
      const { Icon, hoverClass, textClass, activeClass } =
        MODE_TO_BADGE_STYLE[thisMode]
      return (
        <IconButton
          className={cn('w-fit text-primary-fg2/70', hoverClass, textClass, {
            'text-primary-bg2': isActive,
            'bg-primary-fg2': isActive,
            [activeClass]: isActive,
          })}
          onClick={() => handleMode(thisMode)}
        >
          <Icon className="size-5" aria-hidden />
        </IconButton>
      )
    }

    return (
      <div ref={ref} className="flex flex-col gap-2">
        <ModeButton thisMode="pencil" />
        <ModeButton thisMode="color" />
        <ModeButton thisMode="clear" />
        <ModeButton thisMode="lock" />
      </div>
    )
  })
)

ToolBar.displayName = 'ToolBar'
export default ToolBar
