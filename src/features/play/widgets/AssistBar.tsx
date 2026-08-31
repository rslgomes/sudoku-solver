import ToggleButton from '@shared/ui/ToggleButton'
import { cn } from '@shared/libs/cn'
import { useConfig } from '../contexts/playSettings'

export default function AssistBar({ className }: { className?: string }) {
  const {
    highlightPeersOnHover,
    setHighlightPeersOnHover,
    highlightSameNumber,
    setHighlightSameNumber,
    showRemaining,
    setShowRemaining,
  } = useConfig()

  const assists = [
    {
      label: 'Peers',
      title: 'Highlight the row, column and box of the hovered square',
      checked: highlightPeersOnHover,
      onChange: setHighlightPeersOnHover,
    },
    {
      label: 'Matches',
      title: 'Highlight every square holding the same number',
      checked: highlightSameNumber,
      onChange: setHighlightSameNumber,
    },
    {
      label: 'Remaining',
      title: 'Show how many of each number are still missing',
      checked: showRemaining,
      onChange: setShowRemaining,
    },
  ]

  return (
    <div
      role="group"
      aria-label="Board assists"
      className={cn('flex flex-wrap items-center gap-1', className)}
    >
      {assists.map(({ label, title, checked, onChange }) => (
        <ToggleButton
          key={label}
          size="sm"
          title={title}
          checked={checked}
          onChange={(e) => onChange(e.currentTarget.checked)}
        >
          {label}
        </ToggleButton>
      ))}
    </div>
  )
}
