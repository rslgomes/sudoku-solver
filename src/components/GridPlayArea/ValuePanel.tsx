import { forwardRef, memo } from 'react'
import type { ColorKey, UIInputMode } from '../../libs/types'
import ColorBadge from './ColorBadge'
import DigitBadge from './DigitBadge'

interface ValuePanelProps {
  mode: UIInputMode
  value: number | string | boolean | null
  handleValue: (value: number | string | boolean | null) => void
}

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const
const COLORS = [
  'bg-red-02',
  'bg-orange-02',
  'bg-yellow-02',
  'bg-green-02',
  'bg-blue-02',
  'none',
] as const

const ValuePanel = memo(
  forwardRef<HTMLDivElement, ValuePanelProps>(function ValuePanel(
    { mode, value, handleValue },
    ref
  ) {
    return (
      <div
        ref={ref}
        className="flex items-center justify-center gap-2 px-6 w-full bg-secondary-bg1/20 border border-border rounded-sm min-h-20"
      >
        {(mode === 'pencil' || mode === 'pen') && (
          <>
            {DIGITS.map((digit) => (
              <DigitBadge
                key={digit}
                digit={digit}
                value={value}
                onClick={() => handleValue(digit)}
              />
            ))}
          </>
        )}

        {mode === 'color' && (
          <>
            {COLORS.map((color) => (
              <ColorBadge
                key={color}
                color={color as ColorKey}
                selected={color === value}
                onClick={() =>
                  handleValue(color === value ? null : (color as ColorKey))
                }
              />
            ))}
          </>
        )}

        {mode === 'clear' && (
          <p className="text-lg text-primary-fg2">Select squares to clear</p>
        )}
        {mode === 'lock' && (
          <p className="text-lg text-primary-fg2">
            Click on squares to lock or unlock them
          </p>
        )}
      </div>
    )
  })
)

ValuePanel.displayName = 'ValuePanel'
export default ValuePanel
