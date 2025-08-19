import type { ColorKey } from '../../libs/types'
import { CheckBadgeIcon } from '@heroicons/react/16/solid'

interface ColorBadgeProps {
  color: ColorKey
  selected: boolean
  onClick: () => void
}

const ColorBadge = ({ color, selected, onClick }: ColorBadgeProps) => {
  return (
    <button
      type="button"
      className={`aspect-square cursor-pointer size-12 text-xl flex items-center justify-center relative border border-border rounded-sm ${color}`}
      onClick={onClick}
    >
      {selected && (
        <CheckBadgeIcon className="size-4 absolute top-0.5 right-0.5 text-primary-fg1" />
      )}
    </button>
  )
}

export default ColorBadge
