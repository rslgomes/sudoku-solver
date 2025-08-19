import { cn } from '../../libs/cn'
import IconButton from '../ui/IconButton'

interface DigitBadgeProps {
  digit: number
  value: number | string | boolean | null
  onClick?: () => void
}
const DigitBadge = ({ digit, value, onClick }: DigitBadgeProps) => {
  return (
    <IconButton
      className={cn(
        'aspect-square size-10 text-xl text-primary-fg1 flex items-center justify-center',
        { 'bg-primary-fg2 text-secondary-bg2': digit === value }
      )}
      onClick={onClick}
    >
      {digit}
    </IconButton>
  )
}

export default DigitBadge
