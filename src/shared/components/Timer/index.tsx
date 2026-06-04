import { useConfig } from '../PlayableGrid/contexts/configContext'
import { useGrid } from '../PlayableGrid/contexts/gridContext'
import useGridMeta from '../PlayableGrid/hooks/useGridMeta'
import LedNumber, { type DIGIT } from './LedNumber'

export default function Timer() {
  const { grid, timer } = useGrid()
  const { showTimer } = useConfig()
  const { isSolved } = useGridMeta(grid)
  if (isSolved) timer.pauseTimer()
  const { minutes, seconds } = timer.value ?? { minutes: '00', seconds: '00' }
  if (!showTimer) return null
  return (
    <div className="px-2 py-1 bg-led-bg">
      <span className="sr-only">
        {minutes}:{seconds}
      </span>
      <div aria-hidden className="flex justify-between items-center gap-2">
        {minutes.split('').map((n, i) => (
          <LedNumber
            key={i}
            number={Number(n) as DIGIT}
            className="h-8"
            colors={{ on: 'var(--color-led-on)', off: 'var(--color-led-off)' }}
          />
        ))}
        <span className="font-style text-sm text-led-on">:</span>
        {seconds.split('').map((n, i) => (
          <LedNumber
            key={i}
            number={Number(n) as DIGIT}
            className="h-8"
            colors={{ on: 'var(--color-led-on)', off: 'var(--color-led-off)' }}
          />
        ))}
      </div>
    </div>
  )
}
