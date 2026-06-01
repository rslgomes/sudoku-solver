import PuzzleGrid from './PuzzleGrid'
import Toolbox from './Toolbox'
import Pad from './Pad'

export type { PlayableGridProps } from './types'

export default function PlayableGrid() {
  return (
    <div className="grid gap-2 w-full max-w-lg mx-auto p-4 grid-cols-[1fr_auto] [grid-template-areas:'puzzle_toolbox'_'pad_pad']">
      <div className="[grid-area:puzzle]">
        <PuzzleGrid />
      </div>

      <div className="[grid-area:toolbox] pl-2">
        <Toolbox />
      </div>

      <div className="[grid-area:pad] pt-1">
        <Pad />
      </div>
    </div>
  )
}
